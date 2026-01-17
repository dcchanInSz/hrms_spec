import { useState, useEffect } from 'react';
import { paystubAPI } from '@/services/api';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { PayStub } from '@/types/entities';

interface Summary {
  base_salary: number;
  bonus: number;
  deduction: number;
  tax: number;
  net_salary: number;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PayStubsPage: React.FC = () => {
  const [paystubs, setPaystubs] = useState<PayStub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedPaystub, setSelectedPaystub] = useState<PayStub | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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
    } catch (err: any) {
      console.error('Failed to load paystubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaystubs();
  }, [pagination.page, selectedYear]);

  // 计算年度汇总
  const calculateSummary = (data: PayStub[]) => {
    if (!data.length) {
      setSummary(null);
      return;
    }

    const total = data.reduce((acc, item) => ({
      base_salary: (acc.base_salary || 0) + parseFloat(item.salary?.toString() || '0'),
      bonus: (acc.bonus || 0) + parseFloat(item.benefits?.toString() || '0'),
      deduction: (acc.deduction || 0) + parseFloat(item.deductions?.toString() || '0'),
      tax: (acc.tax || 0) + parseFloat(item.taxes?.toString() || '0'),
      net_salary: (acc.net_salary || 0) + parseFloat(item.netPay?.toString() || '0'),
    }), {} as Summary);

    setSummary(total);
  };

  const formatMoney = (amount: number | undefined) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount || 0);
  };

  const columns = [
    {
      key: 'pay_period',
      title: '薪资周期',
      dataIndex: 'payPeriodStart',
      render: (_: any, record: PayStub) => `${record.payPeriodStart} ~ ${record.payPeriodEnd}`,
    },
    {
      key: 'gross_pay',
      title: '基本工资',
      dataIndex: 'grossPay',
      render: (value: number) => formatMoney(value),
    },
    {
      key: 'net_pay',
      title: '实发工资',
      dataIndex: 'netPay',
      render: (value: number) => (
        <span className="font-medium text-green-600">
          {formatMoney(value)}
        </span>
      ),
    },
    {
      key: 'pay_date',
      title: '发薪日期',
      dataIndex: 'payDate',
      width: '120px',
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: '100px',
      render: (_: any, record: PayStub) => (
        <button
          onClick={() => setSelectedPaystub(record)}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          查看详情
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">工资单</h1>
        <div className="flex items-center space-x-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year} 年
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 年度汇总 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">总收入</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatMoney(summary.base_salary + summary.bonus)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">总奖金</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatMoney(summary.bonus)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">总税额</p>
              <p className="text-2xl font-semibold text-red-600">
                {formatMoney(summary.tax)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">总扣除</p>
              <p className="text-2xl font-semibold text-red-600">
                {formatMoney(summary.deduction)}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-500">净收入</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatMoney(summary.net_salary)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 工资单列表 */}
      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={paystubs}
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
        isOpen={!!selectedPaystub}
        onClose={() => setSelectedPaystub(null)}
        title="工资单详情"
        size="lg"
      >
        {selectedPaystub && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500">薪资周期</label>
                <p className="font-medium">
                  {selectedPaystub.payPeriodStart} ~ {selectedPaystub.payPeriodEnd}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">发薪日期</label>
                <p className="font-medium">{selectedPaystub.payDate}</p>
              </div>
            </div>

            {/* 工资明细 */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">收入</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">基本工资</span>
                  <span className="font-medium">{formatMoney(selectedPaystub.grossPay)}</span>
                </div>
                {selectedPaystub.benefits && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">福利</span>
                    <span className="font-medium">{formatMoney(selectedPaystub.benefits)}</span>
                  </div>
                )}
                {selectedPaystub.overtime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">加班费</span>
                    <span className="font-medium">{formatMoney(selectedPaystub.overtime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 扣除明细 */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">扣除</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">税费</span>
                  <span className="font-medium text-red-600">
                    -{formatMoney(selectedPaystub.taxes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">其他扣除</span>
                  <span className="font-medium text-red-600">
                    -{formatMoney(selectedPaystub.deductions)}
                  </span>
                </div>
                {selectedPaystub.leaveDeductions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">请假扣除</span>
                    <span className="font-medium text-red-600">
                      -{formatMoney(selectedPaystub.leaveDeductions)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 总计 */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-medium">实发工资</span>
                <span className="font-semibold text-green-600">
                  {formatMoney(selectedPaystub.netPay)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayStubsPage;
