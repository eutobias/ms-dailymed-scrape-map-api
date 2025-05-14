import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { firstValueFrom } from 'rxjs';
import { IndicationDto } from '../dto/indication.dto';

@Injectable()
export class ScrapeIndicationsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private async fetchPage(): Promise<string> {
    const url = this.configService.get('indications.url') as string;
    const request = await firstValueFrom(this.httpService.get(url));

    return request.data as string;
  }

  readScrapedData() {
    try {
      const filePath = this.configService.get('indications.filename') as string;
      const file = readFileSync(filePath, 'utf-8');

      if (!file) return null;

      return JSON.parse(file);
    } catch {
      return null;
    }
  }

  private scrapedDataExpired() {
    try {
      const filePath = this.configService.get('indications.filename') as string;
      const file = statSync(filePath);
      if (!file) return true;

      const data = this.readScrapedData();
      if (!data) return true;

      const expiration = Date.now();
      return data.expiration < expiration;
    } catch {
      return true;
    }
  }

  private parseScrapeData(scrapedData: string) {
    const $ = cheerio.load(scrapedData);
    const data = $.extract({
      title: [
        {
          selector: 'div[data-sectioncode="34067-9"] h2',
        },
      ],
      text: [
        {
          selector: 'div[data-sectioncode="34067-9"] h2 + p',
        },
      ],
    });

    return data?.title.map((item, index) => ({
      id: index + 1,
      title: item.replace(/\d.\d?/, '').trim(),
      text: data?.text[index].replace(/\[.*\]/, '').trim(),
    }));
  }

  private storeScrapedData(data: IndicationDto[]) {
    const text = JSON.stringify(
      {
        data,
        expiration: Date.now() + 1000 * 60 * 60 * 24 * 7,
      },
      null,
      2,
    );
    const filePath = this.configService.get('indications.filename') as string;
    writeFileSync(filePath, text);
  }

  async execute() {
    if (!this.scrapedDataExpired()) return false;

    const page = await this.fetchPage();
    const data = this.parseScrapeData(page);
    this.storeScrapedData(data);

    return true;
  }
}
