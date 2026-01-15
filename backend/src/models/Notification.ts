import { query } from './db';
import { QueryResult } from 'pg';

/**
 * Notification 数据模型
 * 提供通知相关的数据库操作
 */
class NotificationModel {
  /**
   * 根据 ID 查询通知
   */
  static async findById(id: string | number): Promise<any> {
    const result: QueryResult = await query(
      `SELECT * FROM notifications WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 根据用户 ID 查询通知列表
   */
  static async findByUserId(userId: string | number, params: any = {}): Promise<any> {
    const { is_read, type, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let where: string[] = ['user_id = $1'];
    let values: any[] = [userId];
    let paramIndex = 2;

    if (is_read !== undefined) {
      where.push(`is_read = $${paramIndex++}`);
      values.push(is_read);
    }

    if (type) {
      where.push(`type = $${paramIndex++}`);
      values.push(type);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // 查询数据
    const dataResult: QueryResult = await query(
      `SELECT * FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...values, limit, offset]
    );

    // 查询总数
    const countResult: QueryResult = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1`,
      [userId]
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
   * 获取未读通知数量
   */
  static async getUnreadCount(userId: string | number): Promise<number> {
    const result: QueryResult = await query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * 创建通知
   */
  static async create(data: any): Promise<any> {
    const {
      user_id,
      type,
      title,
      message,
      link = null,
    } = data;

    const result: QueryResult = await query(
      `INSERT INTO notifications
       (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, type, title, message, link]
    );

    return result.rows[0];
  }

  /**
   * 批量创建通知
   */
  static async createMany(notifications: any[]): Promise<any[]> {
    if (!notifications || notifications.length === 0) {
      return [];
    }

    const results: any[] = [];
    for (const notification of notifications) {
      const result = await this.create(notification);
      results.push(result);
    }
    return results;
  }

  /**
   * 标记为已读
   */
  static async markAsRead(id: string | number, userId: string | number): Promise<any> {
    const result: QueryResult = await query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * 标记所有为已读
   */
  static async markAllAsRead(userId: string | number): Promise<number> {
    const result: QueryResult = await query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE
       RETURNING COUNT(*) as count`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * 删除通知
   */
  static async delete(id: string | number, userId: string | number): Promise<any> {
    const result: QueryResult = await query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * 创建请假相关通知
   */
  static async createLeaveNotification(leaveRequest: any, action: string): Promise<any> {
    const { employee_id, id, leave_type } = leaveRequest;

    const typeMap: any = {
      submitted: { type: 'leave_request', title: '请假申请已提交', message: `您的${leave_type}请假申请已提交，等待审批` },
      approved: { type: 'leave_approved', title: '请假申请已批准', message: `您的${leave_type}请假申请已批准` },
      rejected: { type: 'leave_rejected', title: '请假申请被拒绝', message: `您的${leave_type}请假申请被拒绝` },
    };

    const notification = typeMap[action];
    if (!notification) {
      return null;
    }

    return this.create({
      user_id: employee_id,
      ...notification,
      link: `/my-leaves/${id}`,
    });
  }

  /**
   * 为经理创建审批通知
   */
  static async createApprovalNotification(managerId: string | number, leaveRequest: any): Promise<any> {
    return this.create({
      user_id: managerId,
      type: 'leave_request',
      title: '有待审批的请假申请',
      message: `${leaveRequest.employee_name || '某员工'}提交了${leaveRequest.leave_type}请假申请`,
      link: `/manager/approvals`,
    });
  }

  /**
   * 获取最近通知 (用于下拉菜单)
   */
  static async getRecent(userId: string | number, limit: number = 5): Promise<any[]> {
    const result: QueryResult = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

export default NotificationModel;
