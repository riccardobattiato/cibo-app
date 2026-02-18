import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
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
      await database.ready;
      const sel = selectedFoodId$.get();

      if (!sel) return null;

      if (sel.isCustom) {
        return foodRepo.getUserFoodById(sel.id);
      }
      return foodRepo.getFoodById(sel.id);
    },
    persist: { name: PERSIST_KEY.FOOD_DETAIL, plugin: ObservablePersistMMKV },
  }),

  nutrients: synced({
    initial: [],
    get: async (): Promise<FoodNutrientWithDefinition[]> => {
      await database.ready;
      const sel = selectedFoodId$.get();

      if (!sel || sel.isCustom) return [];

      return foodRepo.getFoodNutrients(sel.id);
    },
    persist: { name: PERSIST_KEY.FOOD_NUTRIENTS, plugin: ObservablePersistMMKV },
  }),
});
