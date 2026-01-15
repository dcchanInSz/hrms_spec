const { query } = require('../models/db');
const EmployeeModel = require('../models/Employee');
const DepartmentModel = require('../models/Department');

/**
 * ReportService
 * 提供报表和数据分析的业务逻辑
 */
class ReportService {
  /**
   * 获取 HR 仪表盘数据
   * @param {Object} params - 查询参数
   * @param {number} params.year - 年度
   * @param {number} params.month - 月份 (可选)
   */
  static async getHRDashboard(params = {}) {
    const { year, month } = params;
    const currentYear = year || new Date().getFullYear();

    // 并行执行多个查询
    const [
      employeeStats,
      leaveStats,
      departmentStats,
      pendingApprovals,
      recentHires,
    ] = await Promise.all([
      this.getEmployeeStats(currentYear),
      this.getLeaveStats(currentYear, month),
      this.getDepartmentStats(),
      this.getPendingApprovalStats(),
      this.getRecentHires(30), // 最近 30 天入职
    ]);

    return {
      employee_stats: employeeStats,
      leave_stats: leaveStats,
      department_stats: departmentStats,
      pending_approvals: pendingApprovals,
      recent_hires: recentHires,
      period: {
        year: currentYear,
        month,
      },
    };
  }

  /**
   * 获取团队分析数据
   * @param {string} managerId - 经理 ID
   * @param {Object} params - 查询参数
   */
  static async getTeamAnalytics(managerId, params = {}) {
    const { start_date, end_date } = params;

    // 获取团队成员列表
    const teamMembers = await EmployeeModel.findByManager(managerId);

    // 并行执行团队分析查询
    const [leaveSummary, memberStats, upcomingLeaves] = await Promise.all([
      this.getTeamLeaveSummary(managerId, start_date, end_date),
      this.getTeamMemberStats(managerId),
      this.getUpcomingLeaves(managerId, 14), // 未来 14 天
    ]);

    return {
      team_size: teamMembers.length,
      members: teamMembers.map((m) => ({
        id: m.id,
        name: m.name,
        department: m.department_name,
        position: m.position_title,
        hire_date: m.hire_date,
      })),
      leave_summary: leaveSummary,
      member_stats: memberStats,
      upcoming_leaves: upcomingLeaves,
      period: {
        start_date,
        end_date,
      },
    };
  }

  /**
   * 获取人数统计
   * @param {Object} params - 查询参数
   */
  static async getHeadcount(params = {}) {
    const { department_id, status } = params;

    const where = [];
    const values = [];
    let paramIndex = 1;

    if (department_id) {
      where.push(`e.department_id = $${paramIndex++}`);
      values.push(department_id);
    }

    if (status) {
      where.push(`e.status = $${paramIndex++}`);
      values.push(status);
    }

    // 按状态统计
    const statusResult = await query(
      `SELECT e.status, COUNT(*) as count
       FROM employees e
       ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
       GROUP BY e.status`,
      values
    );

    // 按部门统计
    const deptResult = await query(
      `SELECT d.id, d.name as department_name, COUNT(e.id) as employee_count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
       WHERE d.is_active = true
       GROUP BY d.id, d.name
       ORDER BY employee_count DESC`,
      []
    );

    // 按职位统计
    const positionResult = await query(
      `SELECT p.id, p.title as position_title, COUNT(e.id) as count
       FROM positions p
       LEFT JOIN employees e ON p.id = e.position_id AND e.status = 'active'
       WHERE p.is_active = true
       GROUP BY p.id, p.title
       ORDER BY count DESC`,
      []
    );

    // 入职趋势 (按月)
    const hireTrend = await query(
      `SELECT
         EXTRACT(YEAR FROM hire_date) as year,
         EXTRACT(MONTH FROM hire_date) as month,
         COUNT(*) as count
       FROM employees
       WHERE status = 'active'
         AND hire_date >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY EXTRACT(YEAR FROM hire_date), EXTRACT(MONTH FROM hire_date)
       ORDER BY year, month`,
      []
    );

    return {
      by_status: statusResult.rows,
      by_department: deptResult.rows,
      by_position: positionResult.rows,
      hire_trend: hireTrend.rows,
      total_active: statusResult.rows.find((r) => r.status === 'active')?.count || 0,
      total_inactive: statusResult.rows.find((r) => r.status === 'inactive')?.count || 0,
    };
  }

