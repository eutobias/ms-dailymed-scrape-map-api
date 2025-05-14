import { PartialType } from '@nestjs/swagger';
import { CreateDailyMedIndicationsDto } from './create-dailymed-indications.dto';

export class UpdateDailyMedIndicationsDto extends PartialType(
  CreateDailyMedIndicationsDto,
) {}
