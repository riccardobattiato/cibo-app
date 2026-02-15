import { useCategoryFacade } from './facades/useCategoryFacade';
import { useFoodFacade } from './facades/useFoodFacade';

/**
 * usePantryFacade is a consolidated facade that provides access to both
 * category and food related pantry logic.
 */
export const usePantryFacade = () => {
  const categoryFacade = useCategoryFacade();
  const foodFacade = useFoodFacade();

  return {
    ...categoryFacade,
    ...foodFacade,
    isLoading: categoryFacade.isLoading || foodFacade.isLoading,
    syncError: categoryFacade.syncError || foodFacade.syncError,
  };
};
