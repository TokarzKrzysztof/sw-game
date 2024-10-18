export type Score = {
  winner: 'one' | 'two' | 'draw';
  scores: [number, number];
};

export type ObjectStorageKey = {
  'game-history': Score[];
};

export class LocalStorage {
  static setObjectValue<TKey extends keyof ObjectStorageKey>(
    key: TKey,
    value: ObjectStorageKey[TKey]
  ) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static getObjectValue<TKey extends keyof ObjectStorageKey>(
    key: TKey
  ): ObjectStorageKey[TKey] | null {
    const data = window.localStorage.getItem(key);
    if (data !== null) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  static clearValue(key: keyof ObjectStorageKey) {
    window.localStorage.removeItem(key);
  }
}
