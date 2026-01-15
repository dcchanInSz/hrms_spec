const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { success, paginated } = require('../utils/response');
const NotificationService = require('../services/notificationService');

/**
 * GET /api/notifications
 * 获取通知列表
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { is_read, type, page, limit } = req.query;

    const result = await NotificationService.getNotifications(req.user.id, {
      is_read: is_read !== undefined ? is_read === 'true' : undefined,
      type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * 获取未读通知数量
 */
router.get('/unread-count', authMiddleware, async (req, res, next) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    success(res, { count });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/recent
 * 获取最近通知
 */
router.get('/recent', authMiddleware, async (req, res, next) => {
  try {
    const { limit } = req.query;
    const notifications = await NotificationService.getRecent(
      req.user.id,
      limit ? parseInt(limit) : 5
    );
    success(res, notifications);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:id/read
 * 标记为已读
 */
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    success(res, notification, '已标记为已读');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/read-all
 * 标记所有为已读
 */
router.put('/read-all', authMiddleware, async (req, res, next) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);
    success(res, result, `已标记 ${result.count} 条通知为已读`);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * 删除通知
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await NotificationService.deleteNotification(req.params.id, req.user.id);
    success(res, null, '通知已删除');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
