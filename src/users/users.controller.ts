import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import * as xss from 'xss';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body(new ValidationPipe()) createUsersDto: CreateUsersDto) {
    return this.usersService.create(createUsersDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe())
    updateUsersDto: UpdateUsersDto,
  ) {
    const body = {
      name: xss.escapeHtml(updateUsersDto?.name),
      email: updateUsersDto?.email,
    };
    return this.usersService.update(id, body);
  }

  @UseGuards(AuthGuard)
  @Patch('password/reset')
  resetPassword(@Body() oldPassword: string) {
    /**
     * TODO: implement reset password functionality
     */
    return `reset password ${oldPassword}`;
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
