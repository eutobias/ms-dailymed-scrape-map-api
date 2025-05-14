import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { InternalAxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'node:fs';
import { of } from 'rxjs';
import { ScrapeIndicationsService } from './scrape-indications.service';

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  statSync: jest.fn(),
}));

jest.mock('cheerio', () => {
  return {
    load: jest.fn().mockReturnValue({
      extract: jest.fn(),
    }),
  };
});

describe('ScrapeIndicationsService', () => {
  let service: ScrapeIndicationsService;
  let configService: jest.Mocked<ConfigService>;
  let httpService: jest.Mocked<HttpService>;

  const mockUrl = 'https://example.com/dailymed';
  const mockFilePath = '/path/to/indications.json';
  const mockHtmlContent = '<html><body>Test content</body></html>';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapeIndicationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'indications.url') return mockUrl;
              if (key === 'indications.filename') return mockFilePath;
              return null;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScrapeIndicationsService>(ScrapeIndicationsService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchPage', () => {
    it('should fetch HTML content from the configured URL', async () => {
      httpService.get.mockReturnValue(
        of({
          data: mockHtmlContent,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as InternalAxiosRequestConfig<unknown>,
        }),
      );

      const result = await (service as any).fetchPage();

      expect(httpService.get).toHaveBeenCalledWith(mockUrl);
      expect(result).toBe(mockHtmlContent);
    });
  });

  describe('readScrapedData', () => {
    it('should read and parse JSON data from file', () => {
      const mockData = { data: [], expiration: '2023-01-01' };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));

      const result = service.readScrapedData();

      expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
      expect(result).toEqual(mockData);
    });

    it('should return null if file reading fails', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = service.readScrapedData();

      expect(result).toBeNull();
    });

    it('should return null if file is empty', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      const result = service.readScrapedData();

      expect(result).toBeNull();
    });
  });

  describe('scrapedDataExpired', () => {
    it('should return true if file does not exist', () => {
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = (service as any).scrapedDataExpired();

      expect(result).toBe(true);
    });

    it('should return true if data is null', () => {
      (fs.statSync as jest.Mock).mockReturnValue({});
      jest.spyOn(service, 'readScrapedData').mockReturnValue(null);

      const result = (service as any).scrapedDataExpired();

      expect(result).toBe(true);
    });

    it('should return true if data is expired', () => {
      (fs.statSync as jest.Mock).mockReturnValue({});
      jest.spyOn(service, 'readScrapedData').mockReturnValue({
        expiration: Date.now() - 1000,
      });

      const result = (service as any).scrapedDataExpired();

      expect(result).toBe(true);
    });

    it('should return false if data is not expired', () => {
      (fs.statSync as jest.Mock).mockReturnValue({});
      jest.spyOn(service, 'readScrapedData').mockReturnValue({
        expiration: Date.now() + 1000 * 60 * 60,
      });

      const result = (service as any).scrapedDataExpired();

      expect(result).toBe(false);
    });
  });

  describe('parseScrapeData', () => {
    it('should parse HTML and extract indications', () => {
      const mockExtractedData = {
        title: ['1.1 Hypertension', '1.2 Heart Failure'],
        text: [
          'Treatment of high blood pressure [see Clinical Studies]',
          'Management of heart failure [see Warnings]',
        ],
      };

      (cheerio.load as jest.Mock).mockReturnValue({
        extract: jest.fn().mockReturnValue(mockExtractedData),
      });

      const result = (service as any).parseScrapeData(mockHtmlContent);

      expect(cheerio.load).toHaveBeenCalledWith(mockHtmlContent);
      expect(result).toEqual([
        {
          id: 1,
          title: 'Hypertension',
          text: 'Treatment of high blood pressure',
        },
        {
          id: 2,
          title: 'Heart Failure',
          text: 'Management of heart failure',
        },
      ]);
    });
  });

  describe('execute', () => {
    it('should not scrape if data is not expired', async () => {
      jest.spyOn(service as any, 'scrapedDataExpired').mockReturnValue(false);
      jest.spyOn(service as any, 'fetchPage');
      jest.spyOn(service as any, 'parseScrapeData');
      jest.spyOn(service as any, 'storeScrapedData');

      const result = await service.execute();

      expect(result).toBe(false);
      expect((service as any).fetchPage).not.toHaveBeenCalled();
      expect((service as any).parseScrapeData).not.toHaveBeenCalled();
      expect((service as any).storeScrapedData).not.toHaveBeenCalled();
    });

    it('should scrape and store data if expired', async () => {
      const mockHtml = '<html><body>Test</body></html>';
      const mockParsedData = [
        { id: 1, title: 'Test', text: 'Test description' },
      ];

      jest.spyOn(service as any, 'scrapedDataExpired').mockReturnValue(true);
      jest.spyOn(service as any, 'fetchPage').mockResolvedValue(mockHtml);
      jest
        .spyOn(service as any, 'parseScrapeData')
        .mockReturnValue(mockParsedData);
      jest
        .spyOn(service as any, 'storeScrapedData')
        .mockImplementation(() => {});

      const result = await service.execute();

      expect(result).toBe(true);
      expect((service as any).fetchPage).toHaveBeenCalled();
      expect((service as any).parseScrapeData).toHaveBeenCalledWith(mockHtml);
      expect((service as any).storeScrapedData).toHaveBeenCalledWith(
        mockParsedData,
      );
    });
  });
});
