import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUsersDto } from './../users/dto/create-users.dto';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUsersDto: CreateUsersDto): Promise<any> {
    const userExists = await this.usersService.findByEmail(
      createUsersDto.email,
    );
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
    const hash = await this.hashData(createUsersDto?.password);
    const user = {
      ...createUsersDto,
      password: hash,
    };
    const createdUser = await this.usersService.create(user);
    const tokens = await this.getTokens(createdUser.id, createdUser.email);
    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);
    return tokens;
  }

  async login(createUsersDto: CreateUsersDto): Promise<any> {
    const user = await this.usersService.findByEmail(createUsersDto?.email);
    const isPasswordMatch = await bcrypt.compare(
      createUsersDto?.password,
      user?.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email or password does not match');
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const refreshTokenMatches = await bcrypt.compare(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
