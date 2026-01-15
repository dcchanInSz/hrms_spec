/**
 * SQL 注入防护工具函数
 */

/**
 * 转义单引号
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeSingleQuotes(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * 转义双引号
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeDoubleQuotes(str: string): string {
  return str.replace(/"/g, '""');
}

/**
 * 转义反斜杠
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeBackslash(str: string): string {
  return str.replace(/\\/g, '\\\\');
}

/**
 * 转义特殊字符
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeSpecialChars(str: string): string {
  return escapeBackslash(escapeSingleQuotes(str));
}

/**
 * 验证 SQL 关键字
 * @param str - 要验证的字符串
 * @returns 是否包含 SQL 关键字
 */
function containsSQLKeywords(str: string): boolean {
  const sqlKeywords: string[] = [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'CREATE',
    'ALTER',
    'EXEC',
    'EXECUTE',
    'UNION',
    'JOIN',
    'WHERE',
    'FROM',
    'TABLE',
    'DATABASE',
  ];

  const upperStr: string = str.toUpperCase();
  return sqlKeywords.some((keyword) => upperStr.includes(keyword));
}

/**
 * 清理输入字符串
 * @param str - 要清理的字符串
 * @param options - 清理选项
 * @returns 清理后的字符串
 */
function sanitizeInput(
  str: string,
  options: { allowSpecialChars?: boolean } = {}
): { sanitized: string; isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof str !== 'string') {
    errors.push('输入必须是字符串');
    return { sanitized: '', isValid: false, errors };
  }

  // 检查是否包含 SQL 关键字
  if (containsSQLKeywords(str)) {
    errors.push('输入包含禁止的 SQL 关键字');
  }

  // 清理特殊字符
  let sanitized: string = str;
  if (!options.allowSpecialChars) {
    sanitized = escapeSpecialChars(sanitized);
  }

  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
  };
}

export {
  escapeSingleQuotes,
  escapeDoubleQuotes,
  escapeBackslash,
  escapeSpecialChars,
  containsSQLKeywords,
  sanitizeInput,
};

export default {
  escapeSingleQuotes,
  escapeDoubleQuotes,
  escapeBackslash,
  escapeSpecialChars,
  containsSQLKeywords,
  sanitizeInput,
};
