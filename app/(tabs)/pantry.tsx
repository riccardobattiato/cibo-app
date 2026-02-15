import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms/text';
import { observer } from '@legendapp/state/react';
import { usePantryFacade } from '@/features/pantry/usePantryFacade';
import { PantryHeader } from '@/features/pantry/components/PantryHeader';
import { CategoryGrid } from '@/features/pantry/components/CategoryGrid';
import { FoodList } from '@/features/pantry/components/FoodList';
import { CategoryDialog } from '@/features/pantry/components/CategoryDialog';
import { UserFoodCategory } from '@/models/food';
import { useRouter } from 'expo-router';

export default observer(function PantryScreen() {
  const router = useRouter();
  const {
    categories,
    userCategories,
    foods,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    syncError,
    addCategory,
    updateCategory,
    deleteCategory,
  } = usePantryFacade();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UserFoodCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Package');

  const handleCategorySubmit = () => {
    if (categoryName.trim()) {
      if (editingCategory) {
        updateCategory(editingCategory.id, categoryName, categoryIcon);
      } else {
        addCategory(categoryName, categoryIcon);
      }
      setCategoryName('');
      setCategoryIcon('Package');
      setEditingCategory(null);
      setIsCategoryDialogOpen(false);
    }
  };

  const handleOpenEditCategory = (cat: UserFoodCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryIcon(cat.icon || 'Package');
    setIsCategoryDialogOpen(true);
  };

  const handleSelectCategory = (id: number, isCustom: boolean) => {
    if (id === 0 && !isCustom) {
      setSelectedCategory(id);
    } else {
      router.push({
        pathname: '/category/[id]',
        params: { id, isCustom: isCustom ? 'true' : 'false' },
      });
    }
  };

  const isAllSelected = selectedCategory?.id === 0 && !selectedCategory?.isCustom;
  const isDetailView = isAllSelected || searchQuery.length > 0;

  if (isLoading && !categories.length) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-muted-foreground italic">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <PantryHeader
        isDetailView={isDetailView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={() => {
          setSelectedCategory(undefined);
          setSearchQuery('');
        }}
        onNewCategory={() => setIsCategoryDialogOpen(true)}
      />

      {syncError && (
        <View className="bg-destructive/10 p-4">
          <Text className="text-destructive text-sm">
            Error: {typeof syncError === 'string' ? syncError : JSON.stringify(syncError)}
          </Text>
        </View>
      )}

      {!isDetailView ? (
        <CategoryGrid
          categories={categories}
          userCategories={userCategories}
          onSelectCategory={handleSelectCategory}
          onNewCategory={() => setIsCategoryDialogOpen(true)}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={deleteCategory}
        />
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
        onOpenChange={(open) => {
          setIsCategoryDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            setCategoryName('');
            setCategoryIcon('Package');
          }
        }}
        categoryName={categoryName}
        onCategoryNameChange={setCategoryName}
        categoryIcon={categoryIcon}
        onCategoryIconChange={setCategoryIcon}
        onSubmit={handleCategorySubmit}
        isEditing={!!editingCategory}
      />
    </View>
  );
});
