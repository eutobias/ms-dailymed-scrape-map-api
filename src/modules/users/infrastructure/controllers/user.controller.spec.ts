import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { AccessLevelGuard } from '../../../auth/infrastructure/guards/access-level.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AccessLevelGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        accesslevel: 1,
      };

      const expectedResponse: UserResponseDto = {
        id: 1,
        username: 'testuser',
        accesslevel: 1,
      };

      // @ts-expect-error Testing output
      userService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const expectedResponse: UserResponseDto = {
        id: 1,
        username: 'testuser',
        accesslevel: 1,
      };

      userService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById(1);

      expect(result).toEqual(expectedResponse);
      expect(userService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedResponse: UserResponseDto[] = [
        {
          id: 1,
          username: 'testuser1',
          accesslevel: 1,
        },
        {
          id: 2,
          username: 'testuser2',
          accesslevel: 2,
        },
      ];

      userService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResponse);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      const expectedResponse: UserResponseDto = {
        id: 1,
        username: 'updateduser',
        accesslevel: 1,
      };

      // @ts-expect-error testing output
      userService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(expectedResponse);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      userService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(userService.delete).toHaveBeenCalledWith(1);
    });
  });
});
