import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { leaveAPI, notificationAPI } from '@/services/api';

interface DashboardStats {
  pendingLeaves: number;
  myLeavesThisMonth: number;
  unreadNotifications: number;
}

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingLeaves: 0,
    myLeavesThisMonth: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 确保用户已认证才发起请求
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        const [pendingRes, myLeavesRes, unreadRes] = await Promise.all([
          leaveAPI.getPendingApprovals().catch(() => ({ data: { data: [] } })),
          leaveAPI.getMyLeaves({ limit: 10 }).catch(() => ({ data: { data: [], pagination: {} } })),
          notificationAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } })),
        ]);

        setStats({
          pendingLeaves: pendingRes.data?.data?.length || 0,
          myLeavesThisMonth: myLeavesRes.data?.data?.length || 0,
          unreadNotifications: unreadRes.data?.data?.count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const roleLabels: Record<string, string> = {
    employee: '员工',
    manager: '经理',
    hr: 'HR管理员',
  };

  return (
    <div>
      <h1 className="page-title">仪表盘</h1>

      {/* 欢迎信息 */}
      <div className="card mb-6">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900">
            欢迎您，{user?.name}
          </h2>
          <p className="text-gray-600 mt-1">
            您的角色是：<span className="font-medium">{roleLabels[user?.role]}</span>
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">待审批请假</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '-' : stats.pendingLeaves}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">本月请假次数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '-' : stats.myLeavesThisMonth}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">未读通知</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '-' : stats.unreadNotifications}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">快捷操作</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/leave/request"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                申请请假
              </span>
            </a>

            <a
              href="/my-leaves"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                我的请假
              </span>
            </a>

            <a
              href="/paystubs"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                工资单
              </span>
            </a>

            <a
              href="/profile"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                个人资料
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
