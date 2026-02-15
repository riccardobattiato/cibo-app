import React, { createContext, useContext, useMemo } from 'react';
import { useDatabase } from '../DatabaseProvider/useDatabase';
import { IFoodRepository } from '@/repositories/food/IFoodRepository';
import { FoodRepository } from '@/repositories/food/food.repository';

interface RepositoriesContextProps {
  foodRepository: IFoodRepository;
}

const RepositoriesContext = createContext<RepositoriesContextProps | null>(null);

export const useRepositories = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error('useRepositories must be used within a RepositoriesProvider');
  }
  return context;
};

export const RepositoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const database = useDatabase();

  const repositories = useMemo(
    () => ({
      foodRepository: new FoodRepository(database),
    }),
    [database]
  );

  return (
    <RepositoriesContext.Provider value={repositories}>{children}</RepositoriesContext.Provider>
  );
};
