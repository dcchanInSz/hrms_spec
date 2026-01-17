import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from '@/contexts/NotificationContext';
import { orgAPI } from '@/services/api';
import DepartmentTree from './DepartmentTree';

// 员工卡片组件
const EmployeeCard = ({ employee }) => (
  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-3">
      {employee.name.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center">
        <h4 className="font-medium text-gray-900 truncate">{employee.name}</h4>
        {employee.role === 'manager' && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            经理
          </span>
        )}
        {employee.role === 'hr' && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            HR
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 truncate">{employee.position || '未设置职位'}</p>
    </div>
    <button className="text-gray-400 hover:text-gray-600">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    name: PropTypes.string.isRequired,
    position: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

// 部门详情面板
const DepartmentDetail = ({ department, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!department) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{department.name}</h2>
            {department.parent_name && (
              <p className="text-sm text-gray-500">上级部门: {department.parent_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'employees', 'manager'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && '概览'}
                {tab === 'employees' && `员工 (${department.employees?.length || 0})`}
                {tab === 'manager' && '部门经理'}
              </button>
            ))}
          </nav>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">部门编码</p>
                  <p className="font-medium">{department.code || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">员工数量</p>
                  <p className="font-medium">{department.employees?.length || 0} 人</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">子部门数量</p>
                  <p className="font-medium">{department.children?.length || 0} 个</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">层级深度</p>
                  <p className="font-medium">第 {department.level || 1} 层</p>
                </div>
              </div>
              {department.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">部门描述</p>
                  <p className="text-gray-700">{department.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-2">
              {department.employees && department.employees.length > 0 ? (
                department.employees.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">该部门暂无员工</p>
              )}
            </div>
          )}

          {activeTab === 'manager' && (
            <div>
              {department.manager ? (
                <EmployeeCard employee={department.manager} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">该部门尚未设置部门经理</p>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    设置部门经理
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrgChartPage = () => {
  const [orgChart, setOrgChart] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'
  const { showNotification } = useNotification();

  const loadOrgChart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orgAPI.getOrgChart({ includeEmployees: true }) as any;
      setOrgChart(data.departments);
      setStatistics(data.statistics);
    } catch (error) {
      showNotification({
        type: 'error',
        message: error.message || '加载组织架构失败',
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadOrgChart();
  }, [loadOrgChart]);

  // 统计信息
  const stats = statistics || {
    totalDepartments: 0,
    totalEmployees: 0,
    managers: 0,
    maxDepth: 0,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">组织架构</h1>
          <p className="text-gray-500 mt-1">查看和管理公司组织结构</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => orgAPI.exportOrgChart('csv').then(() => {
              showNotification({ type: 'success', message: '导出成功' });
            })}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出
          </button>
          <button
            onClick={loadOrgChart}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">部门总数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">员工总数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">经理人数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.managers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">组织层级</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maxDepth} 层</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和视图切换 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索员工或部门..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg ${viewMode === 'tree' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 组织架构图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">加载组织架构中...</p>
            </div>
          ) : (
            <DepartmentTree
              departments={orgChart || []}
              onSelect={setSelectedDepartment}
              selectedId={selectedDepartment?.id}
            />
          )}
        </div>

        {/* 右侧信息面板 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">操作指南</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">1.</span>
                点击部门节点查看详情
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">2.</span>
                使用展开/折叠按钮查看子部门
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">3.</span>
                点击员工卡片查看个人信息
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">4.</span>
                使用导出功能下载组织架构
              </li>
            </ul>
          </div>

          {selectedDepartment && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">已选部门</h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedDepartment.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDepartment.employees?.length || 0} 名员工
                </p>
                {selectedDepartment.manager && (
                  <p className="text-sm text-gray-500">
                    经理: {selectedDepartment.manager.name}
                  </p>
                )}
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
                  编辑部门
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  查看员工
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 部门详情弹窗 */}
      {selectedDepartment && (
        <DepartmentDetail
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
        />
      )}
    </div>
  );
};

export default OrgChartPage;
