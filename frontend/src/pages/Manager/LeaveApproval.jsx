import { useState, useEffect } from 'react';
import { leaveAPI } from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';

function LeaveApprovalPage() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, leave: null, reason: '' });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const response = await leaveAPI.getPendingApprovals();
        setPendingApprovals(response.data || []);
        setAllLeaves([]);
      } else {
        const response = await leaveAPI.getTeamLeaves({ status: activeTab, limit: 50 });
        setAllLeaves(response.data || []);
        setPendingApprovals([]);
      }
    } catch (err) {
      setError(err.message || '获取请假数据失败');
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await leaveAPI.approve(id);
      showNotification('审批通过', 'success');
      fetchApprovals();
    } catch (err) {
      showNotification(err.message || '审批失败', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      showNotification('请填写拒绝原因', 'error');
      return;
    }

    try {
      setProcessingId(rejectModal.leave.id);
      await leaveAPI.reject(rejectModal.leave.id, rejectModal.reason);
      showNotification('已拒绝申请', 'success');
      setRejectModal({ open: false, leave: null, reason: '' });
      fetchApprovals();
    } catch (err) {
      showNotification(err.message || '拒绝失败', 'error');
    } finally {
      setProcessingId(null);
    }
  };

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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: '待审批',
      approved: '已批准',
      rejected: '已拒绝',
      archived: '已撤回',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status] || badges.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const displayList = activeTab === 'pending' ? pendingApprovals : allLeaves;

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
      <h1 className="page-title">审批管理</h1>

      {/* Tab 切换 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab === 'pending' && '待审批'}
              {tab === 'approved' && '已批准'}
              {tab === 'rejected' && '已拒绝'}
              {tab === 'pending' && ` (${pendingApprovals.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* 请假列表 */}
      <div className="card">
        <div className="card-body p-0">
          {displayList.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {displayList.map((leave) => (
                <div key={leave.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {leave.employee_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{leave.employee_name}</p>
                          <p className="text-sm text-gray-500">
                            {leave.employee_no} · {leave.department_name || '未知部门'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                          {getLeaveTypeName(leave.leave_type)}
                        </span>
                        {getStatusBadge(leave.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500">请假时间</p>
                          <p className="text-gray-900">
                            {formatDate(leave.start_date)} 至 {formatDate(leave.end_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">请假天数</p>
                          <p className="text-gray-900 font-medium">{leave.days} 天</p>
                        </div>
                        <div>
                          <p className="text-gray-500">申请时间</p>
                          <p className="text-gray-900">{formatDate(leave.created_at)}</p>
                        </div>
                      </div>

                      {leave.reason && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500">请假原因</p>
                          <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">
                            {leave.reason}
                          </p>
                        </div>
                      )}

                      {leave.rejection_reason && leave.status === 'rejected' && (
                        <div className="mt-3">
                          <p className="text-sm text-red-500">拒绝原因</p>
                          <p className="text-sm text-red-700 mt-1 p-3 bg-red-50 rounded-lg">
                            {leave.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    {leave.status === 'pending' && (
                      <div className="flex items-center space-x-3 ml-4">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          disabled={processingId === leave.id}
                          className="btn btn-success flex items-center space-x-1"
                        >
                          {processingId === leave.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span>批准</span>
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, leave, reason: '' })}
                          disabled={processingId === leave.id}
                          className="btn btn-danger flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>拒绝</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">暂无相关请假申请</p>
              <p className="text-sm mt-1">
                {activeTab === 'pending' ? '所有待审批申请都已处理完成' : '没有找到符合条件的记录'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 拒绝确认弹窗 */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setRejectModal({ open: false, leave: null, reason: '' })} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">拒绝请假申请</h3>
              <p className="text-sm text-gray-600 mb-4">
                确定要拒绝 <strong>{rejectModal.leave?.employee_name}</strong> 的请假申请吗？
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  拒绝原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  className="input h-24 resize-none"
                  placeholder="请输入拒绝原因..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setRejectModal({ open: false, leave: null, reason: '' })}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  disabled={processingId}
                  className="btn btn-danger"
                >
                  {processingId ? '处理中...' : '确认拒绝'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveApprovalPage;
