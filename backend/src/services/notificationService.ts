import NotificationModel from '../models/Notification';

/**
 * NotificationService
 * 处理通知相关的业务逻辑
 */
class NotificationService {
  /**
   * 获取通知列表
   */
  static async getNotifications(userId: string | number, params: any): Promise<any> {
    return NotificationModel.findByUserId(userId, params);
  }

  /**
   * 获取未读数量
   */
  static async getUnreadCount(userId: string | number): Promise<number> {
    return NotificationModel.getUnreadCount(userId);
  }

  /**
   * 标记为已读
   */
  static async markAsRead(id: string | number, userId: string | number): Promise<any> {
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.user_id !== userId) {
      throw new Error('无权操作此通知');
    }

    if (notification.is_read) {
      return notification;
    }

    return NotificationModel.markAsRead(id, userId);
  }

  /**
   * 标记所有为已读
   */
  static async markAllAsRead(userId: string | number): Promise<any> {
    const count = await NotificationModel.markAllAsRead(userId);
    return { count };
  }

  /**
   * 删除通知
   */
  static async deleteNotification(id: string | number, userId: string | number): Promise<any> {
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.user_id !== userId) {
      throw new Error('无权操作此通知');
    }

    return NotificationModel.delete(id, userId);
  }

  /**
   * 获取最近通知
   */
  static async getRecent(userId: string | number, limit: number = 5): Promise<any[]> {
    return NotificationModel.getRecent(userId, limit);
  }

  /**
   * 创建通知
   */
  static async create(data: any): Promise<any> {
    return NotificationModel.create(data);
  }

  /**
   * 批量创建通知
   */
  static async createMany(notifications: any[]): Promise<any[]> {
    return NotificationModel.createMany(notifications);
  }

  /**
   * 获取通知类型列表
   */
  static getTypes(): any[] {
    return [
      { value: 'leave_request', label: '请假申请' },
      { value: 'leave_approved', label: '请假批准' },
      { value: 'leave_rejected', label: '请假拒绝' },
      { value: 'system', label: '系统通知' },
    ];
  }
}

export default NotificationService;
