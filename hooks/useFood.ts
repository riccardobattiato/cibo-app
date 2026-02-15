import { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '@/contexts/RepositoriesProvider/repositories.provider';
import { FoodCategory, Food } from '@/models/food';

export const useGetCategories = () => {
  const { foodRepository } = useRepositories();
  const [data, setData] = useState<FoodCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const categories = await foodRepository.getCategories();
      setData(categories);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [foodRepository]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, isLoading, error, refetch: fetchCategories };
};

export const useSearchFoods = (query: string) => {
  const { foodRepository } = useRepositories();
  const [data, setData] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      return;
    }

    let isMounted = true;
    const search = async () => {
      try {
        setIsLoading(true);
        const results = await foodRepository.searchFoods(query);
        if (isMounted) {
          setData(results);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query, foodRepository]);

  return { data, isLoading, error };
};
