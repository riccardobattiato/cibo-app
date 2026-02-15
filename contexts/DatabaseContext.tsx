import React, { createContext, useContext, useEffect, useState } from 'react';
import { database, IDatabase } from '@/portability/database';

const DatabaseContext = createContext<IDatabase | null>(null);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    database
      .initialize()
      .then(() => {
        if (isMounted) {
          setIsInitialized(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          console.error('Database initialization failed', err);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    // In a real app, we might want to show an error screen
    return null;
  }

  if (!isInitialized) {
    // Should ideally show a loader
    return null;
  }

  return <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>;
};
