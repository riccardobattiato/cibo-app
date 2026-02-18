import { drizzle } from 'drizzle-orm/op-sqlite';
import { open, type DB } from '@op-engineering/op-sqlite';
import * as schema from './schema';

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;
let _sqlite: DB | null = null;

export const DB_NAME = 'food.db';

export function getDb(): DrizzleDb {
  if (!_db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return _db;
}

export function getSqlite(): DB {
  if (!_sqlite) {
    throw new Error('SQLite not initialized. Call initializeDb() first.');
  }
  return _sqlite;
}

export function initializeDb(sqlite: DB): DrizzleDb {
  _sqlite = sqlite;
  _db = drizzle(sqlite, { schema });
  return _db;
}

export { schema };
