import { Food, FoodCategory, FoodWithCategory, FoodNutrientWithDefinition } from '@/models/food';

export interface IFoodRepository {
  getCategories(): Promise<FoodCategory[]>;
  getFoods(categoryId?: number): Promise<Food[]>;
  getFoodById(id: number): Promise<FoodWithCategory | null>;
  getFoodNutrients(foodId: number): Promise<FoodNutrientWithDefinition[]>;
  searchFoods(query: string): Promise<Food[]>;
}
