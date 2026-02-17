import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms/text';
import { NutrientTable } from '@/components/molecules/NutrientTable';
import { FoodNutrientWithDefinition } from '@/models/food';
import { NutrientCategory } from '@/utils/helpers/nutrient-categorizer';
import { useLanguage } from '@/locale/useLanguage';

interface CategorizedNutrients {
  [key: string]: FoodNutrientWithDefinition[];
}

interface NutrientTablesProps {
  categorizedNutrients: CategorizedNutrients;
}

export const NutrientTables: React.FC<NutrientTablesProps> = ({ categorizedNutrients }) => {
  const [t] = useLanguage();

  const toNutrientItems = (nutrients: FoodNutrientWithDefinition[]) =>
    nutrients.map((n) => ({
      name: n.name,
      value: n.value || 0,
      unit: n.unit || '',
    }));

  return (
    <>
      <NutrientTable
        title={t('food.macronutrients')}
        nutrients={toNutrientItems(categorizedNutrients.macro)}
      />

      <NutrientTable
        title={t('food.minerals')}
        nutrients={toNutrientItems(categorizedNutrients.minerals)}
      />

      <NutrientTable
        title={t('food.vitamins')}
        nutrients={toNutrientItems(categorizedNutrients.vitamins)}
      />

      <NutrientTable
        title={t('food.aminoacids')}
        nutrients={toNutrientItems(categorizedNutrients.aminoacids)}
      />

      <NutrientTable
        title={t('food.other')}
        nutrients={toNutrientItems(categorizedNutrients.other)}
      />
    </>
  );
};
