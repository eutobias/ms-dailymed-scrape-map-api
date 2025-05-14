import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { IndicationDto } from '../dto/indication.dto';
import { ScrapedIndicationDataDto } from '../dto/scraped-indication-data.dto';
import { DailymedIndicationsService } from './dailymed-indications.service';
import { MappingIndicationsService } from './mapping-indications.service';
import { ScrapeIndicationsService } from './scrape-indications.service';

jest.mock('groq-sdk', () => {
  const mockGroq = {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'A00',
              },
            },
          ],
        }),
      },
    },
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockGroq),
  };
});

describe('MappingIndicationsService', () => {
  let service: MappingIndicationsService;
  let configService: jest.Mocked<ConfigService>;
  let scrapeService: jest.Mocked<ScrapeIndicationsService>;
  let dailymedService: jest.Mocked<DailymedIndicationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MappingIndicationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
        {
          provide: ScrapeIndicationsService,
          useValue: {
            readScrapedData: jest.fn(),
          },
        },
        {
          provide: DailymedIndicationsService,
          useValue: {
            reset: jest.fn().mockResolvedValue(undefined),
            create: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<MappingIndicationsService>(MappingIndicationsService);
    configService = module.get<jest.Mocked<ConfigService>>(ConfigService);
    scrapeService = module.get<jest.Mocked<ScrapeIndicationsService>>(
      ScrapeIndicationsService,
    );
    dailymedService = module.get<jest.Mocked<DailymedIndicationsService>>(
      DailymedIndicationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapIndications', () => {
    it('should return mapped indication with ICD-10 code', async () => {
      const mockIndication: IndicationDto = {
        title: 'Hypertension',
        text: 'High blood pressure',
      };

      const result = await service.mapIndications(mockIndication);

      expect(result).toEqual({ content: 'A00' });
    });
  });

  describe('execute', () => {
    it('should process scraped data and create indications', async () => {
      const mockData: ScrapedIndicationDataDto = {
        data: [
          { title: 'Hypertension', text: 'High blood pressure' },
          { title: 'Diabetes', text: 'Type 2 diabetes mellitus' },
        ],
        expiration: new Date().toString(),
      };

      scrapeService.readScrapedData.mockReturnValue(mockData);

      await service.execute();

      expect(scrapeService.readScrapedData).toHaveBeenCalled();

      await new Promise(process.nextTick);

      expect(dailymedService.create).toHaveBeenCalledTimes(2);
    });

    it('should not process when no data is available', async () => {
      scrapeService.readScrapedData.mockReturnValue({ data: [] });

      await service.execute();

      expect(scrapeService.readScrapedData).toHaveBeenCalled();
      expect(dailymedService.reset).not.toHaveBeenCalled();
      expect(dailymedService.create).not.toHaveBeenCalled();
    });

    it('should handle null data gracefully', async () => {
      scrapeService.readScrapedData.mockReturnValue(null);

      await service.execute();

      expect(scrapeService.readScrapedData).toHaveBeenCalled();
      expect(dailymedService.reset).not.toHaveBeenCalled();
      expect(dailymedService.create).not.toHaveBeenCalled();
    });
  });
});
