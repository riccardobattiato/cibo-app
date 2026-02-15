import { useContext } from 'react';
import { StorageContext } from './storage.provider';

export const useStorage = () => {
  const { storage: storageProvider } = useContext(StorageContext);
  return storageProvider;
};
