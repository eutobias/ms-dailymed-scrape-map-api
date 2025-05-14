import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PasswordUtils } from '../../../../shared/infrastructure/utils/password.utils';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: EntityRepository<User>,
    private readonly passwordUtils: PasswordUtils,
  ) {}

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({ username });
  }

  async create(data: User): Promise<User> {
    if (data.password) {
      data.password = await this.passwordUtils.hashPassword(data.password);
    }

    const user = this.repository.create(data);
    await this.repository.insert(user);
    return user;
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.password) {
      data.password = await this.passwordUtils.hashPassword(data.password);
    }

    this.repository.assign(user, data);
    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.repository.nativeDelete(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.findAll();
  }
}
