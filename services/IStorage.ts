export enum StorageKeys {
  AppLanguage = 'APP_LANGUAGE',
}

export interface IStorage {
  readonly getNumber: (key: StorageKeys) => number | undefined;
  readonly getBoolean: (key: StorageKeys) => boolean | undefined;
  readonly getString: (key: StorageKeys) => string | undefined;
  readonly setItem: (key: StorageKeys, value: string) => void;
  readonly removeItem: (key: StorageKeys) => void;
}

export class NotImplementedStorage implements IStorage {
  public readonly getNumber = () => {
    throw new Error('Not implemented');
  };
  public readonly getBoolean = () => {
    throw new Error('Not implemented');
  };
  public readonly getString = () => {
    throw new Error('Not implemented');
  };
  public readonly setItem = () => {
    throw new Error('Not implemented');
  };
  public readonly removeItem = () => {
    throw new Error('Not implemented');
  };
}
