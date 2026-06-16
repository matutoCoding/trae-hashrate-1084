import Taro from '@tarojs/taro';

const STORAGE_PREFIX = 'douxiangfang_';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const fullKey = STORAGE_PREFIX + key;
      const data = Taro.getStorageSync(fullKey);
      if (data === '' || data === null || data === undefined) {
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch (e) {
      console.error('[Storage] 读取失败:', key, e);
      return defaultValue;
    }
  },

  set(key: string, value: any): void {
    try {
      const fullKey = STORAGE_PREFIX + key;
      Taro.setStorageSync(fullKey, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage] 写入失败:', key, e);
    }
  },

  remove(key: string): void {
    try {
      const fullKey = STORAGE_PREFIX + key;
      Taro.removeStorageSync(fullKey);
    } catch (e) {
      console.error('[Storage] 删除失败:', key, e);
    }
  }
};

export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNowTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${getTodayDate()} ${hours}:${minutes}`;
};
