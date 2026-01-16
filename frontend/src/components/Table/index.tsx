import { forwardRef } from 'react';
import { TableProps } from '../../types/components';

const Table = forwardRef<HTMLTableElement, TableProps<any>>((
  {
    columns = [],
    data = [],
    loading = false,
    emptyMessage = '暂无数据',
    rowKey = 'id',
    onRowClick,
    className = '',
  },
  ref
) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table ref={ref} className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 font-medium"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="mt-2">加载中...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[rowKey] || rowIndex}
                className={`
                  bg-white border-t border-gray-100
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {column.render
                      ? column.render(row[column.dataIndex as keyof typeof row], row)
                      : row[column.dataIndex as keyof typeof row]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
