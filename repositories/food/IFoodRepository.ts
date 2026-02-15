import {
  Food,
  FoodCategory,
  FoodWithCategory,
  FoodNutrientWithDefinition,
  UserFood,
  UserFoodCategory,
} from '@/models/food';

export interface IFoodRepository {
  // Read-only Default Data
  getCategories(): Promise<FoodCategory[]>;
  getFoods(categoryId?: number): Promise<Food[]>;
  getFoodById(id: number): Promise<FoodWithCategory | null>;
  getFoodNutrients(foodId: number): Promise<FoodNutrientWithDefinition[]>;
  searchFoods(query: string): Promise<Food[]>;

  // User Custom Categories
  getUserCategories(): Promise<UserFoodCategory[]>;
  createUserCategory(name: string, icon?: string): Promise<number>;
  updateUserCategory(id: number, name: string, icon?: string): Promise<void>;
  deleteUserCategory(id: number): Promise<void>;

  // User Custom Foods
  getUserFoods(userCategoryId?: number): Promise<UserFood[]>;
  getUserFoodById(id: number): Promise<UserFood | null>;
  createUserFood(food: Omit<UserFood, 'id'>): Promise<number>;
  updateUserFood(id: number, food: Partial<UserFood>): Promise<void>;
  deleteUserFood(id: number): Promise<void>;
  createVariation(foodId: number): Promise<number>;
}
