import { useState, useEffect } from 'react';
import { leaveAPI } from '@/services/api';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

interface Leave {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  created_at: string;
  reason?: string;
  rejection_reason?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  status: string;
  leave_type: string;
}

const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    status: '',
    leave_type: '',
  });
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // 加载请假列表
  const loadLeaves = async () => {
    setLoading(true);
    try {
      const response = await leaveAPI.getMyLeaves({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setLeaves(response.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 0,
      }));
    } catch (err) {
      console.error('Failed to load leaves:', err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [pagination.page, filters]);

  // 取消请假
  const handleCancel = async () => {
    if (!selectedLeave) return;

    setCanceling(true);
    try {
      await leaveAPI.cancelRequest(selectedLeave.id);
      setCancelModalOpen(false);
      setSelectedLeave(null);
      loadLeaves();
    } catch (err: any) {
      console.error('Failed to cancel:', err);
      alert(err.message || '取消失败');
    } finally {
      setCanceling(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    archived: '已撤回',
  };

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    archived: 'badge-gray',
  };

  const typeLabels: Record<string, string> = {
    annual: '年假',
    sick: '病假',
    personal: '事假',
    other: '其他',
  };

  const columns = [
    {
      title: '假期类型',
      dataIndex: 'leave_type',
      render: (value: string) => typeLabels[value] || value,
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
    },
    {
      title: '天数',
      dataIndex: 'days',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value: string) => (
        <span className={`badge ${statusColors[value] || 'badge-gray'}`}>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      render: (value: string) => new Date(value).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (_: any, record: Leave) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedLeave(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLeave(record);
                setCancelModalOpen(true);
              }}
            >
              撤回
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">我的请假</h1>

      {/* 筛选器 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">全部状态</option>
              <option value="pending">待审批</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
              <option value="archived">已撤回</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.leave_type}
              onChange={(e) => setFilters(prev => ({ ...prev, leave_type: e.target.value }))}
            >
              <option value="">全部类型</option>
              <option value="annual">年假</option>
              <option value="sick">病假</option>
              <option value="personal">事假</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
      </div>

      {/* 请假列表 */}
      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={leaves}
            loading={loading}
            emptyMessage="暂无请假记录"
            onRowClick={(row: any) => setSelectedLeave(row)}
          />
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
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
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              下一页
            </Button>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedLeave && !cancelModalOpen && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title="请假详情"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">假期类型</label>
                <p className="font-medium">{typeLabels[selectedLeave.leave_type]}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">状态</label>
                <span className={`badge ${statusColors[selectedLeave.status]}`}>
                  {statusLabels[selectedLeave.status]}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500">开始日期</label>
                <p className="font-medium">{selectedLeave.start_date}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">结束日期</label>
                <p className="font-medium">{selectedLeave.end_date}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">请假天数</label>
                <p className="font-medium">{selectedLeave.days} 天</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">申请时间</label>
                <p className="font-medium">
                  {new Date(selectedLeave.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            {selectedLeave.reason && (
              <div>
                <label className="block text-sm text-gray-500">请假原因</label>
                <p className="mt-1 text-gray-900">{selectedLeave.reason}</p>
              </div>
            )}

            {selectedLeave.rejection_reason && (
              <div className="p-3 bg-red-50 rounded-lg">
                <label className="block text-sm text-red-600">拒绝原因</label>
                <p className="mt-1 text-red-800">{selectedLeave.rejection_reason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 取消确认弹窗 */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedLeave(null);
        }}
        title="确认撤回"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要撤回该请假申请吗？撤回后申请将被取消。
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              setCancelModalOpen(false);
              setSelectedLeave(null);
            }}
          >
            取消
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            loading={canceling}
          >
            确定撤回
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MyLeavesPage;
