import { LazyStore } from "@tauri-apps/plugin-store";

const STORE_PATH = "antler-coder-settings.json";

const store = new LazyStore(STORE_PATH, { defaults: {}, autoSave: 200 });

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await store.get<T>(key);
    return value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await store.set(key, value);
  await store.save();
}
