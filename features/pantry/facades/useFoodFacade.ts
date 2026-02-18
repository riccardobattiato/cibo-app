import { foodStore$, searchQuery$ } from '../food.store';
import { syncState } from '@legendapp/state';
import { useValue } from '@legendapp/state/react';
import { useRepositories } from '@/contexts/RepositoriesProvider/repositories.provider';
import { UserFood } from '@/models/food';

export const useFoodFacade = () => {
  const { foodRepository } = useRepositories();
  const foods = useValue(foodStore$.foods);
  const userFoods = useValue(foodStore$.userFoods);
  const searchQuery = useValue(searchQuery$);

  const { isLoading, error } = useValue(() => {
    const s2 = syncState(foodStore$.foods);
    const s4 = syncState(foodStore$.userFoods);

    return {
      isLoading: !s2.isLoaded.get() || !s4.isLoaded.get(),
      error: s2.error.get() || s4.error.get(),
    };
  });

  const setSearchQuery = (query: string) => {
    searchQuery$.set(query);
    syncState(foodStore$.foods).sync();
  };

  const addFood = (food: Omit<UserFood, 'id'>) => {
    foodStore$.userFoods.push({ ...food, id: 0 } as UserFood);
  };

  const createVariation = async (foodId: number) => {
    try {
      await foodRepository.createVariation(foodId);
      syncState(foodStore$.userFoods).sync();
    } catch (error) {
      console.error('Failed to create variation:', error);
      throw error;
    }
  };

  return {
    foods,
    userFoods,
    searchQuery,
    setSearchQuery,
    addFood,
    createVariation,
    isLoading,
    syncError: error,
  };
};
