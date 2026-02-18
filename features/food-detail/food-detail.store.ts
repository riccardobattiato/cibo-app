import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { when } from '@legendapp/state';
import { database } from '@/portability/DatabaseHandler/DatabaseHandler';
import { FoodRepository } from '@/repositories/food/food.repository';
import { FoodWithCategory, UserFood, FoodNutrientWithDefinition } from '@/models/food';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

const foodRepo = new FoodRepository(database);

const PERSIST_KEY = {
  FOOD_DETAIL: 'food_detail_cache',
  FOOD_NUTRIENTS: 'food_nutrients_cache',
};

export const selectedFoodId$ = observable<{ id: number; isCustom: boolean } | undefined>(undefined);

export const foodDetailStore$ = observable({
  food: synced({
    get: async (): Promise<FoodWithCategory | UserFood | null> => {
      const sel = selectedFoodId$.get();
      await when(() => !!database.db);

      if (!sel) return null;

      if (sel.isCustom) {
        return foodRepo.getUserFoodById(sel.id);
      }
      return foodRepo.getFoodById(sel.id);
    },
    persist: { name: PERSIST_KEY.FOOD_DETAIL, plugin: ObservablePersistMMKV },
  }),

  nutrients: synced({
    get: async (): Promise<FoodNutrientWithDefinition[]> => {
      const sel = selectedFoodId$.get();
      await when(() => !!database.db);

      if (!sel || sel.isCustom) return [];

      return foodRepo.getFoodNutrients(sel.id);
    },
    persist: { name: PERSIST_KEY.FOOD_NUTRIENTS, plugin: ObservablePersistMMKV },
  }),
});
