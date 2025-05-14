import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  private userWithoutPassword(user: User): Omit<User, 'password'> {
    return {
      id: user.id,
      username: user.username,
      accesslevel: user.accesslevel,
    };
  }

  async create(userData: User): Promise<User> {
    return await this.userRepository.create(userData);
  }

  async findById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not fount');
    }
    return this.userWithoutPassword(user);
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not fount');
    }
    return user;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return (await this.userRepository.findAll()).map((user) =>
      this.userWithoutPassword(user),
    );
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    return await this.userRepository.update(id, userData);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
