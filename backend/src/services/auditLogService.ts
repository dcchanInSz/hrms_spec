import { query } from '../models/db';
import { QueryResult } from 'pg';

/**
 * AuditLogService
 * 处理审计日志相关的业务逻辑
 */
class AuditLogService {
  /**
   * 获取审计日志列表
   */
  static async getAuditLogs(params: any = {}): Promise<any> {
    const {
      user_id,
      action,
      entity_type,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = params;

    let where: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      where.push(`user_id = $${paramIndex++}`);
      values.push(user_id);
    }

    if (action) {
      where.push(`action = $${paramIndex++}`);
      values.push(action);
    }

    if (entity_type) {
      where.push(`entity_type = $${paramIndex++}`);
      values.push(entity_type);
    }

    if (start_date) {
      where.push(`created_at >= $${paramIndex++}`);
      values.push(start_date);
    }

    if (end_date) {
      where.push(`created_at <= $${paramIndex++}`);
      values.push(end_date);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // 查询数据
    const dataResult: QueryResult = await query(
      `SELECT al.*, e.name as user_name, e.email as user_email
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult: QueryResult = await query(
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
   * 获取审计日志详情
   */
  static async getAuditLogById(id: string | number): Promise<any> {
    const result: QueryResult = await query(
      `SELECT al.*, e.name as user_name, e.email as user_email
       FROM audit_logs al
       LEFT JOIN employees e ON al.user_id = e.id
       WHERE al.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 创建审计日志
   */
  static async createLog(data: any): Promise<any> {
    const { user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent } = data;

    const result: QueryResult = await query(
      `INSERT INTO audit_logs
       (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent]
    );

    return result.rows[0];
  }

  /**
   * 获取实体变更历史
   */
  static async getEntityHistory(entityType: string, entityId: string | number): Promise<any[]> {
    const result: QueryResult = await query(
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
   * 获取用户操作日志
   */
  static async getUserLogs(userId: string | number, limit: number = 20): Promise<any[]> {
    const result: QueryResult = await query(
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
}

export default AuditLogService;
