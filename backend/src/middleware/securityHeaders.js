/**
 * 安全头配置
 * 使用 Helmet.js 增强 Express 应用安全性
 */

const helmet = require('helmet');

// CSP 策略配置
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // 允许内联样式（Tailwind）
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  },
};

/**
 * 创建 Helmet 中间件配置
 * @param {Object} options - 配置选项
 * @returns {Function} Helmet 中间件
 */
function createSecurityHeaders(options = {}) {
  const {
    csp = cspConfig,
    hsts = true,
    hidePoweredBy = true,
    contentTypeSniffing = true,
    frameguard = true,
    xssFilter = true,
    noSniff = true,
    dnsPrefetchControl = true,
    ieNoOpen = true,
    referrerPolicy = true,
  } = options;

  // 创建基础链
  const middlewares = [];

  // 1. 隐藏 X-Powered-By 头
  if (hidePoweredBy) {
    middlewares.push((req, res, next) => {
      res.removeHeader('X-Powered-By');
      next();
    });
  }

  // 2. Helmet 安全头
  const helmetConfig = {};

  if (csp) {
    helmetConfig.contentSecurityPolicy = typeof csp === 'object' ? { directives: csp.directives } : csp;
  }

  if (hsts) {
    helmetConfig.strictTransportSecurity = {
      maxAge: 31536000, // 1 年
      includeSubDomains: true,
      preload: true,
    };
  }

  if (contentTypeSniffing) {
    helmetConfig.xContentTypeOptions = true;
  }

  if (frameguard) {
    helmetConfig.frameguard = { action: 'deny' };
  }

  if (xssFilter) {
    helmetConfig.xssFilter = true;
  }

  if (noSniff) {
    helmetConfig.noSniff = true;
  }

  if (dnsPrefetchControl) {
    helmetConfig.dnsPrefetchControl = { allow: false };
  }

  if (ieNoOpen) {
    helmetConfig.ieNoOpen = true;
  }

  if (referrerPolicy) {
    helmetConfig.referrerPolicy = { policy: 'strict-origin-when-cross-origin' };
  }

  middlewares.push(helmet(helmetConfig));

  return middlewares;
}

/**
 * 安全头中间件
 * 用于 app.js 中间件配置
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      ...cspConfig.directives,
      // 开发环境允许更多内容
      ...(process.env.NODE_ENV === 'development' && {
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      }),
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  xContentTypeOptions: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  dnsPrefetchControl: { allow: false },
  ieNoOpen: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

module.exports = {
  securityHeaders,
  createSecurityHeaders,
  cspConfig,
};