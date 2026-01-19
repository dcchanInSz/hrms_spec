import { useState, useEffect } from 'react';
import { notificationAPI } from '@/services/api';
import Button from '@/components/Button';
import { Notification } from '@/types/entities';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // 加载通知列表
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications({
        page: pagination.page,
        limit: pagination.limit,
      }) as any;
      setNotifications(response?.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: response?.data?.pagination?.total || 0,
        totalPages: response?.data?.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // 加载未读数量
  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount() as any;
      setUnreadCount(response?.data?.count || 0);
    } catch (err: any) {
      console.error('Failed to load unread count:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [pagination.page]);

  // 标记为已读
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id) as any;
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  };

  // 标记全部为已读
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead() as any;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // 删除通知
  const handleDelete = async (id: number) => {
    try {
      await notificationAPI.deleteNotification(id) as any;
      setNotifications(prev => prev.filter(n => n.id !== id));
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Failed to delete:', err);
    }
  };

  const typeLabels: Record<string, string> = {
    leave_request: '请假申请',
    leave_approved: '审批通过',
    leave_rejected: '审批拒绝',
    system: '系统通知',
  };

  const typeColors: Record<string, string> = {
    leave_request: 'bg-blue-100 text-blue-800',
    leave_approved: 'bg-green-100 text-green-800',
    leave_rejected: 'bg-red-100 text-red-800',
    system: 'bg-gray-100 text-gray-800',
  };

  const formatTime = (date: string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} 天前`;
    } else {
      return d.toLocaleDateString('zh-CN');
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">通知中心</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllAsRead}>
            全部标为已读
          </Button>
        )}
      </div>

      {/* 未读数量提示 */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-700">
            您有 <strong>{unreadCount}</strong> 条未读通知
          </p>
        </div>
      )}

      {/* 通知列表 */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>暂无通知</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* 未读标记 */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`badge ${typeColors[notification.type] || 'badge-gray'}`}>
                          {typeLabels[notification.type] || '通知'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center space-x-4 mt-3">
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-sm text-primary-600 hover:text-primary-700"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!notification.isRead) {
                                handleMarkAsRead(notification.id);
                              }
                              window.location.href = notification.link;
                            }}
                          >
                            查看详情
                          </a>
                        )}

                        {!notification.isRead && (
                          <button
                            className="text-sm text-gray-500 hover:text-gray-700"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            标记为已读
                          </button>
                        )}

                        <button
                          className="text-sm text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(notification.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-center space-x-2">
            <Button
              variant="secondary"
              size="small"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              上一页
            </Button>
            <span className="px-4 py-2 text-gray-600">
              第 {pagination.page} / {pagination.totalPages} 页
            </span>
            <Button
              variant="secondary"
              size="small"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
