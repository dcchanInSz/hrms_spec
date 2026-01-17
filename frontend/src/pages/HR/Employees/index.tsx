import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeAPI, departmentAPI } from '@/services/api';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Employee, Department } from '@/types/entities';

interface Filters {
  department_id: string;
  status: string;
  role: string;
  search: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const HREmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    department_id: '',
    status: '',
    role: '',
    search: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // 加载员工列表
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getEmployees({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setEmployees(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载部门列表
  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data || []);
    } catch (err: any) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [pagination.page, filters]);

  // 删除员工
  const handleDelete = async () => {
    if (!selectedEmployee) return;

    setDeleting(true);
    try {
      await employeeAPI.deleteEmployee(selectedEmployee.id);
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (err: any) {
      console.error('Failed to delete employee:', err);
      alert(err.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const statusLabels: Record<string, string> = {
    active: '在职',
    inactive: '离职',
  };

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-gray',
  };

  const roleLabels: Record<string, string> = {
    employee: '员工',
    manager: '经理',
    hr: 'HR',
  };

  const roleColors: Record<string, string> = {
    employee: 'badge-gray',
    manager: 'badge-info',
    hr: 'badge-primary',
  };

  const columns = [
    {
      key: 'employee_no',
      title: '员工编号',
      dataIndex: 'employeeId',
      width: '120px',
    },
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
      render: (value: string, record: Employee) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-700 font-medium text-sm">
              {value?.charAt(0) || 'U'}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'department_name',
      title: '部门',
      dataIndex: 'departmentName',
    },
    {
      key: 'position_title',
      title: '职位',
      dataIndex: 'positionName',
    },
    {
      key: 'role',
      title: '角色',
      dataIndex: 'role',
      render: (value: string) => (
        <span className={`badge ${roleColors[value] || 'badge-gray'}`}>
          {roleLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value: string) => (
        <span className={`badge ${statusColors[value] || 'badge-gray'}`}>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      key: 'hire_date',
      title: '入职日期',
      dataIndex: 'hireDate',
      width: '120px',
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: '150px',
      render: (_: any, record: Employee) => (
        <div className="flex space-x-2">
          <Link
            to={`/hr/employees/${record.id}`}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            编辑
          </Link>
          <Link
            to={`/hr/employees/${record.id}/history`}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            历史
          </Link>
          <button
            onClick={() => {
              setSelectedEmployee(record);
              setDeleteModalOpen(true);
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">员工管理</h1>
        <Link to="/hr/employees/new">
          <Button variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            添加员工
          </Button>
        </Link>
      </div>

      {/* 筛选器 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="搜索姓名、邮箱、员工编号..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 min-w-[200px]"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.department_id}
              onChange={(e) => setFilters((prev) => ({ ...prev, department_id: e.target.value }))}
            >
              <option value="">全部部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">全部状态</option>
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="">全部角色</option>
              <option value="employee">员工</option>
              <option value="manager">经理</option>
              <option value="hr">HR</option>
            </select>

            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  department_id: '',
                  status: '',
                  role: '',
                  search: '',
                })
              }
            >
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* 员工列表 */}
      <div className="card">
        <div className="card-body p-0">
          <Table
            columns={columns}
            data={employees}
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

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除员工「{selectedEmployee?.name}」吗？删除后员工状态将变更为离职。
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedEmployee(null);
            }}
          >
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            确定删除
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default HREmployeesPage;
