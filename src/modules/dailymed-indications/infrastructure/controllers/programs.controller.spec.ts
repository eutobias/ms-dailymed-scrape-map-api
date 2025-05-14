import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsController } from './programs.controller';
import { DailymedIndicationsService } from '../../application/services/dailymed-indications.service';
import { DailyMedIndications } from '../../domain/entities/dailymed-indications.entity';
import { DailyMedIndicationsResponseDto } from '../../application/dto/dailymed-indications-response.dto';

describe('ProgramsController', () => {
  let controller: ProgramsController;
  let service: jest.Mocked<DailymedIndicationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramsController],
      providers: [
        {
          provide: DailymedIndicationsService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProgramsController>(ProgramsController);
    service = module.get<jest.Mocked<DailymedIndicationsService>>(
      DailymedIndicationsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findById', () => {
    it('should return a program by id', async () => {
      const mockProgram = {
        indication: 'Test Indication',
        description: 'Test Description',
        code: 'T123',
      } as DailyMedIndications;

      service.findById.mockResolvedValue(mockProgram);

      const result = await controller.findById(1);

      expect(result).toEqual(mockProgram);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return all programs when no query is provided', async () => {
      const mockPrograms = [
        {
          indication: 'Indication 1',
          description: 'Description 1',
          code: 'C1',
        },
        {
          indication: 'Indication 2',
          description: 'Description 2',
          code: 'C2',
        },
      ] as DailyMedIndicationsResponseDto[];

      service.findAll.mockResolvedValue(mockPrograms);

      const result = await controller.findAll('');

      expect(result).toEqual(mockPrograms);
      expect(service.findAll).toHaveBeenCalledWith('');
    });

    it('should return filtered programs when query is provided', async () => {
      const query = 'test';
      const mockPrograms = [
        {
          indication: 'Test Indication',
          description: 'Test Description',
          code: 'T123',
        },
      ] as DailyMedIndicationsResponseDto[];

      service.findAll.mockResolvedValue(mockPrograms);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPrograms);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });
});
