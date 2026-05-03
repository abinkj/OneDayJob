// redux/mmkvStore.ts
import { initializeStorage, getStorageInstance } from "../utilities/mmkvStore";
import { Storage } from "redux-persist";

export const mmkvStorage: Storage = {
  setItem: async (key, value) => {
    await initializeStorage();
    getStorageInstance().set(key, value);
    return Promise.resolve(true);
  },
  getItem: async (key) => {
    await initializeStorage();
    const value = getStorageInstance().getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: async (key) => {
    await initializeStorage();
    getStorageInstance().remove(key);
    return Promise.resolve();
  },
};

export default mmkvStorage;