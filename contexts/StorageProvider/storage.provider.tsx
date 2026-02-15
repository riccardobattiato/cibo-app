import React, { createContext, ReactNode, useMemo } from 'react';
import { IStorage, NotImplementedStorage } from '../../services';

export type StorageProviderContextProps = {
  storage: IStorage;
};

export const StorageContext = createContext<StorageProviderContextProps>({
  storage: new NotImplementedStorage(),
});

type StorageProviderProps = {
  children: ReactNode;
  StorageImplementation?: new () => IStorage;
  storageInstance?: IStorage;
};

export const StorageProvider: React.FC<StorageProviderProps> = ({
  children,
  StorageImplementation,
  storageInstance,
}) => {
  const storage = useMemo(() => {
    if (storageInstance) {
      return storageInstance;
    }

    if (StorageImplementation) {
      return new StorageImplementation();
    }

    throw new Error(
      'No instance found, should exist at least one between StorageImplementation or storageInstance'
    );
  }, [StorageImplementation, storageInstance]);

  return <StorageContext.Provider value={{ storage }}>{children}</StorageContext.Provider>;
};
