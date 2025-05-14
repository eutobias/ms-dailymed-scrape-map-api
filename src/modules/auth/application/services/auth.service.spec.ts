import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../../../users/application/services/user.service';
import { PasswordUtils } from '../../../../shared/infrastructure/utils/password.utils';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../../users/domain/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let passwordUtils: jest.Mocked<PasswordUtils>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PasswordUtils,
          useValue: {
            comparePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    passwordUtils = module.get(PasswordUtils);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        accesslevel: 100,
      } as User;

      userService.findByUsername.mockResolvedValue(mockUser);
      passwordUtils.comparePassword.mockResolvedValue(true);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        accesslevel: mockUser.accesslevel,
      });
      expect(userService.findByUsername).toHaveBeenCalledWith(
        loginDto.username,
      );
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const loginDto: LoginDto = {
        username: 'nonexistent',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        accesslevel: 50,
      } as User;

      userService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(userService.findByUsername).toHaveBeenCalledWith(
        loginDto.username,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        accesslevel: 50,
      } as User;

      userService.findByUsername.mockResolvedValue(mockUser);
      passwordUtils.comparePassword.mockResolvedValue(false);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(userService.findByUsername).toHaveBeenCalledWith(
        loginDto.username,
      );
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });
  });

  describe('login', () => {
    it('should return JWT token when login is successful', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const userData = {
        id: 1,
        username: 'testuser',
        accesslevel: 100,
      };
      const mockToken = 'jwt.token.here';
      const mockJwtHash = 'secret-hash';

      jest.spyOn(service, 'validateUser').mockResolvedValue(userData);
      configService.get.mockReturnValue(mockJwtHash);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: mockToken });
      expect(service.validateUser).toHaveBeenCalledWith(loginDto);
      expect(configService.get).toHaveBeenCalledWith('jwtHash');
      expect(jwtService.sign).toHaveBeenCalledWith(userData, {
        secret: mockJwtHash,
      });
    });

    it('should propagate errors from validateUser', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      jest.spyOn(service, 'validateUser').mockImplementation(() => {
        throw new UnauthorizedException('Invalid credentials');
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(service.validateUser).toHaveBeenCalledWith(loginDto);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
