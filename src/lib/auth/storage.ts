type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const memoryStorage = new Map<string, string>();

function getStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch (error) {
    console.warn("[AUTH STORAGE] localStorage unavailable; trying sessionStorage", error);
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn("[AUTH STORAGE] sessionStorage unavailable; using memory fallback", error);
    return null;
  }
}

export function readAuthValue(key: string): string | null {
  const storage = getStorage();
  if (storage) {
    try {
      const value = storage.getItem(key);
      if (value !== null) return value;
    } catch (error) {
      console.warn(`[AUTH STORAGE] Could not read "${key}"`, error);
    }
  }

  return memoryStorage.get(key) ?? null;
}

export function writeAuthValue(key: string, value: string): void {
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch (error) {
      console.warn(`[AUTH STORAGE] Could not persist "${key}"; using memory fallback`, error);
    }
  }

  memoryStorage.set(key, value);
}

export function removeAuthValue(key: string): void {
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.warn(`[AUTH STORAGE] Could not remove "${key}"`, error);
    }
  }
  memoryStorage.delete(key);
}
