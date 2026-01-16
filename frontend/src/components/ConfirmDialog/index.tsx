import { useState, useEffect, ReactNode } from 'react';
import Modal from '../Modal';
import { ConfirmDialogProps } from '../../types/components';

/**
 * 确认对话框组件
 * 用于敏感操作前的二次确认
 */
const ConfirmDialog = ({
  isOpen,
  title = '确认操作',
  message = '您确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="medium">
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className={`w-8 h-8 ${
                confirmVariant === 'danger' ? 'text-red-500' : 'text-primary-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
      <div className="flex justify-end space-x-4 px-6 py-4 bg-gray-50 rounded-b-xl">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`px-4 py-2 ml-3 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            confirmVariant === 'danger'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              处理中...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

/**
 * 使用确认对话框的 Hook
 */
export function useConfirm(options: Partial<ConfirmDialogProps> = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(options);
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

  useEffect(() => {
    if (isOpen && promise) {
      setPromise(null);
    }
  }, [isOpen]);

  const confirm = (message: string, overrides: Partial<ConfirmDialogProps> = {}) => {
    setConfig({ ...options, ...overrides, message });
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleConfirm = () => {
    if (promise) {
      promise.resolve(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (promise) {
      promise.resolve(false);
    }
    setIsOpen(false);
  };

  return {
    confirm,
    ConfirmDialog: () => (
      <ConfirmDialog
        isOpen={isOpen}
        {...config}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={handleCancel}
      />
    ),
  };
}

/**
 * 预设的危险操作确认类型
 */
export const dangerConfirmations = {
  // 删除确认
  delete: (itemName = '此项目') => ({
    title: '确认删除',
    message: `您确定要删除 ${itemName} 吗？此操作不可恢复。`,
    confirmText: '删除',
    confirmVariant: 'danger',
  }),

  // 离职确认
  terminate: (employeeName: string) => ({
    title: '确认离职',
    message: `您确定要将 ${employeeName} 办理离职吗？这将清除其经理关系。`,
    confirmText: '确认离职',
    confirmVariant: 'danger',
  }),

  // 拒绝确认
  reject: (leaveType = '请假申请') => ({
    title: '确认拒绝',
    message: `您确定要拒绝此 ${leaveType} 吗？`,
    confirmText: '拒绝',
    confirmVariant: 'danger',
  }),

  // 批量操作确认
  batchAction: (count: number, action: string) => ({
    title: '确认批量操作',
    message: `您确定要对选中的 ${count} 项执行"${action}"操作吗？`,
    confirmText: '确认执行',
    confirmVariant: 'danger',
  }),
};

export default ConfirmDialog;
