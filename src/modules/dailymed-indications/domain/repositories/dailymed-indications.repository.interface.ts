import { DailyMedIndications } from '../entities/dailymed-indications.entity';

export interface IDailyMedIdicationsRepository {
  findById(id: number): Promise<DailyMedIndications | null>;
  create(
    DailyMedIndications: DailyMedIndications,
  ): Promise<DailyMedIndications>;
  update(
    id: number,
    data: Partial<DailyMedIndications>,
  ): Promise<DailyMedIndications>;
  delete(id: number): Promise<void>;
  findAll(query?: string): Promise<DailyMedIndications[]>;
}
