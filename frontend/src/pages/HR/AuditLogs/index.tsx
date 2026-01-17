import { useState, useEffect } from 'react';
import { auditAPI } from '@/services/api';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { AuditLog } from '@/types/api';

interface AuditLogFilters {
  action: string;
  entity_type: string;
  start_date: string;
  end_date: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const HRAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<AuditLogFilters>({
    action: '',
    entity_type: '',
    start_date: '',
    end_date: '',
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  // 加载审计日志
  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await auditAPI.getAuditLogs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setLogs(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters]);

  const actionLabels: Record<string, string> = {
    login: '登录',
    logout: '登出',
    create: '创建',
    update: '更新',
    delete: '删除',
    approve: '批准',
    reject: '拒绝',
    onboarding: '入职',
    offboarding: '离职',
    password_change: '修改密码',
  };

  const entityTypeLabels: Record<string, string> = {
    employee: '员工',
    department: '部门',
    position: '职位',
    leave_request: '请假申请',
    pay_stub: '工资单',
    notification: '通知',
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      login: 'badge-success',
      logout: 'badge-gray',
      create: 'badge-primary',
      update: 'badge-info',
      delete: 'badge-danger',
      approve: 'badge-success',
      reject: 'badge-danger',
      onboarding: 'badge-success',
      offboarding: 'badge-warning',
      password_change: 'badge-info',
    };
    return (
      <span className={`badge ${actionColors[action] || 'badge-gray'}`}>
        {actionLabels[action] || action}
      </span>
    );
  };

  const columns = [
    {
      key: 'created_at',
      title: '操作时间',
      dataIndex: 'created_at',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
    {
      key: 'user_name',
      title: '操作人',
      dataIndex: 'user_name',
      render: (value: string, record: AuditLog) => (
        <div>
          <span className="font-medium">{value || '系统'}</span>
          {record.userEmail && (
            <p className="text-sm text-gray-500">{record.userEmail}</p>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作类型',
      dataIndex: 'action',
      width: '120px',
      render: (value: string) => getActionBadge(value),
    },
    {
      key: 'entity_type',
      title: '操作对象',
      dataIndex: 'entity_type',
      width: '120px',
      render: (value: string) => (
        <span>{entityTypeLabels[value] || value}</span>
      ),
    },
    {
      key: 'entity_id',
      title: '对象ID',
      dataIndex: 'entity_id',
      width: '200px',
      render: (value: string) => (
        <span className="text-gray-500 font-mono text-sm">
          {value?.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: 'ip_address',
      title: 'IP 地址',
      dataIndex: 'ip_address',
      width: '140px',
      render: (value: string) => <span className="text-gray-500">{value || '-'}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: '80px',
      render: (_: any, record: AuditLog) => (
        <button
          onClick={() => {
            setSelectedLog(record);
            setDetailModalOpen(true);
          }}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          详情
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">审计日志</h1>

      {/* 筛选器 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.action}
              onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
            >
              <option value="">全部操作</option>
              <option value="login">登录</option>
              <option value="create">创建</option>
              <option value="update">更新</option>
              <option value="delete">删除</option>
              <option value="approve">批准</option>
              <option value="reject">拒绝</option>
              <option value="onboarding">入职</option>
              <option value="offboarding">离职</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.entity_type}
              onChange={(e) => setFilters((prev) => ({ ...prev, entity_type: e.target.value }))}
            >
              <option value="">全部对象</option>
              <option value="employee">员工</option>
              <option value="department">部门</option>
              <option value="position">职位</option>
              <option value="leave_request">请假申请</option>
              <option value="pay_stub">工资单</option>
            </select>

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.start_date}
              onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
              placeholder="开始日期"
            />

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.end_date}
              onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
              placeholder="结束日期"
            />

            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  action: '',
                  entity_type: '',
                  start_date: '',
                  end_date: '',
                })
              }
            >
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={logs}
            loading={loading}
          />
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              上一页
            </Button>
            <span className="px-4 py-2 text-gray-600">
              第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 条
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              下一页
            </Button>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLog(null);
        }}
        title="日志详情"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">操作时间</label>
                <p className="font-medium">{new Date(selectedLog.createdAt).toLocaleString('zh-CN')}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">操作人</label>
                <p className="font-medium">{selectedLog.userName || '系统'}</p>
                {selectedLog.userEmail && (
                  <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">操作类型</label>
                <p>{getActionBadge(selectedLog.action)}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">操作对象</label>
                <p className="font-medium">{entityTypeLabels[selectedLog.entityType] || selectedLog.entityType}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-500">对象ID</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.entityId}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">IP 地址</label>
                <p className="font-medium">{selectedLog.ipAddress || '-'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">User Agent</label>
                <p className="font-medium text-sm truncate">{selectedLog.userAgent || '-'}</p>
              </div>
            </div>

            {/* 变更对比 */}
            {(selectedLog.oldValues || selectedLog.newValues) && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">变更详情</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <label className="block text-sm text-red-600 mb-1">旧值</label>
                    <pre className="text-sm text-red-800 overflow-auto max-h-40">
                      {JSON.stringify(selectedLog.oldValues, null, 2) || '-'}
                    </pre>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <label className="block text-sm text-green-600 mb-1">新值</label>
                    <pre className="text-sm text-green-800 overflow-auto max-h-40">
                      {JSON.stringify(selectedLog.newValues, null, 2) || '-'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRAuditLogsPage;
