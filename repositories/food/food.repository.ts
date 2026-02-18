import { IFoodRepository } from './IFoodRepository';
import {
  Food,
  FoodCategory,
  FoodWithCategory,
  FoodNutrientWithDefinition,
  UserFood,
  UserFoodCategory,
  CopyableNutritionFields,
} from '@/models/food';
import { IDatabase } from '@/portability/DatabaseHandler/DatabaseHandler';

export class FoodRepository implements IFoodRepository {
  constructor(private readonly database: IDatabase) {}

  private ensureDb(): NonNullable<IDatabase['db']> {
    if (!this.database.db) throw new Error('Database not initialized');
    return this.database.db;
  }

  private extractNutritionFields(source: CopyableNutritionFields): CopyableNutritionFields {
    return {
      name: source.name,
      category_id: source.category_id,
      scientific_name: source.scientific_name,
      english_name: source.english_name,
      information: source.information,
      edible_part_percentage: source.edible_part_percentage,
      portion_value: source.portion_value,
      portion_unit: source.portion_unit,
      energy_kcal: source.energy_kcal,
      protein_g: source.protein_g,
      fat_g: source.fat_g,
      carbohydrates_g: source.carbohydrates_g,
      sugar_g: source.sugar_g,
      fiber_g: source.fiber_g,
      sodium_mg: source.sodium_mg,
    };
  }

  private async createVariationFromSource(
    source: { id: number } & CopyableNutritionFields,
    isCategoryCustom: boolean,
    sourceFoodId: number
  ): Promise<number> {
    const nutrition = this.extractNutritionFields(source);
    return this.createUserFood({
      ...nutrition,
      name: `${source.name} (Copy)`,
      is_category_custom: isCategoryCustom,
      source_food_id: sourceFoodId,
    });
  }

  async getCategories(): Promise<FoodCategory[]> {
    const db = this.ensureDb();
    const result = await db.execute('SELECT id, name, icon FROM categories ORDER BY name ASC');
    return (result.rows as unknown as FoodCategory[]) || [];
  }

