import { get, set, del } from 'idb-keyval';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => {
      const val = await get(key);
      return val as string | null;
    },
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
});
