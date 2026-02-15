import { IFoodRepository } from './IFoodRepository';
import {
  Food,
  FoodCategory,
  FoodWithCategory,
  FoodNutrientWithDefinition,
  UserFood,
  UserFoodCategory,
} from '@/models/food';
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

  // User Custom Categories
  async getUserCategories(): Promise<UserFoodCategory[]> {
    if (!this.database.db) throw new Error('Database not initialized');
    const result = await this.database.db.execute(
      'SELECT * FROM user_categories ORDER BY name ASC'
    );
    return (result.rows as unknown as UserFoodCategory[]) || [];
  }

  async createUserCategory(name: string): Promise<number> {
    if (!this.database.db) throw new Error('Database not initialized');
    const result = await this.database.db.execute('INSERT INTO user_categories (name) VALUES (?)', [
      name,
    ]);
    return result.insertId!;
  }

  async updateUserCategory(id: number, name: string): Promise<void> {
    if (!this.database.db) throw new Error('Database not initialized');
    await this.database.db.execute('UPDATE user_categories SET name = ? WHERE id = ?', [name, id]);
  }

  async deleteUserCategory(id: number): Promise<void> {
    if (!this.database.db) throw new Error('Database not initialized');
    await this.database.db.execute('DELETE FROM user_categories WHERE id = ?', [id]);
  }

  // User Custom Foods
  async getUserFoods(userCategoryId?: number): Promise<UserFood[]> {
    if (!this.database.db) throw new Error('Database not initialized');
    let query = 'SELECT * FROM user_foods';
    const params: any[] = [];
    if (userCategoryId) {
      query += ' WHERE category_id = ? AND is_category_custom = 1';
      params.push(userCategoryId);
    }
    query += ' ORDER BY name ASC';
    const result = await this.database.db.execute(query, params);
    return (result.rows as unknown as UserFood[]) || [];
  }

  async getUserFoodById(id: number): Promise<UserFood | null> {
    if (!this.database.db) throw new Error('Database not initialized');
    const result = await this.database.db.execute('SELECT * FROM user_foods WHERE id = ?', [id]);
    const foods = (result.rows as unknown as UserFood[]) || [];
    return foods.length > 0 ? foods[0] : null;
  }

  async createUserFood(food: Omit<UserFood, 'id'>): Promise<number> {
    if (!this.database.db) throw new Error('Database not initialized');
    const query = `
      INSERT INTO user_foods (
        name, category_id, is_category_custom, source_food_id, scientific_name, 
        english_name, information, edible_part_percentage, portion_value, portion_unit,
        energy_kcal, protein_g, fat_g, carbohydrates_g, sugar_g, fiber_g, sodium_mg
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      food.name,
      food.category_id,
      food.is_category_custom ? 1 : 0,
      food.source_food_id,
      food.scientific_name,
      food.english_name,
      food.information,
      food.edible_part_percentage,
      food.portion_value,
      food.portion_unit,
      food.energy_kcal,
      food.protein_g,
      food.fat_g,
      food.carbohydrates_g,
      food.sugar_g,
      food.fiber_g,
      food.sodium_mg,
    ];
    const result = await this.database.db.execute(query, params);
    return result.insertId!;
  }

  async updateUserFood(id: number, food: Partial<UserFood>): Promise<void> {
    if (!this.database.db) throw new Error('Database not initialized');
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(food).forEach(([key, value]) => {
      if (key !== 'id') {
        updates.push(`${key} = ?`);
        params.push(value === true ? 1 : value === false ? 0 : value);
      }
    });

    if (updates.length === 0) return;

    params.push(id);
    await this.database.db.execute(
      `UPDATE user_foods SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  async deleteUserFood(id: number): Promise<void> {
    if (!this.database.db) throw new Error('Database not initialized');
    await this.database.db.execute('DELETE FROM user_foods WHERE id = ?', [id]);
  }

  async createVariation(foodId: number): Promise<number> {
    const sourceFood = await this.getFoodById(foodId);
    if (!sourceFood) throw new Error('Source food not found');

    return this.createUserFood({
      name: `${sourceFood.name} (Copy)`,
      category_id: sourceFood.category_id,
      is_category_custom: false,
      source_food_id: sourceFood.id,
      scientific_name: sourceFood.scientific_name,
      english_name: sourceFood.english_name,
      information: sourceFood.information,
      edible_part_percentage: sourceFood.edible_part_percentage,
      portion_value: sourceFood.portion_value,
      portion_unit: sourceFood.portion_unit,
      energy_kcal: sourceFood.energy_kcal,
      protein_g: sourceFood.protein_g,
      fat_g: sourceFood.fat_g,
      carbohydrates_g: sourceFood.carbohydrates_g,
      sugar_g: sourceFood.sugar_g,
      fiber_g: sourceFood.fiber_g,
      sodium_mg: sourceFood.sodium_mg,
    });
  }
}
