import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { observer } from '@legendapp/state/react';
import { usePantryFacade } from '@/features/pantry/usePantryFacade';
import { FoodList } from '@/features/pantry/components/FoodList';
import { CategoryDialog } from '@/features/pantry/components/CategoryDialog';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { Edit2, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/atoms/text';
import { useLanguage } from '@/locale/useLanguage';

export default observer(function CategoryScreen() {
  const { id, isCustom } = useLocalSearchParams<{ id: string; isCustom: string }>();
  const router = useRouter();
  const [t] = useLanguage();
  const { categories, userCategories, foods, setSelectedCategory, updateCategory, isLoading } =
    usePantryFacade();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Package');

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

  const handleUpdate = () => {
    if (categoryName.trim() && currentCategory) {
      updateCategory(currentCategory.id, categoryName, categoryIcon);
      setIsDialogOpen(false);
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
          headerRight: () =>
            custom ? (
              <Button variant="ghost" size="icon" onPress={() => setIsDialogOpen(true)}>
                <Icon as={Edit2} size={20} />
              </Button>
            ) : null,
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
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryName={categoryName}
        onCategoryNameChange={setCategoryName}
        categoryIcon={categoryIcon}
        onCategoryIconChange={setCategoryIcon}
        onSubmit={handleUpdate}
        isEditing={true}
      />
    </View>
  );
});
