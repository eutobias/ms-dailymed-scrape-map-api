import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessLevelGuard } from './access-level.guard';

describe('AccessLevelGuard', () => {
  let guard: AccessLevelGuard;
  let reflector: jest.Mocked<Reflector>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessLevelGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AccessLevelGuard>(AccessLevelGuard);
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: jest.Mocked<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
      } as unknown as jest.Mocked<ExecutionContext>;

      configService.get.mockReturnValue('jwt-secret');

      // @ts-expect-error - Testing token
      jwtService.verify.mockReturnValue(true);
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      mockRequest.headers.authorization = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      // @ts-expect-error - Testing invalid token
      jwtService.verify.mockReturnValue(false);

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'jwt-secret',
      });
    });

    it('should throw UnauthorizedException when access level is less than 1', () => {
      jwtService.decode.mockReturnValue({ accesslevel: 0 });

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when access level is less than required', () => {
      jwtService.decode.mockReturnValue({ accesslevel: 1 });
      reflector.get.mockReturnValue(2);

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(reflector.get).toHaveBeenCalledWith(
        'accessLevel',
        mockContext.getHandler(),
      );
    });

    it('should return true when access level is equal to required', () => {
      jwtService.decode.mockReturnValue({ accesslevel: 2 });
      reflector.get.mockReturnValue(2);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should return true when access level is greater than required', () => {
      jwtService.decode.mockReturnValue({ accesslevel: 3 });
      reflector.get.mockReturnValue(2);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should extract token correctly from authorization header', () => {
      jwtService.decode.mockReturnValue({ accesslevel: 2 });
      reflector.get.mockReturnValue(1);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should handle non-Bearer authorization header', () => {
      mockRequest.headers.authorization = 'Basic some-token';

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
