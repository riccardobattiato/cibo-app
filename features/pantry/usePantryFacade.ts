import { useGetCategories } from '@/hooks/useFood';

export const usePantryFacade = () => {
  const { data: categories, isLoading, error } = useGetCategories();

  return {
    categories,
    isLoading,
    error,
  };
};
