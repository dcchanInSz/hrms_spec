const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { success, paginated } = require('../utils/response');
const OrgChartService = require('../services/orgChartService');
const DepartmentService = require('../services/departmentService');
const EmployeeModel = require('../models/Employee');

// 所有 org 路由都需要 HR 或 Manager 角色
router.use(authMiddleware);

/**
 * GET /api/org/chart
 * 获取完整的组织架构图
 */
router.get('/chart', async (req, res, next) => {
  try {
    const { includeEmployees, activeOnly } = req.query;

    const orgChart = await OrgChartService.getOrgChart({
      includeEmployees: includeEmployees !== 'false',
      activeOnly: activeOnly !== 'false',
    });

    success(res, orgChart, '组织架构获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/chart/:departmentId
 * 获取特定部门的子树
 */
router.get('/chart/:departmentId', async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { includeEmployees } = req.query;

    const subtree = await OrgChartService.getDepartmentSubtree(departmentId);

    if (!subtree) {
      return res.status(404).json({
        error: 'Not Found',
        message: '部门不存在',
      });
    }

    // 如果需要，添加员工信息
    if (includeEmployees !== 'false') {
      const employees = await OrgChartService.getAllEmployeesInDepartment(departmentId);
      subtree.allEmployees = employees;
    }

    success(res, subtree, '部门子树获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/reporting-chain/:employeeId
 * 获取员工的汇报链
 */
router.get('/reporting-chain/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    // 验证权限：只能查看自己团队的汇报链，或者 HR 可以查看所有人
    const isHR = req.user.role === 'hr';
    const isManager = req.user.role === 'manager';

    if (!isHR) {
      // 获取请求的员工信息
      const targetEmployee = await EmployeeModel.findById(employeeId);
      if (!targetEmployee) {
        return res.status(404).json({
          error: 'Not Found',
          message: '员工不存在',
        });
      }

      // 经理只能查看自己团队成员的汇报链
      if (isManager) {
        const teamMembers = await EmployeeModel.findByManagerId(req.user.id);
        const isTeamMember = teamMembers.some((m) => m.id === employeeId);
        const isSelf = req.user.id === employeeId;

        if (!isTeamMember && !isSelf) {
          return res.status(403).json({
            error: 'Forbidden',
            message: '无权查看该员工的汇报链',
          });
        }
      } else if (req.user.id !== employeeId) {
        // 普通员工只能查看自己的
        return res.status(403).json({
          error: 'Forbidden',
          message: '无权查看该员工的汇报链',
        });
      }
    }

    const reportingChain = await OrgChartService.getReportingChain(employeeId);
    success(res, reportingChain, '汇报链获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/org/reassign-manager
 * 重新分配部门经理（会更新审批链）
 */
router.put('/reassign-manager', requireRole('hr'), async (req, res, next) => {
  try {
    const { departmentId, newManagerId } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '缺少部门ID',
      });
    }

    // 验证部门存在
    const department = await DepartmentService.getDepartmentById(departmentId);
    if (!department) {
      return res.status(404).json({
        error: 'Not Found',
        message: '部门不存在',
      });
    }

    // 如果指定了新经理，验证经理存在
    if (newManagerId) {
      const manager = await EmployeeModel.findById(newManagerId);
      if (!manager) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '指定的经理不存在',
        });
      }

      // 验证新经理属于该部门
      if (manager.department_id !== departmentId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '新经理必须属于该部门',
        });
      }
    }

    const result = await DepartmentService.updateApprovalChain(
      departmentId,
      newManagerId || null,
      req.user.id
    );

    if (result.updated) {
      success(res, {
        department: result.department,
        affectedEmployees: result.affectedEmployees,
      }, '经理分配成功，审批链已更新');
    } else {
      success(res, result, result.message);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/org/move-department
 * 移动部门到新的父部门
 */
router.put('/move-department', requireRole('hr'), async (req, res, next) => {
  try {
    const { departmentId, newParentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '缺少部门ID',
      });
    }

    const result = await DepartmentService.moveDepartment(
      departmentId,
      newParentId || null,
      req.user.id
    );

    success(res, result, '部门移动成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/employees/:departmentId
 * 获取部门及其所有子部门的员工列表
 */
router.get('/employees/:departmentId', async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { page, limit, status } = req.query;

    // 验证部门存在
    const department = await DepartmentService.getDepartmentById(departmentId);
    if (!department) {
      return res.status(404).json({
        error: 'Not Found',
        message: '部门不存在',
      });
    }

    const employees = await OrgChartService.getAllEmployeesInDepartment(
      departmentId,
      status !== 'all'
    );

    // 分页
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    paginated(res, employees.slice(startIndex, endIndex), {
      total: employees.length,
      page: pageNum,
      limit: pageSize,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/statistics
 * 获取组织架构统计信息
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const orgChart = await OrgChartService.getOrgChart({
      includeEmployees: true,
      activeOnly: true,
    });

    success(res, orgChart.statistics, '统计信息获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/search
 * 搜索员工
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, departmentId, role, status, page, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '搜索关键词不能为空',
      });
    }

    const employees = await OrgChartService.searchEmployees(q, {
      departmentId,
      role,
      status: status || 'active',
    });

    // 分页
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 20;
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    paginated(res, employees.slice(startIndex, endIndex), {
      total: employees.length,
      page: pageNum,
      limit: pageSize,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/changes
 * 获取组织架构变更历史
 */
router.get('/changes', requireRole('hr'), async (req, res, next) => {
  try {
    const { limit, departmentId } = req.query;

    const changes = await OrgChartService.getOrgStructureChanges({
      limit: parseInt(limit) || 50,
      departmentId,
    });

    success(res, changes, '变更历史获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/org/export
 * 导出组织架构
 */
router.get('/export', requireRole('hr'), async (req, res, next) => {
  try {
    const { format, includeEmployees } = req.query;

    const data = await OrgChartService.exportOrgChart(format || 'json', {
      includeEmployees: includeEmployees !== 'false',
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=org-chart.csv');
      return res.send(data);
    }

    success(res, data, '组织架构导出成功');
  } catch (error) {
    next(error);
  }
});

module.exports = router;