const { query } = require('../models/db');

/**
 * AuditLog 数据模型
 * 提供审计日志相关的数据库操作
 */
class AuditLogModel {
  /**
   * 根据 ID 查询审计日志
   */
  static async findById(id) {
    const result = await query(
      `SELECT al.*, e.name as user_name, e.email as user_email
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       WHERE al.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 获取审计日志列表
   */
  static async findAll(params = {}) {
    const {
      user_id,
      action,
      entity_type,
      entity_id,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = params;

    const where = [];
    const values = [];
    let paramIndex = 1;

    if (user_id) {
      where.push(`al.user_id = $${paramIndex++}`);
      values.push(user_id);
    }

    if (action) {
      where.push(`al.action = $${paramIndex++}`);
      values.push(action);
    }

    if (entity_type) {
      where.push(`al.entity_type = $${paramIndex++}`);
      values.push(entity_type);
    }

    if (entity_id) {
      where.push(`al.entity_id = $${paramIndex++}`);
      values.push(entity_id);
    }

    if (start_date) {
      where.push(`al.created_at >= $${paramIndex++}`);
      values.push(start_date);
    }

    if (end_date) {
      where.push(`al.created_at <= $${paramIndex++}`);
      values.push(end_date);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // 查询数据
    const dataResult = await query(
      `SELECT al.*, e.name as user_name, e.email as user_email
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) FROM audit_logs al ${whereClause}`,
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
   * 获取用户操作日志
   */
  static async findByUser(userId, limit = 20) {
    const result = await query(
      `SELECT al.*, e.name as user_name
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       WHERE al.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  /**
   * 获取实体变更历史
   */
  static async findByEntity(entityType, entityId) {
    const result = await query(
      `SELECT al.*, e.name as user_name
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC`,
      [entityType, entityId]
    );
    return result.rows;
  }

  /**
   * 创建审计日志
   */
  static async create(data) {
    const {
      user_id,
      action,
      entity_type,
      entity_id,
      old_value,
      new_value,
      ip_address,
      user_agent,
    } = data;

    const result = await query(
      `INSERT INTO audit_logs
       (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent]
    );

    return result.rows[0];
  }

  /**
   * 批量创建审计日志
   */
  static async createBatch(logs) {
    if (!logs || logs.length === 0) {
      return [];
    }

    const results = [];
    for (const log of logs) {
      const result = await this.create(log);
      results.push(result);
    }
    return results;
  }

  /**
   * 获取操作类型统计
   */
  static async getActionStats(startDate, endDate) {
    const result = await query(
      `SELECT action, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY action
       ORDER BY count DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  /**
   * 获取用户活动统计
   */
  static async getUserStats(startDate, endDate, limit = 10) {
    const result = await query(
      `SELECT e.name as user_name, COUNT(*) as count
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       WHERE al.created_at >= $1 AND al.created_at <= $2
       GROUP BY e.name
       ORDER BY count DESC
       LIMIT $3`,
      [startDate, endDate, limit]
    );
    return result.rows;
  }

  /**
   * 获取实体类型统计
   */
  static async getEntityStats(startDate, endDate) {
    const result = await query(
      `SELECT entity_type, COUNT(*) as count
       FROM audit_logs
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY entity_type
       ORDER BY count DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  /**
   * 清理旧日志 (保留策略)
   */
  static async cleanup(beforeDate) {
    const result = await query(
      'DELETE FROM audit_logs WHERE created_at < $1 RETURNING id',
      [beforeDate]
    );
    return result.rowCount;
  }
}

module.exports = AuditLogModel;
