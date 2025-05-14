import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IndicationDto } from '../dto/indication.dto';
import { ScrapedIndicationDataDto } from '../dto/scraped-indication-data.dto';
import { ScrapeIndicationsService } from './scrape-indications.service';
import { DailyMedIndications } from '../../domain/entities/dailymed-indications.entity';
import { DailymedIndicationsService } from './dailymed-indications.service';

@Injectable()
export class MappingIndicationsService {
  private groq;

  constructor(
    private readonly configService: ConfigService,
    private readonly scrapeIndicationsService: ScrapeIndicationsService,
    private readonly dailymedIndicationsService: DailymedIndicationsService,
  ) {
    this.groq = new Groq({ apiKey: this.configService.get('grokApiKey') });
  }

  async mapIndications(indication: IndicationDto): Promise<unknown> {
    const prompt = `Given the following medical indications, provide the most appropriate ICD-10 code:

    Indication: ${indication.title}
    Description: ${indication.text}

    Return only ICD-10 code without any other information.`;

    const completion = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    let message = '';
    completion.choices.map((item) => (message = item.message));

    return message;
  }

  execute() {
    const indications =
      this.scrapeIndicationsService.readScrapedData() as ScrapedIndicationDataDto;

    if (!indications || indications?.data?.length === 0) return;

    Promise.allSettled(
      indications?.data.map((item) => this.mapIndications(item)),
    ).then(async (results) => {
      await this.dailymedIndicationsService.reset();

      indications.data.map(async (item, index) => {
        const result = results[index];

        if (result.status === 'fulfilled') {
          const indication = new DailyMedIndications();
          indication.indication = item.title;
          indication.description = item.text;
          indication.code = (
            result?.value as Record<'content', string>
          )?.content;

          await this.dailymedIndicationsService.create(indication);
        }
      });
    });
  }
}
