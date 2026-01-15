import { useState, useEffect } from 'react';
import { paystubAPI } from '@/services/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/Button';

function PayStubsPage() {
  const [paystubs, setPaystubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedPaystub, setSelectedPaystub] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 加载工资单列表
  const loadPaystubs = async () => {
    setLoading(true);
    try {
      const response = await paystubAPI.getMyPaystubs({
        year: selectedYear,
        page: pagination.page,
        limit: pagination.limit,
      });
      setPaystubs(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));

      // 加载年度汇总
      try {
        const summaryRes = await paystubAPI.getMyPaystubs({
          year: selectedYear,
          page: 1,
          limit: 100,
        });
        calculateSummary(summaryRes.data || []);
      } catch (e) {
        // 忽略汇总错误
      }
    } catch (err) {
      console.error('Failed to load paystubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaystubs();
  }, [pagination.page, selectedYear]);

  // 计算年度汇总
  const calculateSummary = (data) => {
    if (!data.length) {
      setSummary(null);
      return;
    }

    const total = data.reduce((acc, item) => ({
      base_salary: (acc.base_salary || 0) + parseFloat(item.base_salary || 0),
      bonus: (acc.bonus || 0) + parseFloat(item.bonus || 0),
      deduction: (acc.deduction || 0) + parseFloat(item.deduction || 0),
      tax: (acc.tax || 0) + parseFloat(item.tax || 0),
      net_salary: (acc.net_salary || 0) + parseFloat(item.net_salary || 0),
    }), {});

    setSummary(total);
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount || 0);
  };

  const columns = [
    {
      title: '薪资周期',
      dataIndex: 'pay_period',
      render: (_, record) => `${record.pay_period_start} ~ ${record.pay_period_end}`,
    },
    {
      title: '基本工资',
      dataIndex: 'base_salary',
      render: (value) => formatMoney(value),
    },
    {
      title: '实发工资',
      dataIndex: 'net_salary',
      render: (value) => (
        <span className="font-medium text-green-600">
          {formatMoney(value)}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (value) => new Date(value).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedPaystub(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }

  return (
    <div>
      <h1 className="page-title">工资单</h1>

      {/* 年度汇总 */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">年度基本工资</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatMoney(summary.base_salary)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">年度奖金</p>
              <p className="text-xl font-semibold text-yellow-600">
                {formatMoney(summary.bonus)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">年度扣除</p>
              <p className="text-xl font-semibold text-red-600">
                -{formatMoney(summary.deduction)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">年度税款</p>
              <p className="text-xl font-semibold text-red-600">
                -{formatMoney(summary.tax)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">年度实发</p>
              <p className="text-xl font-semibold text-green-600">
                {formatMoney(summary.net_salary)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <label className="text-gray-700">选择年份:</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year} 年</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 工资单列表 */}
      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={paystubs}
            loading={loading}
            emptyMessage="暂无工资单记录"
            onRowClick={(row) => setSelectedPaystub(row)}
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
      {selectedPaystub && (
        <Modal
          isOpen={!!selectedPaystub}
          onClose={() => setSelectedPaystub(null)}
          title="工资单详情"
          size="lg"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">薪资周期</p>
                <p className="text-lg font-semibold">
                  {selectedPaystub.pay_period_start} ~ {selectedPaystub.pay_period_end}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">实发工资</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatMoney(selectedPaystub.net_salary)}
                </p>
              </div>
            </div>

            {/* 工资明细 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">基本工资</p>
                <p className="text-xl font-semibold">{formatMoney(selectedPaystub.base_salary)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">奖金</p>
                <p className="text-xl font-semibold text-yellow-600">
                  +{formatMoney(selectedPaystub.bonus)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">扣除</p>
                <p className="text-xl font-semibold text-red-600">
                  -{formatMoney(selectedPaystub.deduction)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">税款</p>
                <p className="text-xl font-semibold text-red-600">
                  -{formatMoney(selectedPaystub.tax)}
                </p>
              </div>
            </div>

            {/* 备注 */}
            {selectedPaystub.notes && (
              <div>
                <p className="text-sm text-gray-500">备注</p>
                <p className="mt-1 text-gray-900">{selectedPaystub.notes}</p>
              </div>
            )}

            <div className="text-xs text-gray-400 text-right">
              创建时间: {new Date(selectedPaystub.created_at).toLocaleString('zh-CN')}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PayStubsPage;
