import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext(null);

/**
 * 通知上下文提供者
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // 获取通知列表
  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data?.data || []);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data?.data?.count || 0);
    } catch (error) {
      // 401 是正常的，用户未登录时不需要显示错误
      if (error.status !== 401) {
        console.error('Failed to fetch unread count:', error);
      }
    }
  }, []);

  // 初始加载 - 仅在用户已认证时执行
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications({ limit: 5 });
    }
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  // 标记为已读
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // 标记全部为已读
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // 添加新通知
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // 移除通知
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * 使用通知上下文
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
