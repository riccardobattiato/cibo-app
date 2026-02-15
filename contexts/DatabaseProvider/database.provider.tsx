import React, { createContext, useEffect, useState } from 'react';
import { database, IDatabase } from '@/portability/DatabaseHandler/DatabaseHandler';

export const DatabaseContext = createContext<IDatabase | null>(null);

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
