import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUsersDto } from './../users/dto/create-users.dto';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(createUsersDto: CreateUsersDto): Promise<any> {
    const user = await this.usersService.findByEmail(createUsersDto?.email);
    if (user?.password !== createUsersDto?.password) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email };
    return {
      success: true,
      message: 'User logged in successfully',
      payload,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(createUsersDto: CreateUsersDto): Promise<any> {
    const user = {
      ...createUsersDto,
      password: await bcrypt.hash(createUsersDto?.password, 10),
    };
    await this.usersService.create(user);
    return {
      success: true,
      message: 'User registered successfully',
      payload: { name: user?.name, email: user?.email },
    };
  }
}
