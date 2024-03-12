import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import * as xss from 'xss';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 6, ttl: 60000 } }) // per minute maximum 6 requests (10s per request)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body(new ValidationPipe())
    createUsersDto: CreateUsersDto,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(createUsersDto);
    const oneDayMs = 1 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + oneDayMs),
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + thirtyDaysMs),
      })
      .send({ accessToken, refreshToken });
  }

  @Post('register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body(new ValidationPipe()) createUsersDto: CreateUsersDto,
  ) {
    const body = {
      ...createUsersDto,
      name: xss.escapeHtml(createUsersDto?.name),
    };
    const { accessToken, refreshToken } = await this.authService.register(body);
    const oneDayMs = 1 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + oneDayMs),
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + thirtyDaysMs),
      })
      .send({ accessToken, refreshToken });
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
