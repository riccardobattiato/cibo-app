import React from 'react';
import { Pressable, View } from 'react-native';
import { LegendList } from '@legendapp/list';
import { Text } from '@/components/atoms/text';
import { useLanguage } from '@/locale/useLanguage';
import { Food, UserFood } from '@/models/food';

interface FoodListProps {
  foods: (Food | UserFood)[];
  onFoodPress: (food: Food | UserFood) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onFoodPress }) => {
  const [t] = useLanguage();

  return (
    <LegendList
      data={foods}
      keyExtractor={(item) => `food-${item.id}`}
      estimatedItemSize={60}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <Pressable
          className="bg-card border-border mb-2 flex-row items-center justify-between rounded-lg border p-4"
          onPress={() => onFoodPress(item)}>
          <View className="flex-1">
            <Text className="font-semibold">{item.name}</Text>
            {item.english_name && (
              <Text className="text-muted-foreground text-xs">
                {t('food.carbs')} {item.carbohydrates_g} g, {t('food.protein')} {item.protein_g} g,{' '}
                {t('food.fat')} {item.fat_g} g
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-primary font-bold">{item.energy_kcal} kcal</Text>
            <Text className="text-muted-foreground text-xs">{t('pantry.kcalPer100g')}</Text>
          </View>
        </Pressable>
      )}
    />
  );
};
