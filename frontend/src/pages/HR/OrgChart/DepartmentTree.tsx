import { useState } from 'react';
import PropTypes from 'prop-types';

const DepartmentTreeNode = ({ department, level = 0, onSelect, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = department.children && department.children.length > 0;
  const isSelected = selectedId === department.id;

  return (
    <div className="ml-4">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary-100 text-primary-700'
            : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(department)}
      >
        {/* 展开/折叠按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`mr-2 w-5 h-5 flex items-center justify-center rounded ${
            hasChildren ? 'bg-gray-200 hover:bg-gray-300' : 'bg-transparent'
          }`}
          disabled={!hasChildren}
        >
          {hasChildren && (
            <span className="text-xs font-medium">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
        </button>

        {/* 部门图标 */}
        <span className="mr-2 text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </span>

        {/* 部门名称 */}
        <span className="font-medium text-gray-700">{department.name}</span>

        {/* 员工数量 */}
        {department.employees && (
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {department.employees.length} 人
          </span>
        )}

        {/* 经理信息 */}
        {department.manager && (
          <span className="ml-2 text-xs text-gray-500">
            经理: {department.manager.name}
          </span>
        )}
      </div>

      {/* 子部门 */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-gray-200 ml-4">
          {department.children.map((child) => (
            <DepartmentTreeNode
              key={child.id}
              department={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

DepartmentTreeNode.propTypes = {
  department: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.array,
    employees: PropTypes.array,
    manager: PropTypes.object,
    manager_name: PropTypes.string,
  }).isRequired,
  level: PropTypes.number,
  onSelect: PropTypes.func,
  selectedId: PropTypes.string,
};

DepartmentTreeNode.defaultProps = {
  level: 0,
  onSelect: () => {},
  selectedId: null,
};

/**
 * DepartmentTree 组件
 * 展示部门层级树形结构
 */
const DepartmentTree = ({ departments, onSelect, selectedId }) => {
  if (!departments || departments.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        暂无部门数据
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-700">组织架构</h3>
      </div>
      <div className="p-2 max-h-[600px] overflow-y-auto">
        {departments.map((dept) => (
          <DepartmentTreeNode
            key={dept.id}
            department={dept}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ))}
      </div>
    </div>
  );
};

DepartmentTree.propTypes = {
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.array,
      employees: PropTypes.array,
      manager: PropTypes.object,
    })
  ),
  onSelect: PropTypes.func,
  selectedId: PropTypes.string,
};

DepartmentTree.defaultProps = {
  departments: [],
  onSelect: () => {},
  selectedId: null,
};

export default DepartmentTree;
