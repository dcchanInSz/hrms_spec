const express = require('express');
const router = express.Router();
const { generateToken } = require('../utils/jwt');
const { verifyPassword, validatePassword } = require('../utils/password');
const { authMiddleware } = require('../middleware/auth');
const { success, created } = require('../utils/response');
const EmployeeService = require('../services/employeeService');

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '邮箱和密码不能为空',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // 查找用户
    const EmployeeModel = require('../models/Employee');
    const employee = await EmployeeModel.findByEmail(email);

    if (!employee) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 验证密码
    const isValid = await verifyPassword(password, employee.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 检查账户状态
    if (employee.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '账户已被禁用',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // 生成 token
    const token = generateToken({
      id: employee.id,
      employee_no: employee.employee_no,
      email: employee.email,
      role: employee.role,
      department_id: employee.department_id,
    });

    // 返回用户信息 (不含密码)
    const userData = {
      id: employee.id,
      employee_no: employee.employee_no,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department_id: employee.department_id,
    };

    success(res, { token, user: userData }, '登录成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * 用户登出 (客户端清除 token 即可，此端点仅用于记录)
 */
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    // JWT 无状态，登出只需客户端删除 token
    // 此端点可用于记录登出日志
    success(res, null, '登出成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/profile
 * 获取当前用户信息
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const profile = await EmployeeService.getProfile(req.user.id);
    success(res, profile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * 更新当前用户个人资料
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { phone, emergency_contact, emergency_phone } = req.body;

    const updated = await EmployeeService.updateProfile(req.user.id, {
      phone,
      emergency_contact,
      emergency_phone,
    });

    success(res, updated, '个人资料更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/password
 * 修改密码
 */
router.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '当前密码和新密码不能为空',
        code: 'MISSING_PASSWORD',
      });
    }

    // 验证新密码强度
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.message,
        code: 'WEAK_PASSWORD',
      });
    }

    const EmployeeModel = require('../models/Employee');
    const employee = await EmployeeModel.findById(req.user.id);
    const { verifyPassword } = require('../utils/password');

    const isValid = await verifyPassword(currentPassword, employee.password_hash);
    if (!isValid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '当前密码错误',
        code: 'WRONG_PASSWORD',
      });
    }

    const { hashPassword } = require('../utils/password');
    const newHash = await hashPassword(newPassword);

    await EmployeeModel.update(req.user.id, { password_hash: newHash });

    success(res, null, '密码修改成功');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
