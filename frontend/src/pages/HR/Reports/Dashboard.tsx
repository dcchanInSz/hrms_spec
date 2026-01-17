import { useState, useEffect } from 'react';
import { reportAPI } from '@/services/api';
import ExportButton from '@/components/ExportButton';

function HRReportsPage() {
  const [activeTab, setActiveTab] = useState('headcount');
  const [headcountData, setHeadcountData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [headcountRes, leaveRes] = await Promise.all([
          reportAPI.getHeadcount({}).catch(() => ({ data: null })),
          reportAPI.getLeaveUtilization({ year }).catch(() => ({ data: null })),
        ]);
        setHeadcountData(headcountRes.data);
        setLeaveData(leaveRes.data);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
        setError(err.message || '获取报表数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [year]);

  const getLeaveTypeName = (type) => {
    const names = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      other: '其他',
    };
    return names[type] || type;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) {return '0';}
    return Number(num).toLocaleString();
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
        <h1 className="page-title">报表分析</h1>
        <div className="flex items-center gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="form-select w-32"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
          <ExportButton
            type="headcount"
            label="导出人数报表"
            className="btn-secondary"
          />
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('headcount')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'headcount'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            人数统计
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'leave'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            请假分析
          </button>
        </nav>
      </div>

      {/* 人数统计 Tab */}
      {activeTab === 'headcount' && (
        <div className="space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">在职员工</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(headcountData?.total_active)}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">离职员工</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(headcountData?.total_inactive)}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">活跃部门</p>
                <p className="text-3xl font-bold text-gray-900">
                  {headcountData?.by_department?.length || 0}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">职位类型</p>
                <p className="text-3xl font-bold text-gray-900">
                  {headcountData?.by_position?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 按部门统计 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">部门人数分布</h3>
              </div>
              <div className="card-body p-0">
                <div className="divide-y divide-gray-100">
                  {headcountData?.by_department?.map((dept) => (
                    <div key={dept.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{dept.department_name}</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((dept.employee_count / (headcountData?.total_active || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-2xl font-bold text-gray-900">{dept.employee_count}</p>
                        <p className="text-sm text-gray-500">人</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 按状态统计 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">员工状态分布</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {headcountData?.by_status?.map((status) => {
                    const total = (headcountData?.total_active || 0) + (headcountData?.total_inactive || 0);
                    const percentage = total > 0 ? ((status.count / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${
                              status.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-gray-700">
                            {status.status === 'active' ? '在职' : '离职'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-900 font-medium w-20 text-right">
                            {status.count} 人 ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 入职趋势 */}
            <div className="card lg:col-span-2">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">近 12 个月入职趋势</h3>
              </div>
              <div className="card-body">
                <div className="flex items-end space-x-2 h-48">
                  {headcountData?.hire_trend?.slice(-12).map((item, index) => {
                    const maxCount = Math.max(...headcountData.hire_trend.map((i) => parseInt(i.count) || 0), 1);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                          style={{
                            height: `${((parseInt(item.count) || 0) / maxCount) * 100}%`,
                            minHeight: '4px',
                          }}
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {item.month}/{item.year?.toString().slice(-2)}
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 请假分析 Tab */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">年假使用</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatNumber(leaveData?.by_leave_type?.find((t) => t.leave_type === 'annual')?.total_days || 0)}
                </p>
                <p className="text-sm text-gray-500">天</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">病假使用</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatNumber(leaveData?.by_leave_type?.find((t) => t.leave_type === 'sick')?.total_days || 0)}
                </p>
                <p className="text-sm text-gray-500">天</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">事假使用</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {formatNumber(leaveData?.by_leave_type?.find((t) => t.leave_type === 'personal')?.total_days || 0)}
                </p>
                <p className="text-sm text-gray-500">天</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500">其他假别</p>
                <p className="text-3xl font-bold text-gray-600">
                  {formatNumber(leaveData?.by_leave_type?.find((t) => t.leave_type === 'other')?.total_days || 0)}
                </p>
                <p className="text-sm text-gray-500">天</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 按类型统计 */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">请假类型分布</h3>
                <ExportButton
                  type="leave-utilization"
                  label="导出"
                  className="btn-secondary text-sm"
                />
              </div>
              <div className="card-body p-0">
                <div className="divide-y divide-gray-100">
                  {leaveData?.by_leave_type?.map((type) => (
                    <div key={type.leave_type} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(type.leave_type)}`}
                        >
                          {getLeaveTypeName(type.leave_type)}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {type.employee_count} 人申请
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{type.total_days} 天</p>
                        <p className="text-sm text-gray-500">{type.request_count} 次申请</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 部门利用率 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">部门请假天数排名</h3>
              </div>
              <div className="card-body p-0">
                <div className="divide-y divide-gray-100">
                  {leaveData?.department_utilization
                    ?.sort((a, b) => b.total_leave_days - a.total_leave_days)
                    .slice(0, 10)
                    .map((dept, index) => (
                      <div key={dept.department_id} className="p-4 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{dept.department_name}</p>
                          <p className="text-sm text-gray-500">
                            {dept.employee_count} 人 · 平均 {dept.avg_days_per_employee} 天/人
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{dept.total_leave_days}</p>
                          <p className="text-sm text-gray-500">天</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRReportsPage;
