import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/atoms/text';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { ChevronLeft } from 'lucide-react-native';
import { useRepositories } from '@/contexts/RepositoriesProvider/repositories.provider';
import { FoodWithCategory, UserFood, FoodNutrientWithDefinition } from '@/models/food';
import { useLanguage } from '@/locale/useLanguage';
import { Badge } from '@/components/atoms/badge';
import { Card } from '@/components/atoms/card';
import { NutrientTable } from '@/components/molecules/NutrientTable';
import { DonutChart } from '@/components/molecules/DonutChart';
import { categorizeNutrient, NutrientCategory } from '@/utils/helpers/nutrient-categorizer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FoodDetailScreen() {
  const { id, isCustom } = useLocalSearchParams<{ id: string; isCustom: string }>();
  const router = useRouter();
  const { foodRepository } = useRepositories();
  const [t] = useLanguage();
  const insets = useSafeAreaInsets();

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

  const chartData = useMemo(() => {
    if (!food) return [];
    // Ensure values are numbers and significant
    const protein = Number(food.protein_g) || 0;
    const fat = Number(food.fat_g) || 0;
    const carbs = Number(food.carbohydrates_g) || 0;
    const fiber = Number(food.fiber_g) || 0;

    return [
      { label: t('food.protein'), value: protein, color: '#ef4444' },
      { label: t('food.fat'), value: fat, color: '#f59e0b' },
      { label: t('food.carbs'), value: carbs, color: '#10b981' },
      { label: t('food.fiber'), value: fiber, color: '#3b82f6' },
    ].filter((item) => item.value > 0);
  }, [food, t]);

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

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, paddingTop: insets.top }}
        className="bg-background items-center justify-center">
        <Text>{t('pantry.all')}...</Text>
      </View>
    );
  }

  if (!food) {
    return (
      <View
        style={{ flex: 1, paddingTop: insets.top }}
        className="bg-background items-center justify-center">
        <Text>Food not found</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View className="border-border bg-card flex-row items-center gap-2 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Icon as={ChevronLeft} />
        </Button>
        <Text variant="h3" className="line-clamp-1 flex-1">
          {food.name}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2">
            <Text variant="h1" className="flex-1 text-left">
              {food.name}
            </Text>
            {isCustom === 'true' && (
              <Badge variant="secondary">
                <Text>{t('pantry.customCategories')}</Text>
              </Badge>
            )}
          </View>
          {food.scientific_name && (
            <Text className="text-muted-foreground mt-1 italic">{food.scientific_name}</Text>
          )}
          {food.english_name && (
            <Text className="text-muted-foreground mt-0.5">{food.english_name}</Text>
          )}
        </View>

        {/* Basic Stats Cards */}
        <View className="mb-6 flex-row flex-wrap gap-4">
          <Card className="min-w-[140px] flex-1 items-center py-4">
            <Text className="text-primary text-3xl font-bold">{food.energy_kcal} kcal</Text>
            <Text className="text-muted-foreground text-xs uppercase">
              {t('pantry.kcalPer100g')}
            </Text>
          </Card>

          <View className="min-w-[140px] flex-1 gap-4">
            <View className="bg-card border-border flex-row items-center justify-between rounded-xl border p-3">
              <Text className="text-muted-foreground text-sm">{t('food.ediblePart')}</Text>
              <Text className="font-semibold">{food.edible_part_percentage}%</Text>
            </View>
            <View className="bg-card border-border flex-row items-center justify-between rounded-xl border p-3">
              <Text className="text-muted-foreground text-sm">{t('food.portion')}</Text>
              <Text className="font-semibold">
                {food.portion_value} {food.portion_unit}
              </Text>
            </View>
          </View>
        </View>

        {/* Donut Chart */}
        {chartData.length > 0 && (
          <DonutChart
            data={chartData}
            totalKcal={food.energy_kcal || 0}
            title={t('food.macronutrients')}
            className="mb-6"
          />
        )}

        {/* Nutrient Tables */}
        <NutrientTable
          title={t('food.macronutrients')}
          nutrients={categorizedNutrients.macro.map((n) => ({
            name: n.name,
            value: n.value || 0,
            unit: n.unit || '',
          }))}
        />

        <NutrientTable
          title={t('food.minerals')}
          nutrients={categorizedNutrients.minerals.map((n) => ({
            name: n.name,
            value: n.value || 0,
            unit: n.unit || '',
          }))}
        />

        <NutrientTable
          title={t('food.vitamins')}
          nutrients={categorizedNutrients.vitamins.map((n) => ({
            name: n.name,
            value: n.value || 0,
            unit: n.unit || '',
          }))}
        />

        <NutrientTable
          title={t('food.aminoacids')}
          nutrients={categorizedNutrients.aminoacids.map((n) => ({
            name: n.name,
            value: n.value || 0,
            unit: n.unit || '',
          }))}
        />

        <NutrientTable
          title={t('food.other')}
          nutrients={categorizedNutrients.other.map((n) => ({
            name: n.name,
            value: n.value || 0,
            unit: n.unit || '',
          }))}
        />

        {food.information && (
          <View className="bg-muted mt-4 rounded-lg p-4">
            <Text className="text-muted-foreground text-sm italic">{food.information}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
