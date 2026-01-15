const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { success, paginated, created } = require('../utils/response');
const EmployeeService = require('../services/employeeService');
const DepartmentService = require('../services/departmentService');
const PositionService = require('../services/positionService');
const PayStubService = require('../services/payStubService');
const AuditLogService = require('../services/auditLogService');
const NotificationService = require('../services/notificationService');
const { hashPassword } = require('../utils/password');
const EmployeeModel = require('../models/Employee');

// 所有 admin 路由都需要 HR 角色
router.use(authMiddleware);
router.use(requireRole('hr'));

/**
 * GET /api/admin/employees
 * 获取所有员工列表
 */
router.get('/employees', async (req, res, next) => {
  try {
    const { page, limit, department_id, status, role, search } = req.query;
    const result = await EmployeeService.getAllEmployees({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      department_id,
      status,
      role,
      search,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/employees
 * 创建新员工
 */
router.post('/employees', async (req, res, next) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    created(res, employee, '员工创建成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/employees/:id
 * 获取员工详情
 */
router.get('/employees/:id', async (req, res, next) => {
  try {
    const employee = await EmployeeService.getEmployeePublic(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Not Found', message: '员工不存在' });
    }
    success(res, employee);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/employees/:id
 * 更新员工信息
 */
router.put('/employees/:id', async (req, res, next) => {
  try {
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    success(res, employee, '员工信息更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/employees/:id
 * 删除员工 (软删除)
 */
router.delete('/employees/:id', async (req, res, next) => {
  try {
    await EmployeeService.deleteEmployee(req.params.id);
    success(res, null, '员工已删除');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/departments
 * 获取所有部门
 */
router.get('/departments', async (req, res, next) => {
  try {
    const departments = await DepartmentService.getAllDepartments();
    success(res, departments);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/departments
 * 创建部门
 */
router.post('/departments', async (req, res, next) => {
  try {
    const department = await DepartmentService.createDepartment(req.body);
    created(res, department, '部门创建成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/departments/:id
 * 更新部门
 */
router.put('/departments/:id', async (req, res, next) => {
  try {
    const department = await DepartmentService.updateDepartment(req.params.id, req.body);
    success(res, department, '部门更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/departments/:id
 * 删除部门
 */
router.delete('/departments/:id', async (req, res, next) => {
  try {
    await DepartmentService.deleteDepartment(req.params.id);
    success(res, null, '部门已删除');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/positions
 * 获取所有职位
 */
router.get('/positions', async (req, res, next) => {
  try {
    const { department_id } = req.query;
    const positions = await PositionService.getAllPositions({ department_id });
    success(res, positions);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/positions
 * 创建职位
 */
router.post('/positions', async (req, res, next) => {
  try {
    const position = await PositionService.createPosition(req.body);
    created(res, position, '职位创建成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/positions/:id
 * 更新职位
 */
router.put('/positions/:id', async (req, res, next) => {
  try {
    const position = await PositionService.updatePosition(req.params.id, req.body);
    success(res, position, '职位更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/positions/:id
 * 删除职位
 */
router.delete('/positions/:id', async (req, res, next) => {
  try {
    await PositionService.deletePosition(req.params.id);
    success(res, null, '职位已删除');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/paystubs
 * 获取所有工资单 (HR)
 */
router.get('/paystubs', async (req, res, next) => {
  try {
    const { page, limit, employee_id, year } = req.query;
    const result = await PayStubService.getAllPayStubs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      employee_id,
      year,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/paystubs
 * 创建工资单
 */
router.post('/paystubs', async (req, res, next) => {
  try {
    const paystub = await PayStubService.createPayStub(req.body, req.user.id);
    created(res, paystub, '工资单创建成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/paystubs/:id
 * 删除工资单
 */
router.delete('/paystubs/:id', async (req, res, next) => {
  try {
    await PayStubService.deletePayStub(req.params.id);
    success(res, null, '工资单已删除');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/audit-logs
 * 获取审计日志
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { page, limit, user_id, action, entity_type, start_date, end_date } = req.query;
    const result = await AuditLogService.getAuditLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      user_id,
      action,
      entity_type,
      start_date,
      end_date,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/employees/:id/onboarding
 * 员工入职
 */
router.post('/employees/:id/onboarding', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, department_id, position_id, manager_id, hire_date, role } = req.body;

    // 验证员工存在
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Not Found', message: '员工不存在' });
    }

    // 如果员工已激活，检查是否是重复入职
    if (employee.status === 'active') {
      return res.status(400).json({ error: 'Bad Request', message: '该员工已经在职' });
    }

    // 更新员工信息
    const updateData = {};
    if (department_id) updateData.department_id = department_id;
    if (position_id) updateData.position_id = position_id;
    if (manager_id) updateData.manager_id = manager_id;
    if (hire_date) updateData.hire_date = hire_date;
    if (role) updateData.role = role;

    // 设置密码
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    // 激活员工
    updateData.status = 'active';
    updateData.termination_date = null;

    const updatedEmployee = await EmployeeModel.update(id, updateData);

    // 创建入职通知
    await NotificationService.create({
      user_id: id,
      type: 'system',
      title: '欢迎入职',
      message: '恭喜您已完成入职流程，欢迎加入我们的团队！',
      link: '/profile',
    });

    // 记录审计日志
    await AuditLogService.createLog({
      user_id: req.user.id,
      action: 'onboarding',
      entity_type: 'employee',
      entity_id: id,
      old_value: { status: 'inactive' },
      new_value: { status: 'active', ...updateData },
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });

    success(res, updatedEmployee, '入职办理成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/employees/:id/offboarding
 * 员工离职
 */
router.post('/employees/:id/offboarding', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { termination_date, reason } = req.body;

    // 验证员工存在
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Not Found', message: '员工不存在' });
    }

    // 检查员工是否已经是离职状态
    if (employee.status === 'inactive' && employee.termination_date) {
      return res.status(400).json({ error: 'Bad Request', message: '该员工已经离职' });
    }

    // 检查是否有待处理的请假申请
    const { query } = require('../models/db');
    const pendingLeaves = await query(
      `SELECT id FROM leave_requests
       WHERE employee_id = $1 AND status = 'pending'
       LIMIT 1`,
      [id]
    );

    if (pendingLeaves.rows.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '该员工有待处理的请假申请，请先处理后再办理离职',
      });
    }

    // 更新员工状态
    const termination = termination_date || new Date().toISOString().split('T')[0];
    const updatedEmployee = await EmployeeModel.update(id, {
      status: 'inactive',
      termination_date: termination,
      manager_id: null, // 移除经理关系
    });

    // 发送离职通知
    await NotificationService.create({
      user_id: id,
      type: 'system',
      title: '离职通知',
      message: `您已成功办理离职手续，最后工作日为 ${termination}。如有疑问请联系 HR。`,
      link: '/',
    });

    // 记录审计日志
    await AuditLogService.createLog({
      user_id: req.user.id,
      action: 'offboarding',
      entity_type: 'employee',
      entity_id: id,
      old_value: { status: employee.status, termination_date: employee.termination_date },
      new_value: { status: 'inactive', termination_date: termination, reason },
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });

    success(res, updatedEmployee, '离职办理成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/employees/:id/history
 * 获取员工变更历史
 */
router.get('/employees/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 验证员工存在
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Not Found', message: '员工不存在' });
    }

    const history = await AuditLogService.getEntityHistory('employee', id);
    success(res, history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
