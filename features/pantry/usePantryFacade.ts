import { foodStore$, selectedCategoryId$ } from './food.store';
import { syncState } from '@legendapp/state';
import { useValue, useObserve } from '@legendapp/state/react';
import { useRepositories } from '@/contexts/RepositoriesProvider/repositories.provider';
import { UserFood } from '@/models/food';

/**
 * usePantryFacade is the business logic layer for the pantry feature.
 *
 * Legend State v3 React API Implementation:
 * - useValue: The modern replacement for use$ / useSelector.
 *             It is preferred for its clarity and compatibility with the React Compiler.
 * - useObserve: Used for side effects that react to observable changes.
 */
export const usePantryFacade = () => {
  const { foodRepository } = useRepositories();

  // --- Reactive Data (using useValue) ---
  const categories = useValue(foodStore$.categories);
  const foods = useValue(foodStore$.foods);
  const userCategories = useValue(foodStore$.userCategories);
  const userFoods = useValue(foodStore$.userFoods);
  const selectedCategoryId = useValue(selectedCategoryId$);

  // --- Sync Status (using useValue with a selector) ---
  const { isLoading, error: syncError } = useValue(() => {
    const s1 = syncState(foodStore$.categories);
    const s2 = syncState(foodStore$.foods);
    const s3 = syncState(foodStore$.userCategories);
    const s4 = syncState(foodStore$.userFoods);

    return {
      isLoading:
        !s1.isLoaded.get() || !s2.isLoaded.get() || !s3.isLoaded.get() || !s4.isLoaded.get(),
      error: s1.error.get() || s2.error.get() || s3.error.get() || s4.error.get(),
    };
  });

  // --- Side Effects (using useObserve) ---
  // Example: Log sync errors when they occur
  useObserve(() => {
    if (syncError) {
      console.error('Pantry Sync Error:', syncError);
    }
  });

  // --- Actions ---

  const setSelectedCategory = (id: number | undefined) => {
    selectedCategoryId$.set(id);
  };

  const addCategory = (name: string) => {
    foodStore$.userCategories.push({ id: 0, name });
  };

  const addFood = (food: Omit<UserFood, 'id'>) => {
    foodStore$.userFoods.push({ ...food, id: 0 } as UserFood);
  };

  const createVariation = async (foodId: number) => {
    try {
      await foodRepository.createVariation(foodId);
      // Explicitly trigger a re-sync of user foods
      // @ts-ignore - sync() is available on synced observables in LS v3
      await foodStore$.userFoods.sync();
    } catch (error) {
      console.error('Failed to create variation:', error);
      throw error;
    }
  };

  return {
    // Data
    categories,
    foods,
    userCategories,
    userFoods,
    selectedCategoryId,

    // Status
    isLoading,
    syncError,

    // Actions
    setSelectedCategory,
    addCategory,
    addFood,
    createVariation,

    // Raw Observables
    observables: {
      categories: foodStore$.categories,
      foods: foodStore$.foods,
      userCategories: foodStore$.userCategories,
      userFoods: foodStore$.userFoods,
    },
  };
};
