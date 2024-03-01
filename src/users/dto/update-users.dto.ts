import { PartialType } from '@nestjs/mapped-types';
import { PrimaryGeneratedColumn } from 'typeorm';
import { CreateUsersDto } from './create-users.dto';

export class UpdateUsersDto extends PartialType(CreateUsersDto) {
  @PrimaryGeneratedColumn()
  id: number;
}
