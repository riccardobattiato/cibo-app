import { IFoodRepository } from './IFoodRepository';
import { Food, FoodCategory, FoodWithCategory, FoodNutrientWithDefinition } from '@/models/food';
import { IDatabase } from '@/portability/DatabaseHandler/DatabaseHandler';

export class FoodRepository implements IFoodRepository {
  constructor(private readonly database: IDatabase) {}

  async getCategories(): Promise<FoodCategory[]> {
    if (!this.database.db) throw new Error('Database not initialized');

    const result = await this.database.db.execute(
      'SELECT id, name FROM categories ORDER BY name ASC'
    );
    return (result.rows as unknown as FoodCategory[]) || [];
  }

  async getFoods(categoryId?: number): Promise<Food[]> {
    if (!this.database.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM foods';
    const params: any[] = [];

    if (categoryId) {
      query += ' WHERE category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY name ASC';

    const result = await this.database.db.execute(query, params);
    return (result.rows as unknown as Food[]) || [];
  }

  async getFoodById(id: number): Promise<FoodWithCategory | null> {
    if (!this.database.db) throw new Error('Database not initialized');

    const query = `
      SELECT f.*, c.name as category_name
      FROM foods f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `;

    const result = await this.database.db.execute(query, [id]);
    const foods = (result.rows as unknown as FoodWithCategory[]) || [];
    return foods.length > 0 ? foods[0] : null;
  }

  async getFoodNutrients(foodId: number): Promise<FoodNutrientWithDefinition[]> {
    if (!this.database.db) throw new Error('Database not initialized');

    const query = `
      SELECT fn.*, nd.name, nd.unit
      FROM food_nutrients fn
      JOIN nutrient_definitions nd ON fn.nutrient_id = nd.id
      WHERE fn.food_id = ?
    `;

    const result = await this.database.db.execute(query, [foodId]);
    return (result.rows as unknown as FoodNutrientWithDefinition[]) || [];
  }

  async searchFoods(query: string): Promise<Food[]> {
    if (!this.database.db) throw new Error('Database not initialized');

    const result = await this.database.db.execute(
      'SELECT * FROM foods WHERE name LIKE ? OR english_name LIKE ? ORDER BY name ASC',
      [`%${query}%`, `%${query}%`]
    );
    return (result.rows as unknown as Food[]) || [];
  }
}