  /**
   * 获取请假利用率
   * @param {Object} params - 查询参数
   */
  static async getLeaveUtilization(params = {}) {
    const { department_id, year, month } = params;
    const currentYear = year || new Date().getFullYear();

    // 按类型统计已批准请假
    const typeStats = await query(
      `SELECT
         lr.leave_type,
         COUNT(*) as request_count,
         SUM(lr.days) as total_days,
         COUNT(DISTINCT lr.employee_id) as employee_count
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE lr.status = 'approved'
         AND EXTRACT(YEAR FROM lr.start_date) = $1
         ${month ? 'AND EXTRACT(MONTH FROM lr.start_date) = $2' : ''}
         ${department_id ? `AND e.department_id = $${month ? 3 : 2}` : ''}
       GROUP BY lr.leave_type
       ORDER BY total_days DESC`,
      month
        ? department_id
          ? [currentYear, month, department_id]
          : [currentYear, month]
        : department_id
          ? [currentYear, department_id]
          : [currentYear]
    );

    // 按部门统计
    const deptStats = await query(
      `SELECT
         d.id,
         d.name as department_name,
         COUNT(lr.id) as request_count,
         COALESCE(SUM(lr.days), 0) as total_days
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
       LEFT JOIN leave_requests lr ON e.id = lr.employee_id
         AND lr.status = 'approved'
         AND EXTRACT(YEAR FROM lr.start_date) = $1
       WHERE d.is_active = true
       GROUP BY d.id, d.name
       ORDER BY total_days DESC`,
      [currentYear]
    );

    // 月度趋势
    const monthlyTrend = await query(
      `SELECT
         EXTRACT(MONTH FROM lr.start_date) as month,
         lr.leave_type,
         COUNT(*) as request_count,
         SUM(lr.days) as total_days
       FROM leave_requests lr
       WHERE lr.status = 'approved'
         AND EXTRACT(YEAR FROM lr.start_date) = $1
       GROUP BY EXTRACT(MONTH FROM lr.start_date), lr.leave_type
       ORDER BY month`,
      [currentYear]
    );

    // 计算各部门平均使用率
    const allDepts = await DepartmentModel.findAllActive();
    const deptUtilization = allDepts.map((dept) => {
      const deptData = deptStats.find((d) => d.id === dept.id);
      const employeeCount =
        parseInt(deptData?.employee_count) || 0;
      const totalDays = parseFloat(deptData?.total_days) || 0;
      const avgDaysPerEmployee =
        employeeCount > 0 ? (totalDays / employeeCount).toFixed(1) : 0;

      return {
        department_id: dept.id,
        department_name: dept.name,
        employee_count: employeeCount,
        total_leave_days: totalDays,
        avg_days_per_employee: parseFloat(avgDaysPerEmployee),
      };
    });

    return {
      year: currentYear,
      month,
      by_leave_type: typeStats.rows.map((r) => ({
        leave_type: r.leave_type,
        request_count: parseInt(r.request_count),
        total_days: parseFloat(r.total_days),
        employee_count: parseInt(r.employee_count),
      })),
      by_department: deptStats.map((r) => ({
        department_id: r.id,
        department_name: r.name,
        request_count: parseInt(r.request_count),
        total_days: parseFloat(r.total_days),
      })),
      monthly_trend: monthlyTrend.rows,
      department_utilization: deptUtilization,
    };
  }

