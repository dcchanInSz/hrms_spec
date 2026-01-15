import { useState, useEffect } from 'react';
import { leaveAPI } from '@/services/api';
import Input from '@/components/Form/Input';
import Select from '@/components/Form/Select';
import Textarea from '@/components/Form/Textarea';
import Button from '@/components/Button';
import Table from '@/components/Table';

function RequestFormPage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    days: 1,
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 加载请假类型和余额
  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesRes, balancesRes] = await Promise.all([
          leaveAPI.getLeaveTypes().catch(() => ({ data: [] })),
          leaveAPI.getBalance().catch(() => ({ data: [] })),
        ]);
        setLeaveTypes(typesRes.data || []);
        setBalances(balancesRes.data || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 计算请假天数
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      let days = 0;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days++;
        }
      }

      setFormData(prev => ({ ...prev, days }));
    }
  }, [formData.start_date, formData.end_date]);

  // 获取选中类型的可用余额
  const getAvailableBalance = () => {
    if (!formData.leave_type) return 0;
    const balance = balances.find(b => b.type === formData.leave_type);
    return balance?.available || 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      await leaveAPI.createRequest(formData);
      setSuccess(true);
      setFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        days: 1,
        reason: '',
      });

      // 刷新余额
      const balancesRes = await leaveAPI.getBalance();
      setBalances(balancesRes.data || []);
    } catch (err) {
      setError(err.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const balanceColumns = [
    { title: '假期类型', dataIndex: 'type_label' },
    { title: '总天数', dataIndex: 'total' },
    { title: '已使用', dataIndex: 'used' },
    { title: '可用天数', dataIndex: 'available' },
  ];

  const balanceData = balances.map(b => ({
    ...b,
    type_label: b.type === 'annual' ? '年假' : b.type === 'sick' ? '病假' : b.type === 'personal' ? '事假' : '其他',
  }));

  return (
    <div className="max-w-4xl">
      <h1 className="page-title">申请请假</h1>

      {/* 余额显示 */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">当前余额</h3>
        </div>
        <div className="card-body p-0">
          {balances.length > 0 ? (
            <Table columns={balanceColumns} data={balanceData} />
          ) : (
            <div className="p-6 text-center text-gray-500">
              暂无请假余额数据
            </div>
          )}
        </div>
      </div>

      {/* 申请表单 */}
      <div className="card">
        <div className="card-body">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              请假申请已提交成功
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="假期类型"
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                options={leaveTypes}
                placeholder="请选择假期类型"
                required
              />

              {formData.leave_type && (
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">可用天数:</span>
                  <span className={`font-semibold ${getAvailableBalance() < formData.days ? 'text-red-600' : 'text-green-600'}`}>
                    {getAvailableBalance()} 天
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="开始日期"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <Input
                label="结束日期"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
              <Input
                label="请假天数"
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                required
              />
            </div>

            <Textarea
              label="请假原因"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              placeholder="请输入请假原因（选填）"
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={() => setFormData({
                leave_type: '',
                start_date: '',
                end_date: '',
                days: 1,
                reason: '',
              })}>
                重置
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                提交申请
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestFormPage;
