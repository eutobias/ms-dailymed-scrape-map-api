import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailymedIndicationsController } from './dailymed-indications.controller';
import { ScrapeIndicationsService } from '../../application/services/scrape-indications.service';
import { MappingIndicationsService } from '../../application/services/mapping-indications.service';
import { IndicationEvents } from '../../domain/enums/indication-events.enum';

describe('DailymedIndicationsController', () => {
  let controller: DailymedIndicationsController;
  let scrapeService: jest.Mocked<ScrapeIndicationsService>;
  let mappingService: jest.Mocked<MappingIndicationsService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailymedIndicationsController],
      providers: [
        {
          provide: ScrapeIndicationsService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: MappingIndicationsService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DailymedIndicationsController>(
      DailymedIndicationsController,
    );
    scrapeService = module.get<jest.Mocked<ScrapeIndicationsService>>(
      ScrapeIndicationsService,
    );
    mappingService = module.get<jest.Mocked<MappingIndicationsService>>(
      MappingIndicationsService,
    );
    eventEmitter = module.get<jest.Mocked<EventEmitter2>>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('scrapeIndications', () => {
    it('should call scrapeIndicationsService.execute', async () => {
      scrapeService.execute.mockResolvedValue(false);

      await controller.scrapeIndications();

      expect(scrapeService.execute).toHaveBeenCalled();
    });

    it('should emit MAP_INDICATIONS event when scrape is successful', async () => {
      scrapeService.execute.mockResolvedValue(true);

      await controller.scrapeIndications();

      expect(scrapeService.execute).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        IndicationEvents.MAP_INDICATIONS,
      );
    });

    it('should not emit MAP_INDICATIONS event when scrape is not successful', async () => {
      scrapeService.execute.mockResolvedValue(false);

      await controller.scrapeIndications();

      expect(scrapeService.execute).toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('mapIndications', () => {
    it('should call mappingIndicationsService.execute', () => {
      controller.mapIndications();

      expect(mappingService.execute).toHaveBeenCalled();
    });
  });
});
