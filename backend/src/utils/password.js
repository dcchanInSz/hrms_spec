const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * 哈希密码
 * @param {string} password - 原始密码
 * @returns {Promise<string>} 哈希后的密码
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @param {string} password - 原始密码
 * @param {string} hash - 哈希后的密码
 * @returns {Promise<boolean>} 是否匹配
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {Object} { valid: boolean, message: string }
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码需要包含大写字母' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码需要包含小写字母' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码需要包含数字' };
  }
  return { valid: true, message: '密码强度合格' };
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePassword,
};
