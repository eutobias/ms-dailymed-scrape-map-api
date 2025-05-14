import { Test, TestingModule } from '@nestjs/testing';
import { DailymedIndicationsService } from './dailymed-indications.service';
import { IDailyMedIdicationsRepository } from '../../domain/repositories/dailymed-indications.repository.interface';
import { DailyMedIndications } from '../../domain/entities/dailymed-indications.entity';

describe('DailyMedIndicationsService', () => {
  let service: DailymedIndicationsService;
  let repository: jest.Mocked<IDailyMedIdicationsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailymedIndicationsService,
        {
          provide: 'IDailyMedIdicationsRepository',
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DailymedIndicationsService>(
      DailymedIndicationsService,
    );
    repository = module.get<jest.Mocked<IDailyMedIdicationsRepository>>(
      'IDailyMedIdicationsRepository',
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return an indication by id', async () => {
      const mockIndication = { id: 1 } as DailyMedIndications;
      repository.findById.mockResolvedValue(mockIndication);

      const result = await service.findById(1);
      expect(result).toEqual(mockIndication);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new indication', async () => {
      const mockData = { indication: 'test' } as DailyMedIndications;
      const mockResult = { id: 1, ...mockData } as DailyMedIndications;
      repository.create.mockResolvedValue(mockResult);

      const result = await service.create(mockData);
      expect(result).toEqual(mockResult);
      expect(repository.create).toHaveBeenCalledWith(mockData);
    });
  });

  describe('update', () => {
    it('should update an indication', async () => {
      const mockData = {
        indication: 'updated',
      } as Partial<DailyMedIndications>;
      const mockResult = { id: 1, ...mockData } as DailyMedIndications;
      repository.update.mockResolvedValue(mockResult);

      const result = await service.update(1, mockData);
      expect(result).toEqual(mockResult);
      expect(repository.update).toHaveBeenCalledWith(1, mockData);
    });
  });

  describe('delete', () => {
    it('should delete an indication', async () => {
      repository.delete.mockResolvedValue();

      await service.delete(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return all indications', async () => {
      const mockIndications = [{ id: 1 }, { id: 2 }] as DailyMedIndications[];
      repository.findAll.mockResolvedValue(mockIndications);

      const result = await service.findAll('test');
      expect(result).toEqual(mockIndications);
      expect(repository.findAll).toHaveBeenCalledWith('test');
    });
  });

  describe('reset', () => {
    it('should reset all indications', async () => {
      const mockIndications = [{ id: 1 }, { id: 2 }] as DailyMedIndications[];
      repository.findAll.mockResolvedValue(mockIndications);
      repository.delete.mockResolvedValue();

      await service.reset();
      expect(repository.findAll).toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalledTimes(2);
    });
  });
});
