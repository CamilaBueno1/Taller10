// src/shared/infrastructure/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Supabase espera métodos getItem/setItem/removeItem, pero expo-secure-store
// expone getItemAsync/setItemAsync/deleteItemAsync – este adaptador los mapea.
const SecureStoreAdapter = {
  getItem: (key: string) => 
    SecureStore.getItemAsync(key),
  
  setItem: (key: string, value: string) => 
    SecureStore.setItemAsync(key, value),
  
  removeItem: (key: string) => 
    SecureStore.deleteItemAsync(key),
};

const getWebStorage = () =>
  (
    globalThis as typeof globalThis & {
      localStorage?: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
        removeItem: (key: string) => void;
      };
    }
  ).localStorage;

const WebStorageAdapter = {
  getItem: async (key: string) =>
    getWebStorage()?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => {
    getWebStorage()?.setItem(key, value);
  },
  removeItem: async (key: string) => {
    getWebStorage()?.removeItem(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: Platform.OS === 'web' ? WebStorageAdapter : SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);