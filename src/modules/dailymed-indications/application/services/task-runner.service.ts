import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IndicationEvents } from '../../domain/enums/indication-events.enum';

@Injectable()
export class TaskRunnerService implements OnApplicationBootstrap {
  constructor(private readonly eventEmitterService: EventEmitter2) {}

  onApplicationBootstrap() {
    this.runTask();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  runTask() {
    this.eventEmitterService.emit(IndicationEvents.SCRAPE_INDICATIONS);
  }
}
