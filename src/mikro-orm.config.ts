import { SqliteDriver } from '@mikro-orm/sqlite';

export default {
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'db.sqlite3',
  driver: SqliteDriver,
  allowGlobalContext: true,
};
