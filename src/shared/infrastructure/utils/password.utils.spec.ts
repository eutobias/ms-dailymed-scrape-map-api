import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordUtils } from './password.utils';

jest.mock('bcrypt');

describe('PasswordUtils', () => {
  let service: PasswordUtils;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordUtils,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PasswordUtils>(PasswordUtils);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password with salt and extra hash', async () => {
      const password = 'testpassword';
      const extraHash = 'extraHashValue';
      const salt = 'generatedSalt';
      const hashedPassword = 'hashedPassword';

      configService.get.mockReturnValue(extraHash);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(configService.get).toHaveBeenCalledWith('passwordHash');
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password + extraHash, salt);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const password = 'testpassword';
      const hash = 'hashedPassword';
      const extraHash = 'extraHashValue';

      configService.get.mockReturnValue(extraHash);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePassword(password, hash);

      expect(configService.get).toHaveBeenCalledWith('passwordHash');
      expect(bcrypt.compare).toHaveBeenCalledWith(password + extraHash, hash);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'wrongpassword';
      const hash = 'hashedPassword';
      const extraHash = 'extraHashValue';

      configService.get.mockReturnValue(extraHash);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePassword(password, hash);

      expect(configService.get).toHaveBeenCalledWith('passwordHash');
      expect(bcrypt.compare).toHaveBeenCalledWith(password + extraHash, hash);
      expect(result).toBe(false);
    });
  });
});
