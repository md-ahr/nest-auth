import { Body, Controller, Post } from '@nestjs/common';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() createUsersDto: CreateUsersDto) {
    return this.authService.login(createUsersDto);
  }

  @Post('register')
  register(@Body() createUsersDto: CreateUsersDto) {
    return this.authService.register(createUsersDto);
  }
}
