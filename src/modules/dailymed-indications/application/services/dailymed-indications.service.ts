import { Inject, Injectable } from '@nestjs/common';
import { IDailyMedIdicationsRepository } from '../../domain/repositories/dailymed-indications.repository.interface';
import { DailyMedIndications } from '../../domain/entities/dailymed-indications.entity';

@Injectable()
export class DailymedIndicationsService {
  constructor(
    @Inject('IDailyMedIdicationsRepository')
    private readonly dailyMedIdicationsRepository: IDailyMedIdicationsRepository,
  ) {}

  async findById(id: number): Promise<DailyMedIndications | null> {
    return await this.dailyMedIdicationsRepository.findById(id);
  }

  async create(data: DailyMedIndications): Promise<DailyMedIndications> {
    return await this.dailyMedIdicationsRepository.create(data);
  }

  async update(
    id: number,
    data: Partial<DailyMedIndications>,
  ): Promise<DailyMedIndications> {
    return await this.dailyMedIdicationsRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return await this.dailyMedIdicationsRepository.delete(id);
  }

  async reset(): Promise<void> {
    const data = await this.dailyMedIdicationsRepository.findAll();

    Promise.allSettled(
      data.map((item) => {
        this.dailyMedIdicationsRepository.delete(item.id as number);
      }),
    ).then(() => {
      Promise.resolve();
    });
  }

  async findAll(query: string): Promise<DailyMedIndications[]> {
    return await this.dailyMedIdicationsRepository.findAll(query);
  }
}
