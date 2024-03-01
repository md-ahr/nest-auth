import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsersDto } from './dto/create-users.dto';
import { Users } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async create(createUsersDto: CreateUsersDto) {
    return this.usersRepository.save(createUsersDto);
  }

  async findAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<Users | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: number, body: { name: string; email: string }) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User not found with this id ${id}`);
    }
    return this.usersRepository.update({ id }, body);
  }

  async remove(id: number): Promise<any> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User not found with this id ${id}`);
    }
    return this.usersRepository.delete({ id });
  }
}
