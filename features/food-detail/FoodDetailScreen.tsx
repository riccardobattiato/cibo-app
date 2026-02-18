import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/atoms/text';
import { FoodHeader } from './components/FoodHeader';
import { MacroCharts } from './components/MacroCharts';
import { NutrientTables } from './components/NutrientTables';
import { useFoodDetailFacade } from './useFoodDetailFacade';
import { useLanguage } from '@/locale/useLanguage';

interface FoodDetailScreenProps {
  id: string;
  isCustom: string;
}

export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({ id, isCustom }) => {
  const { food, isLoading, error, categorizedNutrients, macros } = useFoodDetailFacade(
    id,
    isCustom
  );
  const [t, , locale] = useLanguage();

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text>{t('pantry.all')}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text>Failed to load food details</Text>
      </View>
    );
  }

  if (!food) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text>Food not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <FoodHeader food={food} isCustom={isCustom === 'true'} locale={locale} />
      <MacroCharts macros={macros} />
      <NutrientTables categorizedNutrients={categorizedNutrients} />

      {food.information && (
        <View className="bg-muted mt-4 rounded-lg p-4">
          <Text className="text-muted-foreground text-sm italic">{food.information}</Text>
        </View>
      )}
    </ScrollView>
  );
};
