import express, { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/jwt';
import verifyPassword from '../utils/password';
import { authenticate as authMiddleware } from '../middleware/auth';
import { success } from '../utils/response';
import EmployeeService from '../services/employeeService';

const router = express.Router();

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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
    const employee = await EmployeeService.getEmployeeByEmail(email);

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
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.getEmployeeById((req.user as any).id);
    success(res, employee, '获取成功');
  } catch (error) {
    next(error);
  }
});

export default router;
