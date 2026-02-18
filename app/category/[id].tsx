import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { observer } from '@legendapp/state/react';
import { usePantryFacade } from '@/features/pantry/usePantryFacade';
import { FoodList } from '@/features/pantry/components/FoodList';
import { CategoryDialog } from '@/features/pantry/components/CategoryDialog';
import { FoodDialog } from '@/features/pantry/components/FoodDialog';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Edit2, ChevronLeft, Plus } from 'lucide-react-native';
import { Text } from '@/components/atoms/text';
import { UserFood } from '@/models/food';

export default observer(function CategoryScreen() {
  const { id, isCustom } = useLocalSearchParams<{ id: string; isCustom: string }>();
  const router = useRouter();
  const {
    categories,
    userCategories,
    foods,
    setSelectedCategory,
    updateCategory,
    addFood,
    isLoading,
  } = usePantryFacade();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Package');
  const [newFood, setNewFood] = useState<Partial<UserFood>>({});

  const categoryId = Number(id);
  const custom = isCustom === 'true';

  useEffect(() => {
    setSelectedCategory(categoryId, custom);
    return () => setSelectedCategory(undefined);
  }, [categoryId, custom]);

  const currentCategory = custom
    ? userCategories.find((c) => c.id === categoryId)
    : categories.find((c) => c.id === categoryId);

  useEffect(() => {
    if (currentCategory) {
      setCategoryName(currentCategory.name);
      setCategoryIcon(currentCategory.icon || 'Package');
    }
  }, [currentCategory]);

  const handleUpdateCategory = () => {
    if (categoryName.trim() && currentCategory) {
      updateCategory(currentCategory.id, categoryName, categoryIcon);
      setIsCategoryDialogOpen(false);
    }
  };

  const handleOpenFoodDialog = () => {
    setNewFood({
      name: '',
      category_id: custom ? categoryId : (currentCategory?.id ?? null),
      is_category_custom: custom,
      energy_kcal: null,
      protein_g: null,
      fat_g: null,
      carbohydrates_g: null,
      sugar_g: null,
      fiber_g: null,
      sodium_mg: null,
    });
    setIsFoodDialogOpen(true);
  };

  const handleCreateFood = () => {
    if (newFood.name?.trim()) {
      addFood({
        name: newFood.name,
        category_id: newFood.category_id ?? null,
        is_category_custom: newFood.is_category_custom ?? false,
        source_food_id: null,
        scientific_name: null,
        english_name: null,
        information: null,
        edible_part_percentage: null,
        portion_value: null,
        portion_unit: null,
        energy_kcal: newFood.energy_kcal ?? null,
        protein_g: newFood.protein_g ?? null,
        fat_g: newFood.fat_g ?? null,
        carbohydrates_g: newFood.carbohydrates_g ?? null,
        sugar_g: newFood.sugar_g ?? null,
        fiber_g: newFood.fiber_g ?? null,
        sodium_mg: newFood.sodium_mg ?? null,
      });
      setIsFoodDialogOpen(false);
      setNewFood({});
    }
  };

  return (
    <View className="bg-background flex-1">
      <Stack.Screen
        options={{
          title: currentCategory?.name || '',
          headerShown: true,
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()}>
              <Icon as={ChevronLeft} />
            </Button>
          ),
          headerRight: () => (
            <View className="flex-row gap-1">
              <Button variant="ghost" size="icon" onPress={handleOpenFoodDialog}>
                <Icon as={Plus} size={20} />
              </Button>
              {custom ? (
                <Button variant="ghost" size="icon" onPress={() => setIsCategoryDialogOpen(true)}>
                  <Icon as={Edit2} size={20} />
                </Button>
              ) : null}
            </View>
          ),
        }}
      />

      {isLoading && !foods.length ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground italic">Loading...</Text>
        </View>
      ) : (
        <FoodList
          foods={foods}
          onFoodPress={(food) => {
            router.push({
              pathname: '/food/[id]',
              params: { id: food.id, isCustom: 'is_category_custom' in food ? 'true' : 'false' },
            });
          }}
        />
      )}

      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categoryName={categoryName}
        onCategoryNameChange={setCategoryName}
        categoryIcon={categoryIcon}
        onCategoryIconChange={setCategoryIcon}
        onSubmit={handleUpdateCategory}
        isEditing={true}
      />

      <FoodDialog
        isOpen={isFoodDialogOpen}
        onOpenChange={setIsFoodDialogOpen}
        food={newFood}
        onFoodChange={setNewFood}
        onSubmit={handleCreateFood}
        isEditing={false}
      />
    </View>
  );
});
