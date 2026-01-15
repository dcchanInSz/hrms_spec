const { query } = require('../models/db');

/**
 * LeaveRequest 数据模型
 * 提供请假申请相关的数据库操作
 */
class LeaveRequestModel {
  /**
   * 根据 ID 查询请假申请
   */
  static async findById(id) {
    const result = await query(
      `SELECT lr.*,
              e.name as employee_name, e.employee_no,
              a.name as approver_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       LEFT JOIN employees a ON lr.approver_id = a.id
       WHERE lr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据员工 ID 查询请假申请列表
   */
  static async findByEmployeeId(employeeId, params = {}) {
    const { status, leave_type, year, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let where = ['employee_id = $1'];
    let values = [employeeId];
    let paramIndex = 2;

    if (status) {
      where.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (leave_type) {
      where.push(`leave_type = $${paramIndex++}`);
      values.push(leave_type);
    }

    if (year) {
      where.push(`EXTRACT(YEAR FROM start_date) = $${paramIndex++}`);
      values.push(year);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // 查询数据
    const dataResult = await query(
      `SELECT * FROM leave_requests
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) FROM leave_requests WHERE employee_id = $1`,
      [employeeId]
    );

    return {
      data: dataResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  /**
   * 查询待审批的请假申请 (经理)
   */
  static async findPendingForApproval(managerId) {
    const result = await query(
      `SELECT lr.*,
              e.name as employee_name, e.employee_no, e.department_id,
              d.name as department_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE lr.status = 'pending'
         AND e.manager_id = $1
       ORDER BY lr.created_at ASC`,
      [managerId]
    );
    return result.rows;
  }

  /**
   * 查询团队成员的请假申请 (经理)
   */
  static async findByTeam(managerId, params = {}) {
    const { status, start_date, end_date, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let where = ['e.manager_id = $1'];
    let values = [managerId];
    let paramIndex = 2;

    if (status) {
      where.push(`lr.status = $${paramIndex++}`);
      values.push(status);
    }

    if (start_date) {
      where.push(`lr.start_date >= $${paramIndex++}`);
      values.push(start_date);
    }

    if (end_date) {
      where.push(`lr.end_date <= $${paramIndex++}`);
      values.push(end_date);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const dataResult = await query(
      `SELECT lr.*, e.name as employee_name, e.employee_no
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       ${whereClause}
       ORDER BY lr.start_date DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*)
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       ${whereClause}`,
      values
    );

    return {
      data: dataResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    };
  }

  /**
   * 创建请假申请
   */
  static async create(data) {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      days,
      reason,
    } = data;

    const result = await query(
      `INSERT INTO leave_requests
       (employee_id, leave_type, start_date, end_date, days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [employee_id, leave_type, start_date, end_date, days, reason]
    );

    return result.rows[0];
  }

  /**
   * 审批请假申请
   */
  static async approve(id, approverId) {
    const result = await query(
      `UPDATE leave_requests
       SET status = 'approved',
           approver_id = $2,
           approved_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id, approverId]
    );
    return result.rows[0] || null;
  }

  /**
   * 拒绝请假申请
   */
  static async reject(id, approverId, rejectionReason) {
    const result = await query(
      `UPDATE leave_requests
       SET status = 'rejected',
           approver_id = $2,
           rejection_reason = $3,
           approved_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id, approverId, rejectionReason]
    );
    return result.rows[0] || null;
  }

  /**
   * 撤回请假申请
   */
  static async cancel(id, employeeId) {
    const result = await query(
      `UPDATE leave_requests
       SET status = 'archived',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND employee_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, employeeId]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取请假类型统计 (用于报表)
   */
  static async getTypeStats(employeeId, year) {
    const result = await query(
      `SELECT leave_type, COUNT(*) as count, SUM(days) as total_days
       FROM leave_requests
       WHERE employee_id = $1
         AND status = 'approved'
         AND EXTRACT(YEAR FROM start_date) = $2
       GROUP BY leave_type`,
      [employeeId, year]
    );
    return result.rows;
  }

  /**
   * 查询特定日期范围请假 (用于冲突检测和日历)
   */
  static async findByDateRange(employeeId, startDate, endDate) {
    const result = await query(
      `SELECT * FROM leave_requests
       WHERE employee_id = $1
         AND status IN ('pending', 'approved')
         AND NOT (end_date < $2 OR start_date > $3)`,
      [employeeId, startDate, endDate]
    );
    return result.rows;
  }

  /**
   * 查询团队日期范围请假 (用于团队日历)
   */
  static async findTeamByDateRange(managerId, startDate, endDate) {
    const result = await query(
      `SELECT lr.*, e.name as employee_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE e.manager_id = $1
         AND lr.status = 'approved'
         AND NOT (lr.end_date < $2 OR lr.start_date > $3)
       ORDER BY lr.start_date`,
      [managerId, startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = LeaveRequestModel;
