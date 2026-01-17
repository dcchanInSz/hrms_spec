import { useState, useEffect } from 'react';
import { reportAPI } from '@/services/api';
import ExportButton from '@/components/ExportButton';

interface DateRange {
  start_date: string;
  end_date: string;
}

interface AnalyticsData {
  team_size: number;
  member_stats?: {
    active: number;
  };
  leave_summary?: Array<{
    leave_type: string;
    count: number;
    total_days: number;
  }>;
  members?: Array<{
    id: number;
    name: string;
    department?: string;
    position?: string;
    hire_date?: string;
  }>;
  upcoming_leaves?: Array<{
    id: number;
    employee_name: string;
    start_date: string;
    end_date: string;
    leave_type: string;
    days: number;
  }>;
}

const ManagerAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await reportAPI.getTeamAnalytics();
        setAnalytics(response.data as AnalyticsData);
      } catch (err: any) {
        console.error('Failed to fetch team analytics:', err);
        setError(err.message || '获取团队分析数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const getLeaveTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      other: '其他',
    };
    return typeMap[type] || type;
  };

  const getLeaveTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString();
  };

  const handleDateChange = (field: keyof DateRange, value: string) => {
    setDateRange({ ...dateRange, [field]: value });
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">团队分析</h1>
        <ExportButton
          type="leave-utilization"
          label="导出报表"
          className="btn-secondary"
          params={dateRange}
        />
      </div>

      {/* 日期范围筛选 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 概览卡片 */}
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
                  {analytics?.team_size || 0}
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
                <p className="text-sm text-gray-500">在职成员</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.member_stats?.active || 0}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">已批准天数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(analytics?.leave_summary?.reduce((sum, l) => sum + parseFloat(l.total_days?.toString() || '0'), 0))}
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
                <p className="text-sm text-gray-500">即将请假</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.upcoming_leaves?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 团队成员列表 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">团队成员</h3>
          </div>
          <div className="card-body p-0">
            {analytics?.members?.length ? (
              <div className="divide-y divide-gray-100">
                {analytics.members.map((member) => (
                  <div key={member.id} className="p-4 flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {member.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">
                        {member.department || '未分配'} · {member.position || '未分配'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">入职</p>
                      <p className="text-sm font-medium text-gray-900">
                        {member.hire_date?.split('-')[0] || '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>暂无团队成员</p>
              </div>
            )}
          </div>
        </div>

        {/* 请假汇总 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">请假类型分布</h3>
          </div>
          <div className="card-body p-0">
            {analytics?.leave_summary?.length ? (
              <div className="divide-y divide-gray-100">
                {analytics.leave_summary.map((leave) => (
                  <div key={leave.leave_type} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(leave.leave_type)}`}
                      >
                        {getLeaveTypeName(leave.leave_type)}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {leave.count} 次申请
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{leave.total_days} 天</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>暂无请假记录</p>
              </div>
            )}
          </div>
        </div>

        {/* 即将请假 */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">即将请假 (未来 14 天)</h3>
          </div>
          <div className="card-body p-0">
            {analytics?.upcoming_leaves?.length ? (
              <div className="divide-y divide-gray-100">
                {analytics.upcoming_leaves.map((leave) => (
                  <div key={leave.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {leave.employee_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{leave.employee_name}</p>
                        <p className="text-sm text-gray-500">
                          {leave.start_date === leave.end_date
                            ? leave.start_date
                            : `${leave.start_date} 至 ${leave.end_date}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(leave.leave_type)}`}
                      >
                        {getLeaveTypeName(leave.leave_type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {leave.days} 天
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>未来 14 天没有人请假</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalyticsPage;
