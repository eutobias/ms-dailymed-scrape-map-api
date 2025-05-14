import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class DailyMedIndications {
  @PrimaryKey()
  id?: number;

  @Property()
  indication!: string;

  @Property()
  description!: string;

  @Property()
  code!: string;
}
