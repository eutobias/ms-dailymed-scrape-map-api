import { EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DailyMedIndications } from '../../domain/entities/dailymed-indications.entity';
import { DailyMedIdicationsRepository } from './dailymed-indications.repository';

describe('DailyMedIdicationsRepository', () => {
  let repository: DailyMedIdicationsRepository;
  let entityRepository: jest.Mocked<EntityRepository<DailyMedIndications>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyMedIdicationsRepository,
        {
          provide: getRepositoryToken(DailyMedIndications),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            assign: jest.fn(),
            nativeDelete: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<DailyMedIdicationsRepository>(
      DailyMedIdicationsRepository,
    );
    entityRepository = module.get(getRepositoryToken(DailyMedIndications));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return an indication when found', async () => {
      const mockIndication = { id: 1 } as DailyMedIndications;
      entityRepository.findOne.mockResolvedValue(mockIndication);

      const result = await repository.findById(1);

      expect(result).toEqual(mockIndication);
      expect(entityRepository.findOne).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when indication not found', async () => {
      entityRepository.findOne.mockResolvedValue(null);

      await expect(repository.findById(1)).rejects.toThrow(NotFoundException);
      expect(entityRepository.findOne).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('create', () => {
    it('should create and return a new indication', async () => {
      const mockData = { indication: 'Test' } as DailyMedIndications;
      const mockCreated = { id: 1, ...mockData } as DailyMedIndications;

      entityRepository.create.mockReturnValue(mockCreated);
      entityRepository.insert.mockResolvedValue(Promise.resolve(1));

      const result = await repository.create(mockData);

      expect(result).toEqual(mockCreated);
      expect(entityRepository.create).toHaveBeenCalledWith(mockData);
      expect(entityRepository.insert).toHaveBeenCalledWith(mockData);
    });
  });

  describe('update', () => {
    it('should update and return the indication', async () => {
      const mockIndication = {
        id: 1,
        indication: 'Original',
      } as DailyMedIndications;
      const mockUpdate = { indication: 'Updated' };
      const mockUpdated = { ...mockIndication, ...mockUpdate };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockIndication);
      entityRepository.assign.mockImplementation((target, source) => {
        Object.assign(target, source);
        return target as DailyMedIndications;
      });

      const result = await repository.update(1, mockUpdate);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(entityRepository.assign).toHaveBeenCalledWith(
        mockIndication,
        mockUpdate,
      );
      expect(result).toEqual(mockUpdated);
    });

    it('should throw NotFoundException when indication not found', async () => {
      jest.spyOn(repository, 'findById').mockImplementation(() => {
        throw new NotFoundException('DailyMedIndications not found');
      });

      await expect(repository.update(1, {})).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('should delete the indication', async () => {
      const mockIndication = { id: 1 } as DailyMedIndications;

      jest.spyOn(repository, 'findById').mockResolvedValue(mockIndication);
      entityRepository.nativeDelete.mockResolvedValue(Promise.resolve(1));

      await repository.delete(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(entityRepository.nativeDelete).toHaveBeenCalledWith(
        mockIndication,
      );
    });

    it('should throw NotFoundException when indication not found', async () => {
      jest.spyOn(repository, 'findById').mockImplementation(() => {
        throw new NotFoundException('DailyMedIndications not found');
      });

      await expect(repository.delete(1)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return all indications when no query provided', async () => {
      const mockIndications = [
        { id: 1, indication: 'Test 1' },
        { id: 2, indication: 'Test 2' },
      ] as DailyMedIndications[];

      entityRepository.findAll.mockResolvedValue(mockIndications);

      const result = await repository.findAll();

      expect(result).toEqual(mockIndications);
      expect(entityRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should return filtered indications when query provided', async () => {
      const query = 'test';
      const mockIndications = [
        { id: 1, indication: 'Test Indication' },
      ] as DailyMedIndications[];

      entityRepository.findAll.mockResolvedValue(mockIndications);

      const result = await repository.findAll(query);

      expect(result).toEqual(mockIndications);
      expect(entityRepository.findAll).toHaveBeenCalledWith({
        where: {
          $or: [
            { indication: { $like: '%test%' } },
            { description: { $like: '%test%' } },
            { code: { $like: '%test%' } },
          ],
        },
      });
    });
  });
});
