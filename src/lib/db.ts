/**
 * Database Manager
 * Safari cache tozalansa ham ma'lumotlar saqlanib qolishi uchun
 * Native platform'da Capacitor Preferences, web'da localStorage ishlatadi
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Ma'lumotlarni saqlash
 * Native platform'da → Capacitor Preferences
 * Web'da → localStorage
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value });
  } else {
    localStorage.setItem(key, value);
  }
}

/**
 * Ma'lumotlarni o'qish
 */
export async function getItem(key: string): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key });
    return value;
  } else {
    return localStorage.getItem(key);
  }
}

/**
 * Ma'lumotlarni o'chirish
 */
export async function removeItem(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * Object saqlash (JSON)
 */
export async function setObject<T>(key: string, value: T): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

/**
 * Object o'qish (JSON)
 */
export async function getObject<T>(key: string): Promise<T | null> {
  const value = await getItem(key);
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Barcha ma'lumotlarni tozalash
 */
export async function clear(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.clear();
  } else {
    localStorage.clear();
  }
}

// Foydalanish:
// 
// import { db } from '@/lib/db';
//
// // Saqlash
// await db.setItem('user', JSON.stringify(userData));
// await db.setObject('user', userData);
//
// // O'qish
// const user = await db.getItem('user');
// const userData = await db.getObject<UserType>('user');
//
// // O'chirish
// await db.removeItem('user');
//
// // Hammasini tozalash
// await db.clear();
