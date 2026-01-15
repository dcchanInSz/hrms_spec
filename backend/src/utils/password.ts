import bcrypt from 'bcrypt';

/**
 * 密码哈希
 * @param password - 原始密码
 * @returns 哈希后的密码
 */
async function hashPassword(password: string): Promise<string> {
  const rounds: number = parseInt((process.env as any).BCRYPT_ROUNDS || '10', 10);
  return await bcrypt.hash(password, rounds);
}

/**
 * 验证密码
 * @param password - 原始密码
 * @param hash - 哈希后的密码
 * @returns 是否匹配
 */
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 验证结果
 */
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码长度至少 8 个字符');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};
