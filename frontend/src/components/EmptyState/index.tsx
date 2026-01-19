import Button from '../Button';
import { EmptyStateProps } from '../../types/components';

const EmptyState = ({
  icon,
  title = '暂无数据',
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {/* 图标 */}
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}

      {/* 默认图标 */}
      {!icon && (
        <div className="mb-4 p-4 bg-gray-100 rounded-full">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {(action || actionLabel) && (
        <Button
          variant={action?.label === 'primary' ? 'primary' : 'secondary'}
          onClick={onAction || action?.onClick}
        >
          {actionLabel || action?.label || '添加数据'}
        </Button>
      )}
    </div>
  );
};

/**
 * 预设的空状态类型
 */
EmptyState.types = {
  // 无数据
  noData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      }
      title="暂无数据"
      description="暂时没有相关记录，请稍后再试"
      {...props}
    />
  ),

  // 无结果
  noResult: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="未找到结果"
      description="请尝试修改搜索条件"
      {...props}
    />
  ),

  // 暂无权限
  noPermission: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      }
      title="暂无权限"
      description="您没有查看此内容的权限"
      {...props}
    />
  ),

  // 网络错误
  networkError: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title="网络错误"
      description="请检查您的网络连接后重试"
      actionLabel="刷新页面"
      onAction={() => window.location.reload()}
      {...props}
    />
  ),
};

export default EmptyState;
