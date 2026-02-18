import { useMemo } from 'react';
import { useValue } from '@legendapp/state/react';
import { syncState } from '@legendapp/state';
import { foodDetailStore$, selectedFoodId$ } from './food-detail.store';
import { useLanguage } from '@/locale/useLanguage';
import { categorizeNutrient, NutrientCategory } from '@/utils/helpers/nutrient-categorizer';
import { FoodNutrientWithDefinition } from '@/models/food';

export const useFoodDetailFacade = (id: string, isCustom: string) => {
  const [t] = useLanguage();

  selectedFoodId$.set({
    id: parseInt(id, 10),
    isCustom: isCustom === 'true',
  });

  const food = useValue(foodDetailStore$.food);
  const nutrients = useValue(foodDetailStore$.nutrients);

  const { isLoading, error } = useValue(() => {
    const foodState = syncState(foodDetailStore$.food);
    const nutrientsState = syncState(foodDetailStore$.nutrients);

    return {
      isLoading: !foodState.isLoaded.get() || !nutrientsState.isLoaded.get(),
      error: foodState.error.get() || nutrientsState.error.get(),
    };
  });

  const categorizedNutrients = useMemo(() => {
    const result: Record<NutrientCategory, FoodNutrientWithDefinition[]> = {
      macro: [],
      minerals: [],
      vitamins: [],
      aminoacids: [],
      other: [],
    };

    nutrients.forEach((n) => {
      const category = categorizeNutrient(n.name);
      result[category].push(n);
    });

    const addMacroIfMissing = (name: string, value: number | null, unit: string) => {
      if (value === null || value === 0) return;
      if (!result.macro.find((n) => n.name.toLowerCase().includes(name.toLowerCase()))) {
        result.macro.push({
          name: name,
          value: value,
          unit: unit,
          food_id: food?.id || 0,
          nutrient_id: 0,
          is_trace: false,
        });
      }
    };

    if (food) {
      addMacroIfMissing(t('food.protein'), food.protein_g, 'g');
      addMacroIfMissing(t('food.fat'), food.fat_g, 'g');
      addMacroIfMissing(t('food.carbs'), food.carbohydrates_g, 'g');
      addMacroIfMissing(t('food.sugar'), food.sugar_g, 'g');
      addMacroIfMissing(t('food.fiber'), food.fiber_g, 'g');
      addMacroIfMissing(t('food.sodium'), food.sodium_mg, 'mg');
      addMacroIfMissing(t('food.energy'), food.energy_kcal, 'kcal');
    }

    return result;
  }, [nutrients, food, t]);

  const macros = useMemo(() => {
    if (!food) return [];
    return [
      {
        key: 'protein',
        value: food.protein_g,
        colorVar: '--color-rose-400',
        colorClass: 'rose',
        label: t('food.protein'),
      },
      {
        key: 'carbs',
        value: food.carbohydrates_g,
        colorVar: '--color-green-400',
        colorClass: 'green',
        label: t('food.carbs'),
      },
      {
        key: 'fat',
        value: food.fat_g,
        colorVar: '--color-orange-400',
        colorClass: 'orange',
        label: t('food.fat'),
      },
    ];
  }, [food, t]);

  return {
    food,
    nutrients,
    isLoading,
    error,
    categorizedNutrients,
    macros,
  };
};
