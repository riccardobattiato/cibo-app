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

export default observer(function PantryScreen() {
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

  const handleCategorySubmit = () => {
    if (categoryName.trim()) {
      if (editingCategory) {
        updateCategory(editingCategory.id, categoryName);
      } else {
        addCategory(categoryName);
      }
      setCategoryName('');
      setEditingCategory(null);
      setIsCategoryDialogOpen(false);
    }
  };

  const handleOpenEditCategory = (cat: UserFoodCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setIsCategoryDialogOpen(true);
  };

  const isDetailView = selectedCategory !== undefined || searchQuery.length > 0;

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
          onSelectCategory={setSelectedCategory}
          onNewCategory={() => setIsCategoryDialogOpen(true)}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={deleteCategory}
        />
      ) : (
        <FoodList
          foods={foods}
          onFoodPress={(food) => {
            /* Handle food tap */
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
          }
        }}
        categoryName={categoryName}
        onCategoryNameChange={setCategoryName}
        onSubmit={handleCategorySubmit}
        isEditing={!!editingCategory}
      />
    </View>
  );
});
