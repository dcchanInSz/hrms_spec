/**
 * 简单内存缓存工具
 * 用于 API 响应缓存，减少数据库查询
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 存活时间（秒）
   */
  set(key, value, ttl = 300) {
    const now = Date.now();
    this.cache.set(key, value);
    this.timestamps.set(key, now + ttl * 1000);
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {*} 缓存值或 undefined
   */
  get(key) {
    const expiry = this.timestamps.get(key);
    if (!expiry) return undefined;

    if (Date.now() > expiry) {
      this.delete(key);
      return undefined;
    }

    return this.cache.get(key);
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * 检查缓存是否存在且未过期
   * @param {string} key - 缓存键
   * @returns {boolean}
   */
  has(key) {
    const expiry = this.timestamps.get(key);
    if (!expiry) return false;

    if (Date.now() > expiry) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.timestamps) {
      if (now > expiry) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }
}

// 全局缓存实例
const cache = new MemoryCache();

// 定期清理过期缓存 (每 5 分钟)
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

/**
 * Express 中间件：缓存响应
 * @param {string} key - 缓存键生成函数 (req) => string
 * @param {number} ttl - 存活时间（秒）
 * @param {Function} condition - 条件函数，返回 true 时才缓存
 */
function cacheMiddleware(keyFn, ttl = 300, condition = () => true) {
  return (req, res, next) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return next();
    }

    // 检查条件
    if (!condition(req)) {
      return next();
    }

    const cacheKey = keyFn(req);
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // 保存原始 json 方法
    const originalJson = res.json.bind(res);

    // 拦截响应
    res.json = (data) => {
      // 只有成功响应才缓存
      if (res.statusCode === 200 && data) {
        cache.set(cacheKey, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * 清除特定路径的缓存
 * @param {string} pattern - 路径模式 (支持正则)
 */
function invalidateCache(pattern) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

  for (const key of cache.cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * 清除用户相关缓存
 * @param {string} userId - 用户 ID
 */
function invalidateUserCache(userId) {
  invalidateCache(new RegExp(userId));
}

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  invalidateUserCache,
  MemoryCache,
};