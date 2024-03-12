import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Column } from 'typeorm';

export class CreateUsersDto {
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @Length(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Password must contain at least one letter, one number, and one special character.',
  })
  password: string;

  @Column()
  @IsOptional()
  refreshToken: string;
}
