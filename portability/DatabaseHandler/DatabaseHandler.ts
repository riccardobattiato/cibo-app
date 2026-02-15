import { moveAssetsDatabase, open, type DB } from '@op-engineering/op-sqlite';

export interface IDatabase {
  db: DB | null;
  initialize(): Promise<void>;
}

export class AppDatabase implements IDatabase {
  private _db: DB | null = null;
  private readonly DB_NAME = 'food.db';

  get db(): DB | null {
    return this._db;
  }

  async initialize(): Promise<void> {
    try {
      const moved = await moveAssetsDatabase({
        filename: this.DB_NAME,
        overwrite: true,
      });
      if (!moved) {
        console.warn('Database move failed.');
      }

      this._db = open({ name: this.DB_NAME });
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}

export const database = new AppDatabase();
