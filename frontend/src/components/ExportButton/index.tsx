import { useState } from 'react';
import { reportAPI } from '../../services/api';
import { ExportButtonProps } from '../../types/components';

const ExportButton = ({
  type,
  label = '导出',
  format = 'csv',
  params = {},
  className = '',
  onSuccess,
  onError,
}: ExportButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.exportReport(type, format, params);

      // 创建下载链接
      const data = typeof response === 'string' ? response : response.data || response;
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      if (onError) {
        onError(error);
      } else {
        alert('导出失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-colors duration-200
        bg-gray-100 text-gray-700 hover:bg-gray-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
        disabled:opacity-50 disabled:cursor-not-allowed
        px-4 py-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx={12}
              cy={12}
              r={10}
              stroke="currentColor"
              strokeWidth={4}
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          导出中...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

export default ExportButton;
