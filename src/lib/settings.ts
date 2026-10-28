import "server-only";
import { cache } from "react";
import { db } from "./db";
import { DEFAULT_SETTINGS, type SettingKey, type SettingValue } from "./settings-defaults";

/** Instelling uit de database, aangevuld met standaardwaarden voor ontbrekende velden. */
export const getSetting = cache(async <K extends SettingKey>(key: K): Promise<SettingValue<K>> => {
  const row = await db.setting.findUnique({ where: { key } });
  const fallback = DEFAULT_SETTINGS[key];
  if (!row) return fallback;
  return { ...fallback, ...(row.value as object) } as SettingValue<K>;
});

export async function saveSetting<K extends SettingKey>(key: K, value: SettingValue<K>) {
  await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
