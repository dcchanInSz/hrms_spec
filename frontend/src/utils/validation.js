/**
 * 表单验证工具函数
 * 提供统一的验证规则和错误提示
 */

/**
 * 验证规则
 */
const rules = {
  required: (value, message = '此字段为必填项') => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    if (Array.isArray(value) && value.length === 0) {
      return message;
    }
    return null;
  },

  email: (value, message = '请输入有效的邮箱地址') => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  phone: (value, message = '请输入有效的手机号码') => {
    if (!value) return null;
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (!value) return null;
    if (typeof value === 'string' && value.length < min) {
      return message || `最少需要 ${min} 个字符`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null;
    if (typeof value === 'string' && value.length > max) {
      return message || `最多只能输入 ${max} 个字符`;
    }
    return null;
  },

  min: (min, message) => (value) => {
    if (value === undefined || value === null || value === '') return null;
    if (Number(value) < min) {
      return message || `最小值为 ${min}`;
    }
    return null;
  },

  max: (max, message) => (value) => {
    if (value === undefined || value === null || value === '') return null;
    if (Number(value) > max) {
      return message || `最大值为 ${max}`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    if (typeof regex === 'string') {
      regex = new RegExp(regex);
    }
    if (!regex.test(value)) {
      return message || '格式不正确';
    }
    return null;
  },

  date: (message = '请输入有效的日期') => (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  futureDate: (message = '日期必须是将来的时间') => (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return '请输入有效的日期';
    if (date <= new Date()) {
      return message;
    }
    return null;
  },

  afterDate: (afterField, message) => (value, formData) => {
    if (!value || !formData[afterField]) return null;
    const start = new Date(formData[afterField]);
    const end = new Date(value);
    if (end <= start) {
      return message || '结束日期必须晚于开始日期';
    }
    return null;
  },

  numeric: (message = '请输入数字') => (value) => {
    if (!value) return null;
    if (isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  integer: (message = '请输入整数') => (value) => {
    if (!value) return null;
    if (!Number.isInteger(Number(value))) {
      return message;
    }
    return null;
  },
};

/**
 * 验证单个字段
 * @param {*} value - 字段值
 * @param {Array} fieldRules - 验证规则数组
 * @param {Object} formData - 表单数据（用于跨字段验证）
 * @returns {string|null} 错误信息或 null
 */
function validateField(value, fieldRules, formData = {}) {
  for (const rule of fieldRules) {
    let error;
    if (typeof rule === 'string') {
      error = rules.required(value);
    } else if (Array.isArray(rule)) {
      const [ruleName, ...args] = rule;
      const ruleFn = rules[ruleName];
      if (ruleFn) {
        error = ruleFn(...args)(value, formData);
      }
    } else if (typeof rule === 'function') {
      error = rule(value, formData);
    }
    if (error) return error;
  }
  return null;
}

/**
 * 验证整个表单
 * @param {Object} formData - 表单数据
 * @param {Object} schema - 验证模式 { fieldName: [rules] }
 * @returns {Object} { isValid, errors: { field: error } }
 */
function validateForm(formData, schema) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(schema)) {
    const error = validateField(formData[field], fieldRules, formData);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 常用验证模式
 */
const validationPatterns = {
  employeeNo: {
    required: ['required'],
    pattern: [/^[A-Z0-9]{3,20}$/, '员工编号只能是字母和数字，长度 3-20 位'],
  },
  name: {
    required: ['required'],
    minLength: [2, '姓名至少 2 个字符'],
    maxLength: [50, '姓名最多 50 个字符'],
  },
  email: {
    required: ['required'],
    email: true,
  },
  phone: {
    phone: true,
  },
  dateRange: {
    required: ['required'],
    afterDate: ['start_date', '结束日期必须晚于开始日期'],
  },
  leaveDays: {
    required: ['required'],
    numeric: true,
    min: [0.5, '请假天数不能少于 0.5 天'],
    max: [30, '单次请假不能超过 30 天'],
  },
  password: {
    required: ['required'],
    minLength: [6, '密码至少 6 个字符'],
    maxLength: [50, '密码最多 50 个字符'],
  },
  salary: {
    numeric: true,
    min: [0, '薪资不能为负数'],
  },
};

module.exports = {
  rules,
  validateField,
  validateForm,
  validationPatterns,
};