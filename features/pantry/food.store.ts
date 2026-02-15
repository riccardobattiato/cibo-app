import { observable, when } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { database } from '@/portability/DatabaseHandler/DatabaseHandler';
import { FoodRepository } from '@/repositories/food/food.repository';
import { FoodCategory, UserFood, UserFoodCategory, Food } from '@/models/food';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

const foodRepo = new FoodRepository(database);

const PERSIST_KEY = {
  CATEGORIES: 'food_categories_cache',
  FOODS: 'food_items_cache',
  USER_CATEGORIES: 'user_categories_cache',
  USER_FOODS: 'user_foods_cache',
};

export const selectedCategoryId$ = observable<number | undefined>(undefined);

/**
 * foodStore$ strictly defines the sync and persistence layer.
 * In v3, the 'set' function receives the full value and the changes.
 * For a local-first SQLite sync, we process the changes array to perform incremental updates.
 */
export const foodStore$ = observable({
  categories: synced({
    get: async (): Promise<FoodCategory[]> => {
      await when(() => !!database.db);
      return foodRepo.getCategories();
    },
    persist: { name: PERSIST_KEY.CATEGORIES, plugin: ObservablePersistMMKV },
  }),

  foods: synced({
    get: async (): Promise<Food[]> => {
      await when(() => !!database.db);
      return foodRepo.getFoods(selectedCategoryId$.get());
    },
    persist: { name: PERSIST_KEY.FOODS, plugin: ObservablePersistMMKV },
  }),

  userCategories: synced({
    get: async (): Promise<UserFoodCategory[]> => {
      await when(() => !!database.db);
      return foodRepo.getUserCategories();
    },
    set: async ({ changes }) => {
      for (const change of changes) {
        const { path, valueAtPath, prevAtPath } = change;
        if (path.length === 0) continue;
        const index = parseInt(path[0] as string, 10);
        const item = valueAtPath as UserFoodCategory;
        const prevItem = prevAtPath as UserFoodCategory;

        if (prevItem === undefined && item) {
          const id = await foodRepo.createUserCategory(item.name);
          (foodStore$.userCategories[index] as any).id.set(id);
        } else if (item === undefined && prevItem) {
          await foodRepo.deleteUserCategory(prevItem.id);
        } else if (item && prevItem && item.name !== prevItem.name) {
          await foodRepo.updateUserCategory(item.id, item.name);
        }
      }
    },
    persist: { name: PERSIST_KEY.USER_CATEGORIES, plugin: ObservablePersistMMKV },
  }),

  userFoods: synced({
    get: async (): Promise<UserFood[]> => {
      await when(() => !!database.db);
      return foodRepo.getUserFoods();
    },
    set: async ({ changes }) => {
      for (const change of changes) {
        const { path, valueAtPath, prevAtPath } = change;
        if (path.length === 0) continue;
        const index = parseInt(path[0] as string, 10);
        const food = valueAtPath as UserFood;
        const prevFood = prevAtPath as UserFood;

        if (prevFood === undefined && food) {
          const id = await foodRepo.createUserFood(food);
          (foodStore$.userFoods[index] as any).id.set(id);
        } else if (food === undefined && prevFood) {
          await foodRepo.deleteUserFood(prevFood.id);
        } else if (food && prevFood) {
          await foodRepo.updateUserFood(food.id, food);
        }
      }
    },
    persist: { name: PERSIST_KEY.USER_FOODS, plugin: ObservablePersistMMKV },
  }),
});
