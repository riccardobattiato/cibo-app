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
import { eq, and, like, or, sql } from 'drizzle-orm';
import {
  categories,
  foods,
  foodNutrients,
  nutrientDefinitions,
  userCategories,
  userFoods,
} from '@/db/schema';

export class FoodRepository implements IFoodRepository {
  constructor(private readonly database: IDatabase) {}

  private ensureDrizzle() {
    if (!this.database.drizzle) throw new Error('Database not initialized');
    return this.database.drizzle;
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
    const db = this.ensureDrizzle();
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
      })
      .from(categories)
      .orderBy(categories.name);
    return result as FoodCategory[];
  }

  async getFoods(categoryId?: number): Promise<Food[]> {
    const db = this.ensureDrizzle();
    const query = categoryId
      ? db.select().from(foods).where(eq(foods.category_id, categoryId)).orderBy(foods.name)
      : db.select().from(foods).orderBy(foods.name);
    const result = await query;
    return result as Food[];
  }

  async getFoodById(id: number): Promise<FoodWithCategory | null> {
    const db = this.ensureDrizzle();
    const result = await db
      .select({
        id: foods.id,
        original_id: foods.original_id,
        category_id: foods.category_id,
        name: foods.name,
        scientific_name: foods.scientific_name,
        english_name: foods.english_name,
        url: foods.url,
        information: foods.information,
        edible_part_percentage: foods.edible_part_percentage,
        portion_value: foods.portion_value,
        portion_unit: foods.portion_unit,
        samples_count: foods.samples_count,
        scraped_at: foods.scraped_at,
        energy_kcal: foods.energy_kcal,
        protein_g: foods.protein_g,
        fat_g: foods.fat_g,
        carbohydrates_g: foods.carbohydrates_g,
        sugar_g: foods.sugar_g,
        fiber_g: foods.fiber_g,
        sodium_mg: foods.sodium_mg,
        category_name: categories.name,
      })
      .from(foods)
      .leftJoin(categories, eq(foods.category_id, categories.id))
      .where(eq(foods.id, id));

    return result.length > 0 ? (result[0] as FoodWithCategory) : null;
  }

  async getFoodNutrients(foodId: number): Promise<FoodNutrientWithDefinition[]> {
    const db = this.ensureDrizzle();
    const result = await db
      .select({
        food_id: foodNutrients.food_id,
        nutrient_id: foodNutrients.nutrient_id,
        value: foodNutrients.value,
        is_trace: foodNutrients.is_trace,
        name: nutrientDefinitions.name,
        unit: nutrientDefinitions.unit,
      })
      .from(foodNutrients)
      .innerJoin(nutrientDefinitions, eq(foodNutrients.nutrient_id, nutrientDefinitions.id))
      .where(eq(foodNutrients.food_id, foodId));

    return result as FoodNutrientWithDefinition[];
  }

  async searchFoods(query: string): Promise<Food[]> {
    const db = this.ensureDrizzle();
    const stopwords = new Set([
      'di',
      'dei',
      'del',
      'della',
      'delle',
      'degli',
      'il',
      'lo',
      'la',
      'i',
      'gli',
      'le',
      'un',
      'una',
      'uno',
      'e',
      'ed',
      'con',
      'senza',
    ]);

    const tokens = query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const meaningfulTokens = tokens.filter((t) => !stopwords.has(t) || tokens.length === 1);

    if (meaningfulTokens.length === 0) return [];

    const ftsQuery = meaningfulTokens.map((t) => (t.length >= 2 ? `${t}*` : t)).join(' ');

    try {
      const result = await db.all(
        sql`
        SELECT f.*
        FROM foods f
        JOIN fts_foods fts ON f.id = fts.rowid
        WHERE fts_foods MATCH ${ftsQuery}
        ORDER BY rank
        LIMIT 50
      `
      );
      if (result && result.length > 0) return result as Food[];
    } catch (e) {
      // FTS search failed
    }

    // Improved Fallback: Token-aware LIKE search
    const conditions = meaningfulTokens.map((token) =>
      or(like(foods.name, `%${token}%`), like(foods.english_name, `%${token}%`))
    );
    return (await db
      .select()
      .from(foods)
      .where(and(...conditions))
      .limit(50)) as Food[];
  }

  async searchUserFoods(query: string): Promise<UserFood[]> {
    const db = this.ensureDrizzle();
    const stopwords = new Set([
      'di',
      'dei',
      'del',
      'della',
      'delle',
      'degli',
      'il',
      'lo',
      'la',
      'i',
      'gli',
      'le',
      'un',
      'una',
      'uno',
      'e',
      'ed',
      'con',
      'senza',
    ]);

    const tokens = query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const meaningfulTokens = tokens.filter((t) => !stopwords.has(t) || tokens.length === 1);

    if (meaningfulTokens.length === 0) return [];

    const ftsQuery = meaningfulTokens.map((t) => (t.length >= 2 ? `${t}*` : t)).join(' ');

    try {
      const result = await db.all(
        sql`
        SELECT uf.*
        FROM user_foods uf
        JOIN fts_user_foods fts ON uf.id = fts.rowid
        WHERE fts_user_foods MATCH ${ftsQuery}
        ORDER BY rank
        LIMIT 50
      `
      );
      if (result && result.length > 0) return result as UserFood[];
    } catch (e) {
      // FTS search failed
    }

    const conditions = meaningfulTokens.map((token) =>
      or(like(userFoods.name, `%${token}%`), like(userFoods.english_name, `%${token}%`))
    );
    return (await db
      .select()
      .from(userFoods)
      .where(and(...conditions))
      .limit(50)) as UserFood[];
  }

  async getUserCategories(): Promise<UserFoodCategory[]> {
    const db = this.ensureDrizzle();
    const result = await db
      .select({
        id: userCategories.id,
        name: userCategories.name,
        icon: userCategories.icon,
      })
      .from(userCategories)
      .orderBy(userCategories.name);
    return result as UserFoodCategory[];
  }

  async createUserCategory(name: string, icon?: string): Promise<number> {
    const db = this.ensureDrizzle();
    const result = await db
      .insert(userCategories)
      .values({ name, icon: icon ?? null })
      .returning({ id: userCategories.id });
    return result[0].id;
  }

  async updateUserCategory(id: number, name: string, icon?: string): Promise<void> {
    const db = this.ensureDrizzle();
    await db
      .update(userCategories)
      .set({ name, icon: icon ?? null })
      .where(eq(userCategories.id, id));
  }

  async deleteUserCategory(id: number): Promise<void> {
    const db = this.ensureDrizzle();
    await db.delete(userCategories).where(eq(userCategories.id, id));
  }

  async getUserFoods(userCategoryId?: number): Promise<UserFood[]> {
    const db = this.ensureDrizzle();
    const query = userCategoryId
      ? db
          .select()
          .from(userFoods)
          .where(
            and(eq(userFoods.category_id, userCategoryId), eq(userFoods.is_category_custom, true))
          )
          .orderBy(userFoods.name)
      : db.select().from(userFoods).orderBy(userFoods.name);
    const result = await query;
    return result as UserFood[];
  }

  async getUserFoodsByCategory(categoryId: number, isCustom: boolean): Promise<UserFood[]> {
    const db = this.ensureDrizzle();
    const result = await db
      .select()
      .from(userFoods)
      .where(and(eq(userFoods.category_id, categoryId), eq(userFoods.is_category_custom, isCustom)))
      .orderBy(userFoods.name);
    return result as UserFood[];
  }

  async getUserFoodById(id: number): Promise<UserFood | null> {
    const db = this.ensureDrizzle();
    const result = await db.select().from(userFoods).where(eq(userFoods.id, id));
    return result.length > 0 ? (result[0] as UserFood) : null;
  }

  async createUserFood(food: Omit<UserFood, 'id'>): Promise<number> {
    const db = this.ensureDrizzle();
    const result = await db
      .insert(userFoods)
      .values({
        name: food.name,
        category_id: food.category_id ?? null,
        is_category_custom: food.is_category_custom ?? false,
        source_food_id: food.source_food_id ?? null,
        scientific_name: food.scientific_name ?? null,
        english_name: food.english_name ?? null,
        information: food.information ?? null,
        edible_part_percentage: food.edible_part_percentage ?? null,
        portion_value: food.portion_value ?? null,
        portion_unit: food.portion_unit ?? null,
        energy_kcal: food.energy_kcal ?? null,
        protein_g: food.protein_g ?? null,
        fat_g: food.fat_g ?? null,
        carbohydrates_g: food.carbohydrates_g ?? null,
        sugar_g: food.sugar_g ?? null,
        fiber_g: food.fiber_g ?? null,
        sodium_mg: food.sodium_mg ?? null,
      })
      .returning({ id: userFoods.id });
    return result[0].id;
  }

  async updateUserFood(id: number, food: Partial<UserFood>): Promise<void> {
    const db = this.ensureDrizzle();
    const updateData: Record<string, unknown> = {};

    Object.entries(food).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) return;

    await db.update(userFoods).set(updateData).where(eq(userFoods.id, id));
  }

  async deleteUserFood(id: number): Promise<void> {
    const db = this.ensureDrizzle();
    await db.delete(userFoods).where(eq(userFoods.id, id));
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

  async semanticSearchFoods(
    embedding: Float32Array,
    limit = 50
  ): Promise<(Food & { distance?: number })[]> {
    const db = this.ensureDrizzle();
    const result = await db.all(
      sql`
      SELECT f.*, v.distance
      FROM foods f
      JOIN vec_foods v ON f.id = v.rowid
      WHERE v.embedding MATCH ${new Uint8Array(embedding.buffer)}
        AND k = ${limit}
      ORDER BY distance
    `
    );

    return (result || []) as (Food & { distance?: number })[];
  }

  async semanticSearchUserFoods(
    embedding: Float32Array,
    limit = 50
  ): Promise<(UserFood & { distance?: number })[]> {
    const db = this.ensureDrizzle();
    const result = await db.all(
      sql`
      SELECT uf.*, v.distance
      FROM user_foods uf
      JOIN vec_user_foods v ON uf.id = v.rowid
      WHERE v.embedding MATCH ${new Uint8Array(embedding.buffer)}
        AND k = ${limit}
      ORDER BY distance
    `
    );

    return (result || []) as (UserFood & { distance?: number })[];
  }

  async getMissingEmbeddingsFoods(): Promise<Food[]> {
    const db = this.ensureDrizzle();
    const result = await db.all(
      sql`SELECT f.* FROM foods f LEFT JOIN vec_foods v ON f.id = v.rowid WHERE v.rowid IS NULL`
    );
    return (result || []) as Food[];
  }

  async getMissingEmbeddingsUserFoods(): Promise<UserFood[]> {
    const db = this.ensureDrizzle();
    const result = await db.all(
      sql`SELECT uf.* FROM user_foods uf LEFT JOIN vec_user_foods v ON uf.id = v.rowid WHERE v.rowid IS NULL`
    );
    return (result || []) as UserFood[];
  }

  async upsertFoodEmbedding(foodId: number, embedding: Float32Array): Promise<void> {
    const db = this.ensureDrizzle();
    await db.run(
      sql`INSERT OR REPLACE INTO vec_foods(rowid, embedding) VALUES(${foodId}, ${new Uint8Array(embedding.buffer)})`
    );
  }

  async upsertUserFoodEmbedding(userFoodId: number, embedding: Float32Array): Promise<void> {
    const db = this.ensureDrizzle();
    await db.run(
      sql`INSERT OR REPLACE INTO vec_user_foods(rowid, embedding) VALUES(${userFoodId}, ${new Uint8Array(embedding.buffer)})`
    );
  }
}
