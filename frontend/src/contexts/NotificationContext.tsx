import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { NotificationContextType } from '../types/context';

const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * 通知上下文提供者 Props
 */
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * 通知上下文提供者
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // 使用useRef来跟踪正在进行的请求，避免重复请求
  const pendingRequestsRef = useRef<Set<string>>(new Set());
  const lastFetchRef = useRef<number>(0);
  const CACHE_DURATION = 10000; // 10秒缓存

  // 获取通知列表
  const fetchNotifications = useCallback(async (params: any = {}) => {
    const requestKey = `notifications:${JSON.stringify(params)}`;

    // 如果请求正在进行中或刚请求过，则跳过
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < CACHE_DURATION) {
      return;
    }

    setLoading(true);
    pendingRequestsRef.current.add(requestKey);
    lastFetchRef.current = now;

    try {
      const response = await notificationAPI.getNotifications(params) as any;
      setNotifications(response.data?.data || []);
      return response;
    } finally {
      setLoading(false);
      pendingRequestsRef.current.delete(requestKey);
    }
  }, []);

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    const requestKey = 'unread-count';

    // 如果请求正在进行中，则跳过
    if (pendingRequestsRef.current.has(requestKey)) {
      return;
    }

    try {
      pendingRequestsRef.current.add(requestKey);
      const response = await notificationAPI.getUnreadCount() as any;
      setUnreadCount(response.data?.data?.count || 0);
    } catch (error: any) {
      // 401 是正常的，用户未登录时不需要显示错误
      if (error.status !== 401) {
        console.error('Failed to fetch unread count:', error);
      }
    } finally {
      pendingRequestsRef.current.delete(requestKey);
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
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationAPI.markAsRead(id) as any;
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // 刷新未读数量
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [fetchUnreadCount]);

  // 标记全部为已读
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead() as any;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // 刷新通知列表
      fetchNotifications({ limit: 5 });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [fetchNotifications]);

  // 添加新通知
  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // 移除通知
  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
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
export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
