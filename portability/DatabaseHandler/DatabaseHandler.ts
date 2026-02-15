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
      await this.initializeUserTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async initializeUserTables(): Promise<void> {
    if (!this._db) return;

    await this._db.transaction(async (tx) => {
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS user_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          icon TEXT
        )
      `);

      // Try to add icon column if it doesn't exist (for existing databases)
      try {
        await tx.execute('ALTER TABLE user_categories ADD COLUMN icon TEXT');
      } catch (e) {
        // Column might already exist
      }

      // Try to add icon column to default categories if it doesn't exist
      try {
        await tx.execute('ALTER TABLE categories ADD COLUMN icon TEXT');
      } catch (e) {
        // Column might already exist
      }

      await tx.execute(`
        CREATE TABLE IF NOT EXISTS user_foods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER,
          is_category_custom BOOLEAN DEFAULT 0,
          source_food_id INTEGER,
          name TEXT NOT NULL,
          scientific_name TEXT,
          english_name TEXT,
          information TEXT,
          edible_part_percentage REAL,
          portion_value REAL,
          portion_unit TEXT,
          energy_kcal REAL,
          protein_g REAL,
          fat_g REAL,
          carbohydrates_g REAL,
          sugar_g REAL,
          fiber_g REAL,
          sodium_mg REAL,
          FOREIGN KEY (source_food_id) REFERENCES foods(id)
        )
      `);
    });
  }
}

export const database = new AppDatabase();
