import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { teamAPI } from '@/services/api';
import { User } from '@/types/entities';

interface DashboardData {
  teamSize: number;
  leaveStats: {
    pending_count: number;
    approved_count: number;
    approved_days: number;
  };
  pendingApprovals: Array<{
    id: number;
    employee_name: string;
    start_date: string;
    end_date: string;
    days: number;
    leave_type: string;
    reason?: string;
  }>;
  todayLeaves: Array<{
    id: number;
    employee_name: string;
    start_date: string;
    end_date: string;
    leave_type: string;
  }>;
}

type LeaveType = 'annual' | 'sick' | 'personal' | 'other';

const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 使用useRef来跟踪正在进行的请求，避免重复请求
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchRef = useRef<number>(0);
  const CACHE_DURATION = 30000; // 30秒缓存

  const fetchDashboardData = async () => {
    // 防止重复请求
    if (isFetchingRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < CACHE_DURATION) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const response = await teamAPI.getDashboard() as any;
      setDashboardData(response.data as DashboardData);
    } catch (err: any) {
      setError(err.message || '获取仪表盘数据失败');
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getLeaveTypeName = (type: LeaveType): string => {
    const names: Record<LeaveType, string> = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      other: '其他',
    };
    return names[type] || type;
  };

  const getLeaveTypeColor = (type: LeaveType): string => {
    const colors: Record<LeaveType, string> = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">团队仪表盘</h1>

      {/* 欢迎信息 */}
      <div className="card mb-6">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900">
            欢迎您，{(user as User)?.name}
          </h2>
          <p className="text-gray-600 mt-1">
            当前管理团队人数：<span className="font-medium">{dashboardData?.teamSize || 0} 人</span>
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">团队人数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.teamSize || 0}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">待审批</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.leaveStats?.pending_count || 0}
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
                <p className="text-sm text-gray-500">已批准</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.leaveStats?.approved_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">已使用天数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.leaveStats?.approved_days || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待审批请假 */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">待审批请假</h3>
            <Link to="/manager/approvals" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </Link>
          </div>
          <div className="card-body p-0">
            {dashboardData?.pendingApprovals && dashboardData.pendingApprovals.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {dashboardData.pendingApprovals.slice(0, 5).map((leave) => (
                  <div key={leave.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{leave.employee_name}</p>
                        <p className="text-sm text-gray-500">
                          {leave.start_date} 至 {leave.end_date} · {leave.days}天
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(leave.leave_type as LeaveType)}`}>
                        {getLeaveTypeName(leave.leave_type as LeaveType)}
                      </span>
                    </div>
                    {leave.reason && (
                      <p className="mt-2 text-sm text-gray-600 truncate">{leave.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>暂无待审批的请假申请</p>
              </div>
            )}
          </div>
        </div>

        {/* 今日请假人员 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">今日请假人员</h3>
          </div>
          <div className="card-body p-0">
            {dashboardData?.todayLeaves && dashboardData.todayLeaves.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {dashboardData.todayLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {leave.employee_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{leave.employee_name}</p>
                      <p className="text-sm text-gray-500">
                        {leave.start_date === leave.end_date
                          ? '今天'
                          : `${leave.start_date} 至 ${leave.end_date}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(leave.leave_type as LeaveType)}`}>
                      {getLeaveTypeName(leave.leave_type as LeaveType)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p>今天没有人请假</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">快捷操作</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/manager/approvals"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                审批管理
              </span>
            </Link>

            <Link
              to="/manager/team"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                团队成员
              </span>
            </Link>

            <Link
              to="/manager/approvals"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                请假日历
              </span>
            </Link>

            <Link
              to="/hr/reports"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                团队报表
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
