// 简单内存缓存实现
interface CacheItem {
  value: any;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheItem>;

  constructor() {
    this.store = new Map<string, CacheItem>();
  }

  /**
   * 设置缓存项
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（毫秒）
   */
  set(key: string, value: any, ttl: number = 60000): void {
    const expiresAt: number = Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * 获取缓存项
   * @param key - 缓存键
   * @returns 缓存值或 undefined
   */
  get(key: string): any | undefined {
    const item: CacheItem | undefined = this.store.get(key);

    if (!item) {
      return undefined;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * 删除缓存项
   * @param key - 缓存键
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * 检查键是否存在
   * @param key - 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

// 创建缓存实例
const cache = new Cache();

export default cache;

export { Cache };
