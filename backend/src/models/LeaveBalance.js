const { query } = require('../models/db');

/**
 * LeaveBalance 数据模型
 * 提供请假余额相关的数据库操作
 */
class LeaveBalanceModel {
  /**
   * 根据员工 ID 和年份查询余额
   */
  static async findByEmployeeAndYear(employeeId, year) {
    const result = await query(
      `SELECT * FROM leave_balances
       WHERE employee_id = $1 AND year = $2
       ORDER BY leave_type`,
      [employeeId, year]
    );
    return result.rows;
  }

  /**
   * 查询特定类型余额
   */
  static async findByEmployeeTypeYear(employeeId, leaveType, year) {
    const result = await query(
      `SELECT * FROM leave_balances
       WHERE employee_id = $1 AND leave_type = $2 AND year = $3`,
      [employeeId, leaveType, year]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取员工所有类型的当前年度余额
   */
  static async getCurrentBalances(employeeId) {
    const currentYear = new Date().getFullYear();
    return this.findByEmployeeAndYear(employeeId, currentYear);
  }

  /**
   * 计算可用天数
   */
  static async getAvailableDays(employeeId, leaveType) {
    const currentYear = new Date().getFullYear();
    const balance = await this.findByEmployeeTypeYear(employeeId, leaveType, currentYear);

    if (!balance) {
      return 0;
    }

    return parseFloat(balance.total_days) +
           parseFloat(balance.carryover_days) -
           parseFloat(balance.used_days);
  }

  /**
   * 创建年度余额记录
   */
  static async create(data) {
    const { employee_id, leave_type, year, total_days, carryover_days = 0 } = data;

    const result = await query(
      `INSERT INTO leave_balances
       (employee_id, leave_type, year, total_days, carryover_days)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (employee_id, leave_type, year)
       DO UPDATE SET total_days = EXCLUDED.total_days,
                    carryover_days = EXCLUDED.carryover_days,
                    updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [employee_id, leave_type, year, total_days, carryover_days]
    );

    return result.rows[0];
  }

  /**
   * 增加已使用天数 (请假批准时调用)
   */
  static async addUsedDays(employeeId, leaveType, year, days) {
    const result = await query(
      `UPDATE leave_balances
       SET used_days = used_days + $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $1 AND leave_type = $2 AND year = $3
       RETURNING *`,
      [employeeId, leaveType, year, days]
    );
    return result.rows[0] || null;
  }

  /**
   * 减少已使用天数 (取消批准时调用)
   */
  static async subtractUsedDays(employeeId, leaveType, year, days) {
    const result = await query(
      `UPDATE leave_balances
       SET used_days = GREATEST(0, used_days - $4),
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $1 AND leave_type = $2 AND year = $3
       RETURNING *`,
      [employeeId, leaveType, year, days]
    );
    return result.rows[0] || null;
  }

  /**
   * 设置结转天数 (年度结转时调用)
   */
  static async setCarryoverDays(employeeId, leaveType, year, carryoverDays) {
    const result = await query(
      `UPDATE leave_balances
       SET carryover_days = $4,
           used_days = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $1 AND leave_type = $2 AND year = $3
       RETURNING *`,
      [employeeId, leaveType, year, carryoverDays]
    );
    return result.rows[0] || null;
  }

  /**
   * 更新年度余额 (重置)
   */
  static async updateYearBalance(employeeId, leaveType, year, totalDays) {
    const result = await query(
      `UPDATE leave_balances
       SET total_days = $4,
           used_days = 0,
           carryover_days = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $1 AND leave_type = $2 AND year = $3
       RETURNING *`,
      [employeeId, leaveType, year, totalDays]
    );
    return result.rows[0] || null;
  }

  /**
   * 为员工初始化所有类型的年度余额
   */
  static async initializeYearBalances(employeeId, year, policies) {
    const results = [];
    for (const policy of policies) {
      const balance = await this.create({
        employee_id: employeeId,
        leave_type: policy.leave_type,
        year,
        total_days: policy.default_days,
        carryover_days: 0,
      });
      results.push(balance);
    }
    return results;
  }

  /**
   * 获取余额汇总 (用于仪表盘)
   */
  static async getBalanceSummary(employeeId) {
    const currentYear = new Date().getFullYear();
    const result = await query(
      `SELECT leave_type,
              total_days + carryover_days - used_days as available_days
       FROM leave_balances
       WHERE employee_id = $1 AND year = $2`,
      [employeeId, currentYear]
    );
    return result.rows;
  }
}

module.exports = LeaveBalanceModel;
