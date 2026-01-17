import { useState, useEffect, useMemo } from 'react';
import { leaveAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { LeavePolicy } from '@/types/entities';

/**
 * Policies Page
 * 显示请假政策说明页面
 */
function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [showRolloverModal, setShowRolloverModal] = useState<boolean>(false);
  const [rolloverForm, setRolloverForm] = useState({
    employee_id: '',
    leave_type: '',
    carryover_days: 0,
    target_year: new Date().getFullYear() + 1,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getPolicies();
      setPolicies(response.data || []);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeName = (type: string): string => {
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

  const handleRollover = async () => {
    try {
      setSubmitting(true);
      await leaveAPI.yearEndRollover(rolloverForm);
      setShowRolloverModal(false);
      setRolloverForm({
        employee_id: '',
        leave_type: '',
        carryover_days: 0,
        target_year: new Date().getFullYear() + 1,
      });
      alert('年度结转成功');
    } catch (err) {
      alert(err.message || '结转失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: '假期类型',
      dataIndex: 'leave_type',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getLeaveTypeColor(value)}`}>
          {getLeaveTypeName(value)}
        </span>
      ),
    },
    {
      title: '默认天数',
      dataIndex: 'default_days',
      render: (value) => `${value} 天`,
    },
    {
      title: '结转上限',
      dataIndex: 'max_carryover',
      render: (value) => `${value || 0} 天`,
    },
    {
      title: '提前申请',
      dataIndex: 'advance_notice_days',
      render: (value) => `${value || 0} 天`,
    },
    {
      title: '需要审批',
      dataIndex: 'requires_approval',
      render: (value) => (value ? '是' : '否'),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? '启用' : '停用'}
        </span>
      ),
    },
  ];

  const policyDescriptions = {
    annual: '年假是员工带薪休假的重要组成部分，用于员工个人事务处理、家庭休假等。',
    sick: '病假用于员工因病需要休息治疗的情况，需要提供医疗证明（超过3天）。',
    personal: '事假用于处理个人紧急事务，需提前申请并获得主管批准。',
    other: '其他假期包括婚假、产假、陪产假、丧假等特殊假期。',
  };

  return (
    <div>
      <h1 className="page-title">请假政策</h1>

      {/* 政策说明 */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">政策说明</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">年假政策</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 每年初始额度根据工龄和公司政策确定</li>
                <li>• 未使用的年假可结转到下一年（有限额）</li>
                <li>• 年假需提前申请，紧急情况除外</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">病假政策</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• 病假需提供医疗证明（3天以上）</li>
                <li>• 病假不计入年假额度</li>
                <li>• 长期病假需与 HR 单独沟通</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">事假政策</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 事假需提前申请并获得批准</li>
                <li>• 事假按实际请假天数扣除</li>
                <li>• 紧急情况可事后补办手续</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">通用规则</h4>
              <ul className="text-sm text-gray-800 space-y-1">
                <li>• 请假需在系统中提交申请</li>
                <li>• 审批通过后方可休假</li>
                <li>• 休假期间工资按公司规定计算</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 政策表格 */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">假期类型详情</h3>
          {user?.role === 'hr' && (
            <Button variant="primary" size="sm" onClick={() => setShowRolloverModal(true)}>
              年度结转
            </Button>
          )}
        </div>
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={policies}
            loading={loading}
            emptyMessage="暂无请假政策"
            onRowClick={(row) => setSelectedPolicy(row)}
          />
        </div>
      </div>

      {/* 政策详情弹窗 */}
      {selectedPolicy && (
        <Modal
          isOpen={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          title="政策详情"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded-full ${getLeaveTypeColor(selectedPolicy.leave_type)}`}>
                {getLeaveTypeName(selectedPolicy.leave_type)}
              </span>
              <span className={`text-sm ${selectedPolicy.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                {selectedPolicy.is_active ? '启用' : '停用'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{policyDescriptions[selectedPolicy.leave_type]}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">默认天数</label>
                <p className="font-medium">{selectedPolicy.default_days} 天</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">结转上限</label>
                <p className="font-medium">{selectedPolicy.max_carryover || 0} 天</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">提前申请天数</label>
                <p className="font-medium">{selectedPolicy.advance_notice_days || 0} 天</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">需要审批</label>
                <p className="font-medium">{selectedPolicy.requires_approval ? '是' : '否'}</p>
              </div>
              {selectedPolicy.description && (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500">备注</label>
                  <p className="font-medium">{selectedPolicy.description}</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* 年度结转弹窗 */}
      {showRolloverModal && (
        <Modal
          isOpen={showRolloverModal}
          onClose={() => setShowRolloverModal(false)}
          title="年度结转"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              将员工未使用的假期结转到下一年。结转天数不能超过政策规定的上限。
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">员工ID</label>
              <input
                type="text"
                className="input"
                value={rolloverForm.employee_id}
                onChange={(e) => setRolloverForm(prev => ({ ...prev, employee_id: e.target.value }))}
                placeholder="请输入员工ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">假期类型</label>
              <select
                className="input"
                value={rolloverForm.leave_type}
                onChange={(e) => setRolloverForm(prev => ({ ...prev, leave_type: e.target.value }))}
              >
                <option value="">请选择</option>
                <option value="annual">年假</option>
                <option value="sick">病假</option>
                <option value="personal">事假</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结转天数</label>
              <input
                type="number"
                className="input"
                value={rolloverForm.carryover_days}
                onChange={(e) => setRolloverForm(prev => ({ ...prev, carryover_days: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标年度</label>
              <input
                type="number"
                className="input"
                value={rolloverForm.target_year}
                onChange={(e) => setRolloverForm(prev => ({ ...prev, target_year: parseInt(e.target.value) || new Date().getFullYear() + 1 }))}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="secondary" onClick={() => setShowRolloverModal(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleRollover} loading={submitting}>
                确认结转
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PoliciesPage;
