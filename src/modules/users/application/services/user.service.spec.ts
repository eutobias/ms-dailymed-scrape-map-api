import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUsername: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData = {
        username: 'test',
        password: 'password',
        accesslevel: 1,
      } as User;
      const createdUser = { id: 1, ...userData } as User;

      repository.create.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(result).toEqual(createdUser);
      expect(repository.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('findById', () => {
    it('should return a user without password', async () => {
      const user = {
        id: 1,
        username: 'test',
        password: 'password',
        accesslevel: 1,
      } as User;

      repository.findById.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual({
        id: user.id,
        username: user.username,
        accesslevel: user.accesslevel,
      });
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findByUsername', () => {
    it('should return a user with password', async () => {
      const user = {
        id: 1,
        username: 'test',
        password: 'password',
        accesslevel: 1,
      } as User;

      repository.findByUsername.mockResolvedValue(user);

      const result = await service.findByUsername('test');

      expect(result).toEqual(user);
      expect(repository.findByUsername).toHaveBeenCalledWith('test');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findByUsername.mockResolvedValue(null);

      await expect(service.findByUsername('test')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findByUsername).toHaveBeenCalledWith('test');
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        { id: 1, username: 'test1', password: 'password1', accesslevel: 1 },
        { id: 2, username: 'test2', password: 'password2', accesslevel: 2 },
      ] as User[];

      repository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual([
        { id: 1, username: 'test1', accesslevel: 1 },
        { id: 2, username: 'test2', accesslevel: 2 },
      ]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userData = { username: 'updated' };
      const updatedUser = {
        id: 1,
        username: 'updated',
        password: 'password',
        accesslevel: 1,
      } as User;

      repository.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, userData);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(1, userData);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      repository.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
