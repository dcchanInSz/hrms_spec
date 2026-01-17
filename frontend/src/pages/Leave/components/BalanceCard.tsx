import { useMemo } from 'react';
import { LeaveBalance } from '@/types/entities';

interface BalanceCardProps {
  balance: LeaveBalance;
  compact?: boolean;
}

/**
 * BalanceCard Component
 * 显示请假余额卡片
 */
function BalanceCard({ balance, compact = false }: BalanceCardProps) {
  const { type, total = 0, used = 0, carryover = 0, available = 0 } = balance || {};

  const leaveTypeInfo = useMemo(() => {
    const types = {
      annual: { label: '年假', color: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700' },
      sick: { label: '病假', color: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-700' },
      personal: { label: '事假', color: 'bg-yellow-500', bgLight: 'bg-yellow-50', text: 'text-yellow-700' },
      other: { label: '其他', color: 'bg-gray-500', bgLight: 'bg-gray-50', text: 'text-gray-700' },
    };
    return types[type] || types.other;
  }, [type]);

  const percentage = useMemo(() => {
    if (total + carryover <= 0) return 0;
    return Math.round((used / (total + carryover)) * 100);
  }, [total, carryover, used]);

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg ${leaveTypeInfo.bgLight}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-8 rounded-full ${leaveTypeInfo.color}`}></div>
          <div>
            <p className="text-sm font-medium text-gray-900">{leaveTypeInfo.label}</p>
            <p className={`text-lg font-bold ${getStatusColor()}`}>
              {available.toFixed(1)} 天可用
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>已用 {used} 天</p>
          <p>总额度 {total + carryover} 天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${leaveTypeInfo.color} flex items-center justify-center`}>
              <span className="text-white font-semibold text-lg">
                {leaveTypeInfo.label.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{leaveTypeInfo.label}</h3>
              <p className="text-sm text-gray-500">
                年度 {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <span className={`text-3xl font-bold ${getStatusColor()}`}>
            {available.toFixed(1)}
            <span className="text-sm font-normal text-gray-500 ml-1">天</span>
          </span>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">使用进度</span>
            <span className="text-gray-700 font-medium">{percentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${leaveTypeInfo.color} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 详细数据 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">年度额度</p>
            <p className="font-semibold text-gray-900">{total} 天</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">已使用</p>
            <p className="font-semibold text-gray-900">{used} 天</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">结转</p>
            <p className="font-semibold text-gray-900">{carryover} 天</p>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      {percentage >= 90 && (
        <div className="px-6 py-2 bg-yellow-50 border-t border-yellow-100">
          <p className="text-xs text-yellow-700">
            剩余天数不足{(total + carryover - used).toFixed(1)}天，请合理安排假期
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceCard;
