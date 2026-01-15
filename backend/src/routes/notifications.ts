import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { success } from '../utils/response';
import NotificationService from '../services/notificationService';

const router = express.Router();

/**
 * GET /api/notifications
 * 获取通知列表
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await NotificationService.getNotifications((req.user as any).id, req.query);
    success(res, notifications, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * 获取未读通知数量
 */
router.get('/unread-count', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await NotificationService.getUnreadCount((req.user as any).id);
    success(res, { count }, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/recent
 * 获取最近通知
 */
router.get('/recent', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await NotificationService.getRecent((req.user as any).id, 5);
    success(res, notifications, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:id/read
 * 标记为已读
 */
router.put('/:id/read', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, (req.user as any).id);
    success(res, notification, '标记成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * 标记所有为已读
 */
router.put('/mark-all-read', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await NotificationService.markAllAsRead((req.user as any).id);
    success(res, result, '标记成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * 删除通知
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await NotificationService.deleteNotification(req.params.id, (req.user as any).id);
    success(res, notification, '删除成功');
  } catch (error) {
    next(error);
  }
});

export default router;
