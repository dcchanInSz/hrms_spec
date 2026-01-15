const { query } = require('../models/db');
const DepartmentModel = require('../models/Department');
const EmployeeModel = require('../models/Employee');

/**
 * OrgChartService
 * 处理组织架构相关的业务逻辑，提供完整的组织结构视图
 */
class OrgChartService {
  /**
   * 获取完整的组织架构图
   * 包含所有部门的层级关系和员工信息
   * @param {object} options - 查询选项
   * @param {boolean} options.includeEmployees - 是否包含员工信息
   * @param {boolean} options.activeOnly - 是否只包含活跃部门/员工
   * @returns {Promise<object>} 组织架构图
   */
  static async getOrgChart(options = {}) {
    const { includeEmployees = true, activeOnly = true } = options;

    // 获取所有部门
    const departments = await DepartmentModel.findAll({
      is_active: activeOnly ? true : undefined,
    });

    // 构建部门树
    const deptTree = OrgChartService.buildDepartmentTree(departments);

    // 如果不需要员工信息，直接返回
    if (!includeEmployees) {
      return {
        departments: deptTree,
        statistics: OrgChartService.calculateStatistics(departments, []),
      };
    }

    // 获取所有员工
    const employees = activeOnly
      ? await EmployeeModel.findByStatus('active')
      : await EmployeeModel.findAll();

    // 将员工分配到部门
    const orgChart = OrgChartService.decorateDepartmentsWithEmployees(deptTree, employees);

    // 计算统计信息
    const statistics = OrgChartService.calculateStatistics(departments, employees);

    return {
      departments: orgChart,
      statistics,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 构建部门树
   * @param {object[]} departments - 部门列表
   * @returns {object[]} 树形结构的部门
   */
  static buildDepartmentTree(departments) {
    const deptMap = new Map();
    const roots = [];

    // 初始化所有部门
    departments.forEach((dept) => {
      deptMap.set(dept.id, { ...dept, children: [] });
    });

    // 构建父子关系
    departments.forEach((dept) => {
      const node = deptMap.get(dept.id);
      if (dept.parent_id && deptMap.has(dept.parent_id)) {
        const parent = deptMap.get(dept.parent_id);
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // 按名称排序
    const sortNodes = (nodes) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  }

  /**
   * 为部门添加员工信息
   * @param {object[]} deptTree - 部门树
   * @param {object[]} employees - 员工列表
   * @returns {object[]} 装饰后的部门树
   */
  static decorateDepartmentsWithEmployees(deptTree, employees) {
    const employeesByDept = new Map();

    // 按部门分组员工
    employees.forEach((emp) => {
      if (!employeesByDept.has(emp.department_id)) {
        employeesByDept.set(emp.department_id, []);
      }
      employeesByDept.get(emp.department_id).push({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        position: emp.position_title,
        role: emp.role,
        avatarUrl: emp.avatar_url,
        isManager: emp.id === null, // 标记是否是部门经理
      });
    });

    // 递归添加员工到部门
    const addEmployeesToDept = (depts) => {
      depts.forEach((dept) => {
        const employees = employeesByDept.get(dept.id) || [];
        dept.employees = employees;

        // 标记部门经理
        if (dept.manager_id) {
          dept.manager = employees.find((e) => e.id === dept.manager_id);
        }

        if (dept.children && dept.children.length > 0) {
          addEmployeesToDept(dept.children);
        }
      });
    };

    addEmployeesToDept(deptTree);
    return deptTree;
  }

  /**
   * 计算组织架构统计信息
   * @param {object[]} departments - 部门列表
   * @param {object[]} employees - 员工列表
   * @returns {object} 统计信息
   */
  static calculateStatistics(departments, employees) {
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const managers = activeEmployees.filter((e) => e.role === 'manager');
    const hrStaff = activeEmployees.filter((e) => e.role === 'hr');

    // 按部门统计员工数
    const deptEmployeeCount = new Map();
    activeEmployees.forEach((emp) => {
      if (emp.department_id) {
        deptEmployeeCount.set(
          emp.department_id,
          (deptEmployeeCount.get(emp.department_id) || 0) + 1
        );
      }
    });

    // 计算层级深度
    const maxDepth = OrgChartService.calculateMaxDepth(departments);

    return {
      totalDepartments: departments.length,
      activeDepartments: departments.filter((d) => d.is_active).length,
      totalEmployees: activeEmployees.length,
      managers: managers.length,
      hrStaff: hrStaff.length,
      maxDepth,
      deptEmployeeCount: Object.fromEntries(deptEmployeeCount),
    };
  }

  /**
   * 计算组织架构的最大深度
   * @param {object[]} departments - 部门列表
   * @returns {number} 最大深度
   */
  static calculateMaxDepth(departments) {
    const parentMap = new Map();
    departments.forEach((dept) => {
      parentMap.set(dept.id, dept.parent_id);
    });

    const calculateDepth = (deptId, visited = new Set()) => {
      if (visited.has(deptId)) return 0;
      visited.add(deptId);

      const parentId = parentMap.get(deptId);
      if (!parentId) return 1;
      return 1 + calculateDepth(parentId, visited);
    };

    let maxDepth = 0;
    departments.forEach((dept) => {
      const depth = calculateDepth(dept.id);
      maxDepth = Math.max(maxDepth, depth);
    });

    return maxDepth;
  }

  /**
   * 获取特定部门的完整子树（包括所有后代）
   * @param {string} departmentId - 部门ID
   * @returns {Promise<object>} 包含子树的部门节点
   */
  static async getDepartmentSubtree(departmentId) {
    const department = await DepartmentModel.findById(departmentId);
    if (!department) {
      return null;
    }

    const allDepartments = await DepartmentModel.findAll({});
    const deptTree = OrgChartService.buildDepartmentTree(allDepartments);

    // 找到目标部门节点
    const findNode = (depts, id) => {
      for (const dept of depts) {
        if (dept.id === id) return dept;
        if (dept.children && dept.children.length > 0) {
          const found = findNode(dept.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findNode(deptTree, departmentId);
  }

  /**
   * 获取汇报链（从员工到最高管理层）
   * @param {string} employeeId - 员工ID
   * @returns {Promise<object[]>} 汇报链（从下到上）
   */
  static async getReportingChain(employeeId) {
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      return [];
    }

    const reportingChain = [];
    let currentEmployee = employee;

    while (currentEmployee.manager_id) {
      const manager = await EmployeeModel.findById(currentEmployee.manager_id);
      if (!manager) break;

      reportingChain.push({
        employeeId: manager.id,
        name: manager.name,
        email: manager.email,
        position: manager.position_title,
        department: manager.department_name,
        role: manager.role,
      });

      currentEmployee = manager;
    }

    return reportingChain;
  }

  /**
   * 获取部门下的所有员工（递归，包含所有子部门）
   * @param {string} departmentId - 部门ID
   * @param {boolean} activeOnly - 是否只包含活跃员工
   * @returns {Promise<object[]>} 员工列表
   */
  static async getAllEmployeesInDepartment(departmentId, activeOnly = true) {
    const { query } = require('../models/db');

    // 获取所有子部门ID
    const descendants = await OrgChartService.getAllChildDepartmentIds(departmentId);
    const allDeptIds = [departmentId, ...descendants];

    const statusFilter = activeOnly ? "AND e.status = 'active'" : '';

    const result = await query(
      `SELECT e.*, d.name as department_name, p.title as position_title
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.department_id = ANY($1::uuid[])
       ${statusFilter}
       ORDER BY d.name, e.name`,
      [allDeptIds]
    );

    return result.rows;
  }

  /**
   * 获取部门的所有子部门ID（递归）
   * @param {string} departmentId - 部门ID
   * @returns {Promise<string[]>} 子部门ID列表
   */
  static async getAllChildDepartmentIds(departmentId) {
    const result = await query(
      `WITH RECURSIVE dept_tree AS (
        SELECT id FROM departments WHERE parent_id = $1
        UNION ALL
        SELECT d.id FROM departments d
        INNER JOIN dept_tree dt ON d.parent_id = dt.id
      )
      SELECT id FROM dept_tree`,
      [departmentId]
    );

    return result.rows.map((r) => r.id);
  }

  /**
   * 搜索组织架构中的员工
   * @param {string} searchTerm - 搜索关键词
   * @param {object} options - 搜索选项
   * @returns {Promise<object[]>} 匹配的员工列表
   */
  static async searchEmployees(searchTerm, options = {}) {
    const { departmentId, role, status = 'active' } = options;

    const employees = await EmployeeModel.findAll({ status });

    return employees
      .filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (emp.employee_no &&
            emp.employee_no.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter((emp) => !departmentId || emp.department_id === departmentId)
      .filter((emp) => !role || emp.role === role);
  }

  /**
   * 获取组织架构变更历史
   * @param {object} options - 查询选项
   * @param {number} options.limit - 返回数量限制
   * @param {string} options.departmentId - 特定部门ID
   * @returns {Promise<object[]>} 变更历史
   */
  static async getOrgStructureChanges(options = {}) {
    const { limit = 50, departmentId } = options;
    const AuditLogModel = require('../models/AuditLog');

    const entityTypes = ['department', 'employee'];
    const actions = ['create', 'update', 'delete', 'move_department', 'reassign_manager'];

    const result = await AuditLogModel.findByFilters({
      entity_type: entityTypes,
      action: actions,
      limit,
    });

    // 如果指定了部门ID，过滤相关记录
    let filtered = result;
    if (departmentId) {
      filtered = result.filter(
        (log) =>
          log.entity_type === 'department' && log.entity_id === departmentId
      );
    }

    return filtered;
  }

  /**
   * 导出组织架构数据
   * @param {string} format - 导出格式 (json/csv)
   * @param {object} options - 导出选项
   * @returns {Promise<object>} 导出数据
   */
  static async exportOrgChart(format = 'json', options = {}) {
    const orgChart = await OrgChartService.getOrgChart(options);

    if (format === 'csv') {
      return OrgChartService.convertToCsv(orgChart);
    }

    return orgChart;
  }

  /**
   * 将组织架构转换为CSV格式
   * @param {object} orgChart - 组织架构数据
   * @returns {string} CSV字符串
   */
  static convertToCsv(orgChart) {
    const rows = [];

    // 添加表头
    rows.push(['部门名称', '上级部门', '部门经理', '员工数量', '层级']);

    // 递归添加所有部门
    const addDeptsToCsv = (depts, level = 0) => {
      depts.forEach((dept) => {
        const indent = '  '.repeat(level);
        rows.push([
          `${indent}${dept.name}`,
          dept.parent_name || '-',
          dept.manager_name || '-',
          dept.employees ? dept.employees.length : 0,
          level + 1,
        ]);

        if (dept.children && dept.children.length > 0) {
          addDeptsToCsv(dept.children, level + 1);
        }
      });
    };

    addDeptsToCsv(orgChart.departments);

    return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }
}

module.exports = OrgChartService;