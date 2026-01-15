import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { checkRole as authorize } from '../middleware/role';
import { success } from '../utils/response';
import OrgChartService from '../services/orgChartService';
import EmployeeService from '../services/employeeService';

const router = express.Router();

// 所有 org 路由都需要 HR 或 Manager 角色
router.use(authMiddleware);

/**
 * GET /api/org/chart
 * 获取完整的组织架构图
 */
router.get('/chart', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
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
router.get('/chart/:departmentId', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
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
      (subtree as any).allEmployees = employees;
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
router.get('/reporting-chain/:employeeId', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;

    // 验证权限：只能查看自己团队的汇报链，或者 HR 可以查看所有人
    const isHR = (req.user as any).role === 'hr';
    const isManager = (req.user as any).role === 'manager';

    if (!isHR) {
      // 获取请求的员工信息
      const targetEmployee = await EmployeeService.getEmployeeById(employeeId);
      if (!targetEmployee) {
        return res.status(404).json({
          error: 'Not Found',
          message: '员工不存在',
        });
      }

      // 验证是否为同一团队
      if (targetEmployee.manager_id !== (req.user as any).id) {
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
 * GET /api/org/search
 * 搜索员工
 */
router.get('/search', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q: searchTerm, departmentId, role, status } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请提供搜索关键词',
      });
    }

    const employees = await OrgChartService.searchEmployees(searchTerm as string, {
      departmentId,
      role,
      status: status || 'active',
    });

    success(res, employees, '搜索成功');
  } catch (error) {
    next(error);
  }
});

export default router;
