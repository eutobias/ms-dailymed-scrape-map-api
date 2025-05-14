import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskRunnerService } from './task-runner.service';
import { IndicationEvents } from '../../domain/enums/indication-events.enum';

describe('TaskRunnerService', () => {
  let service: TaskRunnerService;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskRunnerService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskRunnerService>(TaskRunnerService);
    eventEmitter = module.get<jest.Mocked<EventEmitter2>>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should call runTask when application bootstraps', () => {
      const runTaskSpy = jest.spyOn(service, 'runTask');

      service.onApplicationBootstrap();

      expect(runTaskSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('runTask', () => {
    it('should emit SCRAPE_INDICATIONS event', () => {
      service.runTask();

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        IndicationEvents.SCRAPE_INDICATIONS,
      );
    });
  });
});
