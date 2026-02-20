import { IFoodRepository } from '@/repositories/food/IFoodRepository';
import { embeddingService } from './EmbeddingService';
import { database } from '@/portability/DatabaseHandler/DatabaseHandler';
import { FoodRepository } from '@/repositories/food/food.repository';
import { Food, UserFood } from '@/models/food';
import { sql } from 'drizzle-orm';

export class IndexingService {
  private isIndexing = false;

  constructor(private readonly foodRepo: IFoodRepository) {}

  async indexAllMissing(): Promise<void> {
    if (this.isIndexing) return;
    this.isIndexing = true;

    try {
      // 1. Ensure FTS5 index is populated (fast operation)
      const db = database.drizzle;
      if (db) {
        // Standard FTS5 rebuild
        try {
          await db.run(sql`INSERT INTO fts_foods(fts_foods) VALUES('rebuild')`);
          await db.run(sql`INSERT INTO fts_user_foods(fts_user_foods) VALUES('rebuild')`);
        } catch (e) {
          // Rebuild command might fail if table is empty or just created
        }

        // Manual population for safety
        await db.run(
          sql`INSERT OR IGNORE INTO fts_foods(rowid, name, english_name, information) SELECT id, name, english_name, information FROM foods`
        );
        await db.run(
          sql`INSERT OR IGNORE INTO fts_user_foods(rowid, name, english_name, information) SELECT id, name, english_name, information FROM user_foods`
        );
      }

      // 2. Vector Indexing (slow operation)
      await embeddingService.loadModel();

      // Index Foods
      const missingFoods = await this.foodRepo.getMissingEmbeddingsFoods();
      for (const food of missingFoods) {
        const textToEmbed = this.prepareFoodText(food);
        const embedding = await embeddingService.getEmbedding(textToEmbed);
        await this.foodRepo.upsertFoodEmbedding(food.id, embedding);
      }

      // Index User Foods
      const missingUserFoods = await this.foodRepo.getMissingEmbeddingsUserFoods();
      for (const food of missingUserFoods) {
        const textToEmbed = this.prepareFoodText(food);
        const embedding = await embeddingService.getEmbedding(textToEmbed);
        await this.foodRepo.upsertUserFoodEmbedding(food.id, embedding);
      }
    } catch (error) {
      // Indexing failed
    } finally {
      this.isIndexing = false;
    }
  }

  async indexFood(food: Food): Promise<void> {
    const db = database.drizzle;
    if (db) {
      await db.run(
        sql`INSERT OR REPLACE INTO fts_foods(rowid, name, english_name, information) VALUES(${food.id}, ${food.name}, ${food.english_name}, ${food.information})`
      );
    }
    await embeddingService.loadModel();
    const textToEmbed = this.prepareFoodText(food);
    const embedding = await embeddingService.getEmbedding(textToEmbed);
    await this.foodRepo.upsertFoodEmbedding(food.id, embedding);
  }

  async indexUserFood(food: UserFood): Promise<void> {
    const db = database.drizzle;
    if (db) {
      await db.run(
        sql`INSERT OR REPLACE INTO fts_user_foods(rowid, name, english_name, information) VALUES(${food.id}, ${food.name}, ${food.english_name}, ${food.information})`
      );
    }
    await embeddingService.loadModel();
    const textToEmbed = this.prepareFoodText(food);
    const embedding = await embeddingService.getEmbedding(textToEmbed);
    await this.foodRepo.upsertUserFoodEmbedding(food.id, embedding);
  }

  private prepareFoodText(food: Food | UserFood): string {
    const name = food.name.replace(/,/g, ' ');
    const parts = [
      name,
      food.english_name?.replace(/,/g, ' '),
      'information' in food ? food.information : '',
    ].filter(Boolean);
    return parts.join('. ');
  }
}

const foodRepo = new FoodRepository(database);
export const indexingService = new IndexingService(foodRepo);
