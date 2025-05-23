import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey()
  id?: number;

  @Property()
  username!: string;

  @Property()
  password!: string;

  @Property()
  accesslevel!: number;
}
