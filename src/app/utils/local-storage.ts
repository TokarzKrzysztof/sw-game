import { GameResult } from '../models/game-result';

export type StorageKey = {
  'game-history': GameResult[];
};

export class LocalStorage {
  static setValue<TKey extends keyof StorageKey>(
    key: TKey,
    value: StorageKey[TKey]
  ) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static getValue<TKey extends keyof StorageKey>(
    key: TKey
  ): StorageKey[TKey] | null {
    const data = window.localStorage.getItem(key);
    if (data !== null) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  static clearValue(key: keyof StorageKey) {
    window.localStorage.removeItem(key);
  }
}
