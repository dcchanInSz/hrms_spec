const { query } = require('../models/db');

/**
 * LeavePolicy 数据模型
 * 提供请假政策相关的数据库操作
 */
class LeavePolicyModel {
  /**
   * 获取所有请假政策
   */
  static async findAll() {
    const result = await query(
      `SELECT * FROM leave_policies ORDER BY leave_type`,
      []
    );
    return result.rows;
  }

  /**
   * 根据类型获取请假政策
   */
  static async findByType(leaveType) {
    const result = await query(
      `SELECT * FROM leave_policies WHERE leave_type = $1`,
      [leaveType]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取默认请假政策
   */
  static async getDefaultPolicy() {
    const result = await query(
      `SELECT * FROM leave_policies WHERE is_default = true LIMIT 1`,
      []
    );
    return result.rows[0] || null;
  }

  /**
   * 创建请假政策
   */
  static async create(data) {
    const { leave_type, name, default_days, carryover_allowed, max_carryover, description, is_default } = data;

    const result = await query(
      `INSERT INTO leave_policies
       (leave_type, name, default_days, carryover_allowed, max_carryover, description, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [leave_type, name, default_days, carryover_allowed, max_carryover, description, is_default || false]
    );

    return result.rows[0];
  }

  /**
   * 更新请假政策
   */
  static async update(id, data) {
    const { name, default_days, carryover_allowed, max_carryover, description, is_default } = data;

    const result = await query(
      `UPDATE leave_policies
       SET name = COALESCE($2, name),
           default_days = COALESCE($3, default_days),
           carryover_allowed = COALESCE($4, carryover_allowed),
           max_carryover = COALESCE($5, max_carryover),
           description = COALESCE($6, description),
           is_default = COALESCE($7, is_default),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, default_days, carryover_allowed, max_carryover, description, is_default]
    );

    return result.rows[0] || null;
  }

  /**
   * 删除请假政策
   */
  static async delete(id) {
    const result = await query(
      `DELETE FROM leave_policies WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取员工适用的政策
   */
  static async getApplicablePolicy(employeeId) {
    // 先获取员工的自定义政策
    const result = await query(
      `SELECT lp.* FROM leave_policies lp
       INNER JOIN employees e ON lp.leave_type = e.custom_leave_policy
       WHERE e.id = $1`,
      [employeeId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // 否则返回默认政策
    return this.getDefaultPolicy();
  }
}

module.exports = LeavePolicyModel;
