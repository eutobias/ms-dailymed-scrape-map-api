import { EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from './user.repository';
import { PasswordUtils } from '../../../../shared/infrastructure/utils/password.utils';

describe('UserRepository', () => {
  let repository: UserRepository;
  let entityRepository: jest.Mocked<EntityRepository<User>>;
  let passwordUtils: jest.Mocked<PasswordUtils>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            assign: jest.fn(),
            nativeDelete: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: PasswordUtils,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    entityRepository = module.get(getRepositoryToken(User));
    passwordUtils = module.get(PasswordUtils);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1 } as User;
      entityRepository.findOne.mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(result).toEqual(mockUser);
      expect(entityRepository.findOne).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null when user not found', async () => {
      entityRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(1);

      expect(result).toBeNull();
      expect(entityRepository.findOne).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      const mockUser = { username: 'testuser' } as User;
      entityRepository.findOne.mockResolvedValue(mockUser);

      const result = await repository.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(entityRepository.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('should return null when user not found', async () => {
      entityRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByUsername('testuser');

      expect(result).toBeNull();
      expect(entityRepository.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });
  });

  describe('create', () => {
    it('should hash password and create a user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
      } as User;
      const hashedPassword = 'hashed_password';
      const createdUser = { ...userData, password: hashedPassword } as User;

      passwordUtils.hashPassword.mockResolvedValue(hashedPassword);
      entityRepository.create.mockReturnValue(createdUser);
      // @ts-expect-error mock value
      entityRepository.insert.mockResolvedValue(undefined);

      const result = await repository.create(userData);

      expect(entityRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(entityRepository.insert).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should not hash password if not provided', async () => {
      const userData = { username: 'testuser' } as User;
      const createdUser = { ...userData } as User;

      entityRepository.create.mockReturnValue(createdUser);

      // @ts-expect-error mock value
      entityRepository.insert.mockResolvedValue(undefined);

      const result = await repository.create(userData);

      expect(passwordUtils.hashPassword).not.toHaveBeenCalled();
      expect(entityRepository.create).toHaveBeenCalledWith(userData);
      expect(entityRepository.insert).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update user with hashed password', async () => {
      const userId = 1;
      const userData = { password: 'newpassword' };
      const existingUser = { id: userId, username: 'testuser' } as User;
      const hashedPassword = 'hashed_newpassword';
      const updatedUser = { ...existingUser, password: hashedPassword } as User;

      jest.spyOn(repository, 'findById').mockResolvedValue(existingUser);
      passwordUtils.hashPassword.mockResolvedValue(hashedPassword);
      entityRepository.assign.mockImplementation((target, source) => {
        Object.assign(target, source);
        return target as User;
      });

      const result = await repository.update(userId, userData);

      expect(repository.findById).toHaveBeenCalledWith(userId);

      expect(entityRepository.assign).toHaveBeenCalledWith(existingUser, {
        password: hashedPassword,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update user without password', async () => {
      const userId = 1;
      const userData = { username: 'newusername' };
      const existingUser = { id: userId, username: 'testuser' } as User;
      const updatedUser = { ...existingUser, ...userData } as User;

      jest.spyOn(repository, 'findById').mockResolvedValue(existingUser);
      entityRepository.assign.mockImplementation((target, source) => {
        Object.assign(target, source);
        return target as User;
      });

      const result = await repository.update(userId, userData);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(passwordUtils.hashPassword).not.toHaveBeenCalled();
      expect(entityRepository.assign).toHaveBeenCalledWith(
        existingUser,
        userData,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      const userId = 1;
      const userData = { username: 'newusername' };

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(repository.update(userId, userData)).rejects.toThrow(
        'User not found',
      );
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(entityRepository.assign).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userId = 1;
      const existingUser = { id: userId } as User;

      jest.spyOn(repository, 'findById').mockResolvedValue(existingUser);

      // @ts-expect-error mock value
      entityRepository.nativeDelete.mockResolvedValue(undefined);

      await repository.delete(userId);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(entityRepository.nativeDelete).toHaveBeenCalledWith(existingUser);
    });

    it('should throw error when user not found', async () => {
      const userId = 1;

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(repository.delete(userId)).rejects.toThrow('User not found');
      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(entityRepository.nativeDelete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ] as User[];

      entityRepository.findAll.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
      expect(entityRepository.findAll).toHaveBeenCalled();
    });
  });
});
