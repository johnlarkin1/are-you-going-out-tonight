import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'device_id';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

/** In-memory cache — after first read, calls are synchronous-fast. */
let cached: string | null = null;

/** Dedup concurrent calls during initial load. */
let pending: Promise<string> | null = null;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual v4 UUID fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function readFromStore(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') {
      const val = await SecureStore.getItemAsync(STORAGE_KEY);
      if (val && isValidUUID(val)) return val;
    }
  } catch {
    // SecureStore unavailable — fall through to AsyncStorage
  }

  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val && isValidUUID(val)) return val;
  } catch {
    // AsyncStorage failed too
  }

  return null;
}

async function writeToStore(id: string): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(STORAGE_KEY, id);
    }
  } catch {
    // SecureStore write failed — continue with AsyncStorage
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Best-effort — ID is still in memory
  }
}

export async function getOrCreateDeviceId(): Promise<string> {
  if (cached) return cached;

  if (pending) return pending;

  pending = (async () => {
    const existing = await readFromStore();
    if (existing) {
      cached = existing;
      return existing;
    }

    const id = generateUUID();
    await writeToStore(id);
    cached = id;
    return id;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}
