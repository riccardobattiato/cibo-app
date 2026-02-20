import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { database } from '@/portability/DatabaseHandler/DatabaseHandler';
import { FoodRepository } from '@/repositories/food/food.repository';
import { FoodCategory, UserFood, UserFoodCategory, Food } from '@/models/food';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { embeddingService } from '@/services/EmbeddingService';
import { indexingService } from '@/services/IndexingService';

const foodRepo = new FoodRepository(database);

// Background indexing
database.ready.then(() => {
  indexingService.indexAllMissing();
});

const PERSIST_KEY = {
  CATEGORIES: 'food_categories_cache',
  FOODS: 'food_items_cache',
  USER_CATEGORIES: 'user_categories_cache',
  USER_FOODS: 'user_foods_cache',
};

export const foodStore$ = observable({
  selectedCategory: undefined as { id: number; isCustom: boolean } | undefined,
  searchQuery: '',

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
    debounce: 350,
    get: async (): Promise<(Food | UserFood)[]> => {
      const sel = foodStore$.selectedCategory.get();
      const query = foodStore$.searchQuery.get();

      await database.ready;

      if (query && query.trim().length > 0) {
        try {
          const [keywordDefault, keywordUser] = await Promise.all([
            foodRepo.searchFoods(query),
            foodRepo.searchUserFoods(query),
          ]);

          let semanticDefault: any[] = [];
          let semanticUser: any[] = [];

          try {
            const queryEmbedding = await embeddingService.getEmbedding(query);
            [semanticDefault, semanticUser] = await Promise.all([
              foodRepo.semanticSearchFoods(queryEmbedding, 40),
              foodRepo.semanticSearchUserFoods(queryEmbedding, 20),
            ]);
          } catch {
            // Silently fall back if semantic fails
          }

          const seenIds = new Set<string>();
          const results: (Food | UserFood)[] = [];

          const addResults = (items: (Food | UserFood)[], isSemantic = false) => {
            for (const item of items) {
              const isUser = 'is_category_custom' in item || 'source_food_id' in item;
              const globalId = `${isUser ? 'u' : 'd'}_${item.id}`;
              if (!seenIds.has(globalId)) {
                if (isSemantic && 'distance' in item && (item as any).distance > 1.4) continue;
                seenIds.add(globalId);
                results.push(item);
              }
            }
          };

          addResults([...keywordDefault, ...keywordUser]);
          addResults([...semanticDefault, ...semanticUser], true);

          return results;
        } catch (error) {
          return [];
        }
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
          foodRepo.getUserFoodById(id).then((f) => f && indexingService.indexUserFood(f));
        } else if (food === undefined && prevFood) {
          await foodRepo.deleteUserFood(prevFood.id);
        } else if (food && prevFood) {
          await foodRepo.updateUserFood(food.id, food);
          indexingService.indexUserFood(food);
        }
      }
    },
    persist: { name: PERSIST_KEY.USER_FOODS, plugin: ObservablePersistMMKV },
  }),
});

export const searchQuery$ = foodStore$.searchQuery;
export const selectedCategory$ = foodStore$.selectedCategory;
