/**
 * SQL 注入防护工具
 * 提供输入验证和清理功能
 */

// SQL 注入常见模式
const DANGEROUS_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\')|(\-\-)|(\%23)|(#))+/i,
  /((\%27)|(\')|(\-\-)|(\%23)|(#));/,
  /(\s|;|\/|\\)/, // 空格、分号、斜杠、反斜杠
  /(\%2F)|(\*)/, // URL 编码的斜杠和星号
  /(\%22)|(")/, // 双引号
  /(\%27)|(\')/, // 单引号
  /(\%60)|(`)/, // 反引号
  /((\%77)|w)|((\%33)|3)|((\%32)|2)/i, // or 1=1 等常见注入模式
];

// SQL 关键字
const SQL_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
  'EXEC', 'EXECUTE', 'UNION', 'WHERE', 'FROM', 'TABLE', 'DATABASE', 'SCHEMA',
  'INFORMATION_SCHEMA', 'pg_catalog', 'pg_', '--', '/*', '*/', 'BENCHMARK',
  'SLEEP', 'WAITFOR', 'DELAY', 'CAST', 'CHR', 'CONVERT', 'DECODE', 'BASE64',
];

const AGGRESSIVE_KEYWORDS = [
  'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE',
];

/**
 * 检查输入是否包含潜在 SQL 注入
 * @param {string} input - 输入字符串
 * @returns {Object} { isValid: boolean, sanitized: string, reason: string }
 */
function detectSQLInjection(input) {
  if (typeof input !== 'string') {
    return { isValid: true, sanitized: input, reason: null };
  }

  // 检查危险模式
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        sanitized: null,
        reason: '输入包含可疑字符模式',
      };
    }
  }

  // 检查 SQL 关键字（区分大小写）
  const upperInput = input.toUpperCase();
  for (const keyword of SQL_KEYWORDS) {
    if (upperInput.includes(keyword)) {
      return {
        isValid: false,
        sanitized: null,
        reason: `输入包含 SQL 关键字: ${keyword}`,
      };
    }
  }

  return { isValid: true, sanitized: input, reason: null };
}

/**
 * 清理输入（移除危险字符）
 * @param {string} input - 输入字符串
 * @returns {string} 清理后的字符串
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // 替换单引号为双单引号（SQL 转义）
  let sanitized = input.replace(/'/g, "''");

  // 移除分号
  sanitized = sanitized.replace(/;/g, '');

  // 移除注释符号
  sanitized = sanitized.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*/g, '');
  sanitized = sanitized.replace(/\*\//g, '');

  // 移除多余的空格
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * 验证标识符（表名、列名）
 * @param {string} identifier - 标识符
 * @returns {Object} { isValid: boolean, reason: string }
 */
function validateIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    return { isValid: false, reason: '标识符不能为空' };
  }

  // 只能包含字母、数字、下划线
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    return { isValid: false, reason: '标识符格式不正确' };
  }

  // 检查是否以 pg_ 开头（PostgreSQL 系统表）
  if (identifier.startsWith('pg_')) {
    return { isValid: false, reason: '不能访问系统表' };
  }

  // 检查危险关键字
  const upper = identifier.toUpperCase();
  if (AGGRESSIVE_KEYWORDS.includes(upper)) {
    return { isValid: false, reason: '标识符不能包含危险关键字' };
  }

  return { isValid: true, reason: null };
}

/**
 * 构建安全的排序/过滤参数
 * @param {Object} options - 选项
 * @param {string} options.sortBy - 排序字段
 * @param {string} options.order - 排序方向
 * @param {Array} allowedFields - 允许的字段列表
 * @returns {Object|null} 安全参数或 null（如果无效）
 */
function buildSafeQueryParams({ sortBy, order }, allowedFields = []) {
  // 验证排序字段
  if (sortBy && allowedFields.length > 0) {
    if (!allowedFields.includes(sortBy)) {
      return null;
    }
  }

  // 验证排序方向
  const validOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  return {
    sortBy: sortBy || 'created_at',
    order: validOrder,
  };
}

/**
 * Express 中间件：检查请求体 SQL 注入
 */
function sqlInjectionCheck(options = {}) {
  const { fields = [], strict = false } = options;

  return (req, res, next) => {
    const checkObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        // 如果指定了检查字段，只检查这些字段
        if (fields.length > 0 && !fields.includes(key)) {
          continue;
        }

        if (typeof value === 'string') {
          const result = detectSQLInjection(value);
          if (!result.isValid) {
            console.warn(`SQL Injection attempt detected at ${path}${key}:`, value);
            if (strict) {
              return res.status(400).json({
                error: 'Bad Request',
                message: '输入包含非法字符',
                code: 'INVALID_INPUT',
                field: `${path}${key}`,
              });
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          checkObject(value, `${path}${key}.`);
        }
      }
    };

    if (req.body) {
      checkObject(req.body);
    }

    next();
  };
}

module.exports = {
  detectSQLInjection,
  sanitizeInput,
  validateIdentifier,
  buildSafeQueryParams,
  sqlInjectionCheck,
  DANGEROUS_PATTERNS,
  SQL_KEYWORDS,
};