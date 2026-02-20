import { foodStore$, searchQuery$ } from '../food.store';
import { syncState } from '@legendapp/state';
import { useValue } from '@legendapp/state/react';
import { useRepositories } from '@/contexts/RepositoriesProvider/repositories.provider';
import { UserFood } from '@/models/food';
import { indexingService } from '@/services/IndexingService';

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
    foodStore$.searchQuery.set(query);
  };

  const addFood = async (food: Omit<UserFood, 'id'>) => {
    const id = await foodRepository.createUserFood(food);
    const created = await foodRepository.getUserFoodById(id);
    if (created) {
      indexingService.indexUserFood(created);
    }
    syncState(foodStore$.userFoods).sync();
    syncState(foodStore$.foods).sync();
  };

  const updateFood = async (id: number, food: Partial<UserFood>) => {
    await foodRepository.updateUserFood(id, food);
    const updated = await foodRepository.getUserFoodById(id);
    if (updated) {
      indexingService.indexUserFood(updated);
    }
    syncState(foodStore$.userFoods).sync();
    syncState(foodStore$.foods).sync();
  };

  const deleteFood = async (id: number) => {
    await foodRepository.deleteUserFood(id);
    syncState(foodStore$.userFoods).sync();
    syncState(foodStore$.foods).sync();
  };

  const createVariation = async (foodId: number, isUserFood: boolean) => {
    let newId: number;
    if (isUserFood) {
      newId = await foodRepository.createUserFoodVariation(foodId);
    } else {
      newId = await foodRepository.createVariation(foodId);
    }
    const created = await foodRepository.getUserFoodById(newId);
    if (created) {
      indexingService.indexUserFood(created);
    }
    syncState(foodStore$.userFoods).sync();
    syncState(foodStore$.foods).sync();
  };

  return {
    foods,
    userFoods,
    searchQuery,
    setSearchQuery,
    addFood,
    updateFood,
    deleteFood,
    createVariation,
    isLoading,
    syncError: error,
  };
};
