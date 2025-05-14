import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PasswordUtils } from 'src/shared/infrastructure/utils/password.utils';
import { AuthService } from '../auth/application/services/auth.service';
import { UsersModule } from '../users/users.module';
import { DailymedIndicationsService } from './application/services/dailymed-indications.service';
import { MappingIndicationsService } from './application/services/mapping-indications.service';
import { ScrapeIndicationsService } from './application/services/scrape-indications.service';
import { TaskRunnerService } from './application/services/task-runner.service';
import { DailyMedIndications } from './domain/entities/dailymed-indications.entity';
import { DailymedIndicationsController } from './infrastructure/controllers/dailymed-indications.controller';
import { DailyMedIdicationsRepository } from './infrastructure/persistence/dailymed-indications.repository';
import { ProgramsController } from './infrastructure/controllers/programs.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([DailyMedIndications]),
    ScheduleModule.forRoot(),
    HttpModule,
    UsersModule,
  ],
  providers: [
    TaskRunnerService,
    ScrapeIndicationsService,
    MappingIndicationsService,
    AuthService,
    JwtService,
    PasswordUtils,
    DailymedIndicationsService,
    {
      provide: 'IDailyMedIdicationsRepository',
      useClass: DailyMedIdicationsRepository,
    },
  ],
  controllers: [DailymedIndicationsController, ProgramsController],
  exports: [
    TaskRunnerService,
    DailymedIndicationsService,
    'IDailyMedIdicationsRepository',
  ],
})
export class DailymedIndicationsModule {}