  async getFoods(categoryId?: number): Promise<Food[]> {
    const db = this.ensureDb();
    let query = 'SELECT * FROM foods';
    const params: any[] = [];

    if (categoryId) {
      query += ' WHERE category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY name ASC';

    const result = await db.execute(query, params);
    return (result.rows as unknown as Food[]) || [];
  }

  async getFoodById(id: number): Promise<FoodWithCategory | null> {
    const db = this.ensureDb();
    const query = `
      SELECT f.*, c.name as category_name
      FROM foods f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `;

    const result = await db.execute(query, [id]);
    const foods = (result.rows as unknown as FoodWithCategory[]) || [];
    return foods.length > 0 ? foods[0] : null;
  }

  async getFoodNutrients(foodId: number): Promise<FoodNutrientWithDefinition[]> {
    const db = this.ensureDb();
    const query = `
      SELECT fn.*, nd.name, nd.unit
      FROM food_nutrients fn
      JOIN nutrient_definitions nd ON fn.nutrient_id = nd.id
      WHERE fn.food_id = ?
    `;

    const result = await db.execute(query, [foodId]);
    return (result.rows as unknown as FoodNutrientWithDefinition[]) || [];
  }

  async searchFoods(query: string): Promise<Food[]> {
    const db = this.ensureDb();
    const result = await db.execute(
      'SELECT * FROM foods WHERE name LIKE ? OR english_name LIKE ? ORDER BY name ASC',
      [`%${query}%`, `%${query}%`]
    );
    return (result.rows as unknown as Food[]) || [];
  }

  async getUserCategories(): Promise<UserFoodCategory[]> {
    const db = this.ensureDb();
    const result = await db.execute('SELECT id, name, icon FROM user_categories ORDER BY name ASC');
    return (result.rows as unknown as UserFoodCategory[]) || [];
  }

  async createUserCategory(name: string, icon?: string): Promise<number> {
    const db = this.ensureDb();
    const result = await db.execute('INSERT INTO user_categories (name, icon) VALUES (?, ?)', [
      name,
      icon ?? null,
    ]);
    return result.insertId!;
  }

  async updateUserCategory(id: number, name: string, icon?: string): Promise<void> {
    const db = this.ensureDb();
    await db.execute('UPDATE user_categories SET name = ?, icon = ? WHERE id = ?', [
      name,
      icon ?? null,
      id,
    ]);
  }

  async deleteUserCategory(id: number): Promise<void> {
    const db = this.ensureDb();
    await db.execute('DELETE FROM user_categories WHERE id = ?', [id]);
  }

  async getUserFoods(userCategoryId?: number): Promise<UserFood[]> {
    const db = this.ensureDb();
    let query = 'SELECT * FROM user_foods';
    const params: any[] = [];
    if (userCategoryId) {
      query += ' WHERE category_id = ? AND is_category_custom = 1';
      params.push(userCategoryId);
    }
    query += ' ORDER BY name ASC';
    const result = await db.execute(query, params);
    return (result.rows as unknown as UserFood[]) || [];
  }

  async getUserFoodsByCategory(categoryId: number, isCustom: boolean): Promise<UserFood[]> {
    const db = this.ensureDb();
    const query =
      'SELECT * FROM user_foods WHERE category_id = ? AND is_category_custom = ? ORDER BY name ASC';
    const result = await db.execute(query, [categoryId, isCustom ? 1 : 0]);
    return (result.rows as unknown as UserFood[]) || [];
  }

  async getUserFoodById(id: number): Promise<UserFood | null> {
    const db = this.ensureDb();
    const result = await db.execute('SELECT * FROM user_foods WHERE id = ?', [id]);
    const foods = (result.rows as unknown as UserFood[]) || [];
    return foods.length > 0 ? foods[0] : null;
  }

  async createUserFood(food: Omit<UserFood, 'id'>): Promise<number> {
    const db = this.ensureDb();
    const query = `
      INSERT INTO user_foods (
        name, category_id, is_category_custom, source_food_id, scientific_name,
        english_name, information, edible_part_percentage, portion_value, portion_unit,
        energy_kcal, protein_g, fat_g, carbohydrates_g, sugar_g, fiber_g, sodium_mg
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      food.name,
      food.category_id ?? null,
      food.is_category_custom ? 1 : 0,
      food.source_food_id ?? null,
      food.scientific_name ?? null,
      food.english_name ?? null,
      food.information ?? null,
      food.edible_part_percentage ?? null,
      food.portion_value ?? null,
      food.portion_unit ?? null,
      food.energy_kcal ?? null,
      food.protein_g ?? null,
      food.fat_g ?? null,
      food.carbohydrates_g ?? null,
      food.sugar_g ?? null,
      food.fiber_g ?? null,
      food.sodium_mg ?? null,
    ];
    const result = await db.execute(query, params);
    return result.insertId!;
  }

  async updateUserFood(id: number, food: Partial<UserFood>): Promise<void> {
    const db = this.ensureDb();
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(food).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value === true ? 1 : value === false ? 0 : value);
      }
    });

    if (updates.length === 0) return;

    params.push(id);
    await db.execute(`UPDATE user_foods SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  async deleteUserFood(id: number): Promise<void> {
    const db = this.ensureDb();
    await db.execute('DELETE FROM user_foods WHERE id = ?', [id]);
  }

  async createVariation(foodId: number): Promise<number> {
    const sourceFood = await this.getFoodById(foodId);
    if (!sourceFood) throw new Error('Source food not found');
    return this.createVariationFromSource(sourceFood, false, sourceFood.id);
  }

  async createUserFoodVariation(userFoodId: number): Promise<number> {
    const sourceFood = await this.getUserFoodById(userFoodId);
    if (!sourceFood) throw new Error('Source user food not found');
    return this.createVariationFromSource(
      sourceFood,
      sourceFood.is_category_custom,
      sourceFood.source_food_id ?? sourceFood.id
    );
  }
}