  /**
   * 导出报表
   * @param {string} type - 报表类型
   * @param {Object} params - 查询参数
   */
  static async exportReport(type, params = {}) {
    switch (type) {
    case 'headcount':
      return this.exportHeadcountReport(params);
    case 'leave-utilization':
      return this.exportLeaveUtilizationReport(params);
    case 'employees':
      return this.exportEmployeeReport(params);
    default:
      throw new Error(`不支持的报表类型: ${type}`);
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 获取员工统计数据
   */
  static async getEmployeeStats(year) {
    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') as active_count,
         COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count,
         COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM hire_date) = $1) as hires_this_year,
         COUNT(*) FILTER (WHERE termination_date IS NOT NULL AND EXTRACT(YEAR FROM termination_date) = $1) as terminations_this_year
       FROM employees`,
      [year]
    );
    return result.rows[0];
  }

  /**
   * 获取请假统计数据
   */
  static async getLeaveStats(year, month) {
    const monthFilter = month
      ? `AND EXTRACT(MONTH FROM start_date) = ${month}`
      : '';

    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending') as pending,
         COUNT(*) FILTER (WHERE status = 'approved') as approved,
         COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
         COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
         SUM(days) FILTER (WHERE status = 'approved' AND EXTRACT(YEAR FROM start_date) = $1 ${monthFilter}) as total_days_taken
       FROM leave_requests
       WHERE EXTRACT(YEAR FROM start_date) = $1`,
      [year]
    );
    return result.rows[0];
  }

  /**
   * 获取部门统计数据
   */
  static async getDepartmentStats() {
    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE is_active = true) as active_departments,
         COUNT(*) FILTER (WHERE is_active = false) as inactive_departments
       FROM departments`
    );
    return result.rows[0];
  }

  /**
   * 获取待审批统计
   */
  static async getPendingApprovalStats() {
    const result = await query(
      'SELECT COUNT(*) as count FROM leave_requests WHERE status = \'pending\''
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * 获取最近入职员工
   */
  static async getRecentHires(days) {
    const result = await query(
      `SELECT e.id, e.name, e.email, e.hire_date, d.name as department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.status = 'active'
         AND e.hire_date >= CURRENT_DATE - INTERVAL '${days} days'
       ORDER BY e.hire_date DESC
       LIMIT 10`
    );
    return result.rows;
  }

  /**
   * 获取团队请假汇总
   */
  static async getTeamLeaveSummary(managerId, startDate, endDate) {
    const dateFilter =
      startDate && endDate
        ? `AND lr.start_date >= '${startDate}' AND lr.end_date <= '${endDate}'`
        : '';

    const result = await query(
      `SELECT
         lr.leave_type,
         COUNT(*) as count,
         SUM(lr.days) as total_days
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE e.manager_id = $1
         AND lr.status = 'approved'
         ${dateFilter}
       GROUP BY lr.leave_type
       ORDER BY total_days DESC`,
      [managerId]
    );
    return result.rows;
  }

  /**
   * 获取团队成员统计
   */
  static async getTeamMemberStats(managerId) {
    const result = await query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE e.status = 'active') as active,
         COUNT(*) FILTER (WHERE e.status = 'inactive') as inactive
       FROM employees e
       WHERE e.manager_id = $1`,
      [managerId]
    );
    return result.rows[0];
  }

  /**
   * 获取即将到来的请假
   */
  static async getUpcomingLeaves(managerId, days) {
    const result = await query(
      `SELECT lr.*, e.name as employee_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE e.manager_id = $1
         AND lr.status = 'approved'
         AND lr.start_date <= CURRENT_DATE + INTERVAL '${days} days'
         AND lr.start_date >= CURRENT_DATE
       ORDER BY lr.start_date ASC
       LIMIT 20`,
      [managerId]
    );
    return result.rows;
  }

  /**
   * 导出人数报表 (CSV)
   */
  static async exportHeadcountReport(params = {}) {
    const data = await this.getHeadcount(params);

    // 生成 CSV
    const lines = ['状态,数量'];

    // 按状态
    for (const row of data.by_status) {
      lines.push(`${row.status},${row.count}`);
    }

    lines.push('');
    lines.push('部门,人数');

    for (const row of data.by_department) {
      lines.push(`${row.department_name},${row.employee_count}`);
    }

    return lines.join('\n');
  }

  /**
   * 导出请假利用率报表 (CSV)
   */
  static async exportLeaveUtilizationReport(params = {}) {
    const data = await this.getLeaveUtilization(params);

    const lines = ['请假类型,申请数,总天数,人数'];

    for (const row of data.by_leave_type) {
      lines.push(
        `${row.leave_type},${row.request_count},${row.total_days},${row.employee_count}`
      );
    }

    lines.push('');
    lines.push('部门,申请数,总天数');

    for (const row of data.by_department) {
      lines.push(`${row.department_name},${row.request_count},${row.total_days}`);
    }

    return lines.join('\n');
  }

  /**
   * 导出员工报表 (CSV)
   */
  static async exportEmployeeReport(params = {}) {
    const { department_id, status } = params;

    const where = [];
    const values = [];
    let paramIndex = 1;

    if (department_id) {
      where.push(`e.department_id = $${paramIndex++}`);
      values.push(department_id);
    }

    if (status) {
      where.push(`e.status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         e.employee_no,
         e.name,
         e.email,
         e.phone,
         d.name as department,
         p.title as position,
         e.hire_date,
         e.status,
         e.role
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       ${whereClause}
       ORDER BY e.name`,
      values
    );

    const lines = [
      '员工编号,姓名,邮箱,电话,部门,职位,入职日期,状态,角色',
    ];

    for (const row of result.rows) {
      lines.push(
        `${row.employee_no},${row.name},${row.email},${row.phone || ''},${row.department || ''},${row.position || ''},${row.hire_date},${row.status},${row.role}`
      );
    }

    return lines.join('\n');
  }
}

module.exports = ReportService;
