import { foodStore$ } from '@/features/pantry/food.store';
import { syncState } from '@legendapp/state';
import { FoodCategory, Food } from '@/models/food';

export const useGetCategories = () => {
  const categories = foodStore$.categories.get();
  const state = syncState(foodStore$.categories).get();

  return {
    data: categories || [],
    isLoading: !state.isLoaded,
    error: state.error,
    refetch: () => foodStore$.categories.sync(),
  };
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
