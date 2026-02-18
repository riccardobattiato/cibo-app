import { useState, useEffect, useMemo } from 'react';
import { useRepositories } from '@/contexts/RepositoriesProvider/repositories.provider';
import { FoodWithCategory, UserFood, FoodNutrientWithDefinition } from '@/models/food';
import { useLanguage } from '@/locale/useLanguage';
import { categorizeNutrient, NutrientCategory } from '@/utils/helpers/nutrient-categorizer';

export const useFoodDetailFacade = (id: string, isCustom: string) => {
  const { foodRepository } = useRepositories();
  const [t] = useLanguage();

  const [food, setFood] = useState<FoodWithCategory | UserFood | null>(null);
  const [nutrients, setNutrients] = useState<FoodNutrientWithDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const foodId = parseInt(id, 10);
        if (isCustom === 'true') {
          const data = await foodRepository.getUserFoodById(foodId);
          setFood(data);
          setNutrients([]);
        } else {
          const [data, nutrientData] = await Promise.all([
            foodRepository.getFoodById(foodId),
            foodRepository.getFoodNutrients(foodId),
          ]);
          setFood(data);
          setNutrients(nutrientData);
        }
      } catch (error) {
        console.error('Failed to fetch food details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isCustom, foodRepository]);

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
    categorizedNutrients,
    macros,
  };
};
