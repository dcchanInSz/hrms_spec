import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, employeeAPI, departmentAPI } from '@/services/api';

function HRDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, employeesRes] = await Promise.all([
          reportAPI.getHRDashboard().catch(() => ({ data: null })),
          employeeAPI.getEmployees({ limit: 5 }).catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setRecentEmployees(employeesRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || '获取仪表盘数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-gray',
      pending: 'badge-warning',
    };
    const labels = {
      active: '在职',
      inactive: '离职',
      pending: '待入职',
    };
    return (
      <span className={`badge ${badges[status] || 'badge-gray'}`}>
        {labels[status] || status}
      </span>
    );
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
      <h1 className="page-title">HR 管理仪表盘</h1>

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
                <p className="text-sm text-gray-500">员工总数</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalEmployees || 0}
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
                <p className="text-sm text-gray-500">在职员工</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activeEmployees || 0}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">部门数量</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalDepartments || 0}
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
                <p className="text-sm text-gray-500">待审批请假</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.pendingLeaveRequests || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 快捷操作 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">快捷操作</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/hr/employees/new"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                  添加员工
                </span>
              </Link>

              <Link
                to="/hr/departments"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                  部门管理
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
                  员工报表
                </span>
              </Link>

              <Link
                to="/hr/audit-logs"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <svg className="w-8 h-8 text-gray-400 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                  审计日志
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 最近添加的员工 */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">最近添加的员工</h3>
            <Link to="/hr/employees" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </Link>
          </div>
          <div className="card-body p-0">
            {recentEmployees.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentEmployees.map((employee) => (
                  <div key={employee.id} className="p-4 flex items-center hover:bg-gray-50">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {employee.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">
                        {employee.department_name || '未分配部门'} · {employee.position_title || '未分配职位'}
                      </p>
                    </div>
                    {getStatusBadge(employee.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>暂无员工数据</p>
                <Link to="/hr/employees/new" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
                  立即添加
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRDashboardPage;
