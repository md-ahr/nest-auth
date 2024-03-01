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
    const isPasswordMatch = await bcrypt.compare(
      createUsersDto?.password,
      user?.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email or password does not match');
    }
    const payload = { userId: user.id, name: user.name, email: user.email };
    return {
      success: true,
      message: 'User logged in successfully',
      payload: {
        ...payload,
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }

  async register(createUsersDto: CreateUsersDto): Promise<any> {
    const user = {
      ...createUsersDto,
      password: await bcrypt.hash(createUsersDto?.password, 10),
    };
    const createdUser = await this.usersService.create(user);
    const payload = {
      userId: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
    return {
      success: true,
      message: 'User registered successfully',
      payload: {
        ...payload,
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }
}
