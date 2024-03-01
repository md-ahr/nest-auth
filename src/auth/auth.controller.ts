import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import * as xss from 'xss';
import { AuthService } from './auth.service';

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
    const { success, message, payload } =
      await this.authService.login(createUsersDto);
    res
      .cookie('access_token', payload.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 1000), // 1 day
      })
      .send({
        success,
        message,
        payload: {
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
        },
      });
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
    const { success, message, payload } = await this.authService.register(body);
    res
      .cookie('access_token', payload.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1 * 24 * 60 * 1000), // 1 day
      })
      .send({
        success,
        message,
        payload: {
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
        },
      });
  }
}
