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

export const selectedCategory$ = observable<{ id: number; isCustom: boolean } | undefined>(
  undefined
);
export const searchQuery$ = observable<string>('');

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
    initial: [],
    get: async (): Promise<(Food | UserFood)[]> => {
      // Track observables synchronously BEFORE any await to ensure reactivity in v3
      const sel = selectedCategory$.get();
      const query = searchQuery$.get();

      await when(() => !!database.db);

      if (query) {
        // For search, we combine both default and user foods
        const [defaultFoods, userFoods] = await Promise.all([
          foodRepo.searchFoods(query),
          foodRepo.getUserFoods(), // Ideally we'd have a searchUserFoods method
        ]);

        const filteredUserFoods = userFoods.filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.english_name?.toLowerCase().includes(query.toLowerCase())
        );

        return [...defaultFoods, ...filteredUserFoods];
      }

      if (sel) {
        if (sel.isCustom) {
          return foodRepo.getUserFoods(sel.id);
        } else {
          if (sel.id === 0) {
            // "All" category: combine default and user foods
            const [defaultFoods, userFoods] = await Promise.all([
              foodRepo.getFoods(),
              foodRepo.getUserFoods(),
            ]);
            return [...defaultFoods, ...userFoods];
          }
          return foodRepo.getFoods(sel.id);
        }
      }

      // If no selection and no search, we return all default foods by default
      // or we could return nothing if we only want to show foods when a category is selected.
      // The prompt says "All" category card at the end should show all entries.
      return [];
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
          const id = await foodRepo.createUserCategory(item.name, item.icon);
          (foodStore$.userCategories[index] as any).id.set(id);
        } else if (item === undefined && prevItem) {
          await foodRepo.deleteUserCategory(prevItem.id);
        } else if (
          item &&
          prevItem &&
          (item.name !== prevItem.name || item.icon !== prevItem.icon)
        ) {
          await foodRepo.updateUserCategory(item.id, item.name, item.icon);
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
