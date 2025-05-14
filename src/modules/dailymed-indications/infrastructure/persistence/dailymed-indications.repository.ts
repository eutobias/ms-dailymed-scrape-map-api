import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DailyMedIndications } from '../../domain/entities/dailymed-indications.entity';
import { IDailyMedIdicationsRepository } from '../../domain/repositories/dailymed-indications.repository.interface';

@Injectable()
export class DailyMedIdicationsRepository
  implements IDailyMedIdicationsRepository
{
  constructor(
    @InjectRepository(DailyMedIndications)
    private readonly repository: EntityRepository<DailyMedIndications>,
  ) {}

  async findById(id: number): Promise<DailyMedIndications> {
    const indication = await this.repository.findOne({ id });

    if (!indication) {
      throw new NotFoundException('DailyMedIndications not found');
    }

    return indication;
  }

  async create(data: DailyMedIndications): Promise<DailyMedIndications> {
    const created = this.repository.create(data);
    await this.repository.insert(data);
    return created;
  }

  async update(
    id: number,
    data: Partial<DailyMedIndications>,
  ): Promise<DailyMedIndications> {
    const DailyMedIndications = await this.findById(id);
    if (!DailyMedIndications) {
      throw new NotFoundException('DailyMedIndications not found');
    }

    this.repository.assign(DailyMedIndications, data);
    return DailyMedIndications;
  }

  async delete(id: number): Promise<void> {
    const DailyMedIndications = await this.findById(id);
    if (!DailyMedIndications) {
      throw new NotFoundException('DailyMedIndications not found');
    }

    await this.repository.nativeDelete(DailyMedIndications);
  }

  async findAll(query?: string): Promise<DailyMedIndications[]> {
    const condition = query
      ? {
          where: {
            $or: [
              { indication: { $like: `%${query}%` } },
              { description: { $like: `%${query}%` } },
              { code: { $like: `%${query}%` } },
            ],
          },
        }
      : {};

    return await this.repository.findAll(condition);
  }
}
