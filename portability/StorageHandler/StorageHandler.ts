import { IStorage, StorageKeys } from '../../services';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export class StorageHandler implements IStorage {
  getNumber: (key: StorageKeys) => number | undefined = (key) => {
    return storage.getNumber(key);
  };
  getBoolean: (key: StorageKeys) => boolean | undefined = (key) => {
    return storage.getBoolean(key);
  };
  getString: (key: StorageKeys) => string | undefined = (key) => {
    return storage.getString(key);
  };
  setItem: (key: StorageKeys, value: string) => void = (key, val) => {
    return storage.set(key, val);
  };
  removeItem: (key: StorageKeys) => void = (key) => {
    return storage.remove(key);
  };
}
