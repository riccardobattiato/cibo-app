import { foodStore$, selectedCategory$ } from '../food.store';
import { syncState } from '@legendapp/state';
import { useValue } from '@legendapp/state/react';

export const useCategoryFacade = () => {
  const categories = useValue(foodStore$.categories);
  const userCategories = useValue(foodStore$.userCategories);
  const selectedCategory = useValue(selectedCategory$);

  const { isLoading, error } = useValue(() => {
    const s1 = syncState(foodStore$.categories);
    const s3 = syncState(foodStore$.userCategories);

    return {
      isLoading: !s1.isLoaded.get() || !s3.isLoaded.get(),
      error: s1.error.get() || s3.error.get(),
    };
  });

  const setSelectedCategory = (id: number | undefined, isCustom: boolean = false) => {
    if (id === undefined) {
      selectedCategory$.set(undefined);
    } else {
      selectedCategory$.set({ id, isCustom });
    }
    syncState(foodStore$.foods).sync();
  };

  const addCategory = (name: string, icon?: string) => {
    foodStore$.userCategories.push({ id: 0, name, icon });
  };

  const updateCategory = (id: number, name: string, icon?: string) => {
    const index = foodStore$.userCategories.findIndex((c) => c.id.get() === id);
    if (index !== -1) {
      foodStore$.userCategories[index].assign({ name, icon });
    }
  };

  const deleteCategory = (id: number) => {
    const index = foodStore$.userCategories.findIndex((c) => c.id.get() === id);
    if (index !== -1) {
      foodStore$.userCategories.splice(index, 1);
    }
  };

  return {
    categories,
    userCategories,
    selectedCategory,
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    syncError: error,
  };
};
