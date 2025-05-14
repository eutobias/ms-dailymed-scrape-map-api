import { Controller } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import { MappingIndicationsService } from '../../application/services/mapping-indications.service';
import { ScrapeIndicationsService } from '../../application/services/scrape-indications.service';
import { IndicationEvents } from '../../domain/enums/indication-events.enum';

@ApiTags('DailyMed Indications')
@Controller('api/v1/dailymed-indications')
export class DailymedIndicationsController {
  constructor(
    private readonly scrapeIndicationsService: ScrapeIndicationsService,
    private readonly mappingIndicationsService: MappingIndicationsService,
    private readonly eventEmitterService: EventEmitter2,
  ) {}

  @OnEvent(IndicationEvents.SCRAPE_INDICATIONS)
  async scrapeIndications() {
    const result = await this.scrapeIndicationsService.execute();
    if (result) this.eventEmitterService.emit(IndicationEvents.MAP_INDICATIONS);
  }

  @OnEvent(IndicationEvents.MAP_INDICATIONS)
  mapIndications() {
    this.mappingIndicationsService.execute();
  }
}
