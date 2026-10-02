/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 安全移除 localStorage 中的键值项
 */
export function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`[safeStorage] 移除键 "${key}" 时失败:`, error);
  }
}

/**
 * 安全地从 localStorage 获取并解析数据
 * 如果读取或 JSON 解析失败（如数据损坏），自动清除损坏数据，记录 console.warn 警告，并平滑回退到默认值
 *
 * @param key 存储键名
 * @param defaultValue 当键不存在或解析异常时的默认回退值
 * @returns 解析后的数据或默认值
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }

    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }

    // 处理基础数字类型
    if (typeof defaultValue === 'number') {
      const parsedNum = Number(raw);
      if (Number.isNaN(parsedNum)) {
        throw new Error(`键 "${key}" 的存储值无法解析为有效数字: "${raw}"`);
      }
      return parsedNum as unknown as T;
    }

    // 处理基础布尔类型
    if (typeof defaultValue === 'boolean') {
      if (raw === 'true') return true as unknown as T;
      if (raw === 'false') return false as unknown as T;
      try {
        return Boolean(JSON.parse(raw)) as unknown as T;
      } catch {
        throw new Error(`键 "${key}" 的存储值无法解析为有效布尔值: "${raw}"`);
      }
    }

    // 处理基础字符串类型
    if (typeof defaultValue === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') {
          return parsed as unknown as T;
        }
      } catch {
        // 非 JSON 格式普通字符串，直接返回 raw
      }
      return raw as unknown as T;
    }

    // 处理复合类型 (对象、数组等)
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(
      `[safeStorage] 从 localStorage 解析键 "${key}" 异常，已自动清除损坏数据并回退至默认值。`,
      error
    );
    safeRemoveItem(key);
    return defaultValue;
  }
}

/**
 * 安全地将数据序列化并保存到 localStorage
 *
 * @param key 存储键名
 * @param value 要保存的值
 */
export function safeSetItem<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`[safeStorage] 写入键 "${key}" 到 localStorage 时失败:`, error);
  }
}
