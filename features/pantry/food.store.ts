import { observable } from '@legendapp/state';
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

export const foodStore$ = observable({
  categories: synced({
    initial: [],
    get: async (): Promise<FoodCategory[]> => {
      await database.ready;
      return foodRepo.getCategories();
    },
    persist: { name: PERSIST_KEY.CATEGORIES, plugin: ObservablePersistMMKV },
  }),

  foods: synced({
    initial: [],
    get: async (): Promise<(Food | UserFood)[]> => {
      await database.ready;
      const sel = selectedCategory$.get();
      const query = searchQuery$.get();

      if (query) {
        const [defaultFoods, userFoods] = await Promise.all([
          foodRepo.searchFoods(query),
          foodRepo.getUserFoods(),
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
            const [defaultFoods, userFoods] = await Promise.all([
              foodRepo.getFoods(),
              foodRepo.getUserFoods(),
            ]);
            return [...defaultFoods, ...userFoods];
          }
          const [defaultFoods, userFoodsInCategory] = await Promise.all([
            foodRepo.getFoods(sel.id),
            foodRepo.getUserFoodsByCategory(sel.id, false),
          ]);
          return [...defaultFoods, ...userFoodsInCategory];
        }
      }

      return [];
    },
    persist: { name: PERSIST_KEY.FOODS, plugin: ObservablePersistMMKV },
  }),

  userCategories: synced({
    initial: [],
    get: async (): Promise<UserFoodCategory[]> => {
      await database.ready;
      return foodRepo.getUserCategories();
    },
    set: async ({ changes }) => {
      await database.ready;
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
    initial: [],
    get: async (): Promise<UserFood[]> => {
      await database.ready;
      return foodRepo.getUserFoods();
    },
    set: async ({ changes }) => {
      await database.ready;
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
