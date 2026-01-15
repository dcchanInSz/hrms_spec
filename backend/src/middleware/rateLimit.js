/**
 * 简单请求频率限制中间件
 * 使用内存存储实现简单限流
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 默认 1 分钟
    this.max = options.max || 100; // 默认最大 100 次请求
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
    this.handler = options.handler || this.defaultHandler;

    this.windows = new Map();
  }

  defaultHandler(req, res) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(this.windowMs / 1000),
    });
  }

  checkLimit(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 获取或创建窗口
    if (!this.windows.has(key)) {
      this.windows.set(key, { count: 0, firstRequest: now });
    }

    const window = this.windows.get(key);

    // 如果窗口已过期，重置
    if (window.firstRequest < windowStart) {
      window.count = 0;
      window.firstRequest = now;
    }

    // 增加请求计数
    window.count++;

    // 返回剩余请求数和是否超限
    return {
      remaining: Math.max(0, this.max - window.count),
      limit: this.max,
      isLimited: window.count > this.max,
    };
  }

  middleware() {
    return (req, res, next) => {
      const key = this.keyGenerator(req);
      const { isLimited, remaining, limit } = this.checkLimit(key);

      // 添加速率限制头
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);

      if (isLimited) {
        res.setHeader('Retry-After', Math.ceil(this.windowMs / 1000));
        return this.handler(req, res, next);
      }

      next();
    };
  }
}

/**
 * 创建特定类型的速率限制器
 */
const rateLimiters = {
  // 默认全局速率限制
  default: new RateLimiter({
    windowMs: 60 * 1000, // 1 分钟
    max: 100, // 每分钟 100 次请求
  }),

  // 登录速率限制（更严格）
  login: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 5, // 每 15 分钟最多 5 次登录尝试
    keyGenerator: (req) => `login:${req.ip}`,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too Many Requests',
        message: '登录尝试过于频繁，请 15 分钟后再试',
        code: 'LOGIN_RATE_LIMIT_EXCEEDED',
        retryAfter: 900,
      });
    },
  }),

  // API 速率限制
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 分钟
    max: 60, // 每分钟 60 次 API 请求
  }),
};

module.exports = {
  RateLimiter,
  rateLimiters,
};