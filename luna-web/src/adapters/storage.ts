/** Thin wrapper over browser storage so logic and data layers never touch it directly. */
export interface StorageAdapter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const PREFIX = 'luna.';

export const storage: StorageAdapter = {
  get<T>(key: string): T | undefined {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw === null ? undefined : (JSON.parse(raw) as T);
    } catch {
      return undefined;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // PROTO: storage failures (private mode, quota) are ignored; real app needs a visible error.
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      // PROTO: see above.
    }
  },
};
