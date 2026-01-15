/**
 * HR Employees Page Component Tests
 * Tests for T192: HR Page Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HREmployeesPage from '../../src/pages/HR/Employees';
import { employeeAPI, departmentAPI } from '../../src/services/api';

// Mock the API
vi.mock('../../src/services/api', () => ({
  employeeAPI: {
    getEmployees: vi.fn(),
    deleteEmployee: vi.fn(),
  },
  departmentAPI: {
    getDepartments: vi.fn(),
  },
}));

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'hr-001',
      name: 'HR Admin',
      role: 'hr',
    },
  }),
}));

// Mock Table component
vi.mock('../../src/components/Table', () => ({
  default: ({ columns, data, loading, emptyMessage, onRowClick }) => (
    <div data-testid="table-mock">
      {loading && <div data-testid="table-loading">Loading...</div>}
      {data.length === 0 ? (
        <div data-testid="table-empty">{emptyMessage}</div>
      ) : (
        <div data-testid="table-data" data-count={data.length}>
          {data.map((row) => (
            <div
              key={row.id}
              data-testid={`table-row-${row.id}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <span key={col.dataIndex} data-field={col.dataIndex}>
                  {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

// Mock Button component
vi.mock('../../src/components/Button', () => ({
  default: ({ children, variant, onClick, disabled, loading }) => (
    <button
      data-testid={`button-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

// Mock Modal component
vi.mock('../../src/components/Modal', () => ({
  default: ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal-mock">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
      </div>
    );
  },
}));

describe('HREmployeesPage', () => {
  const mockEmployees = [
    {
      id: 'emp-001',
      employee_no: 'EMP001',
      name: 'John Doe',
      email: 'john@company.com',
      department_name: 'Engineering',
      position_title: 'Software Engineer',
      role: 'employee',
      status: 'active',
      hire_date: '2023-01-15',
    },
    {
      id: 'emp-002',
      employee_no: 'EMP002',
      name: 'Jane Smith',
      email: 'jane@company.com',
      department_name: 'Engineering',
      position_title: 'Senior Engineer',
      role: 'manager',
      status: 'active',
      hire_date: '2022-06-01',
    },
  ];

  const mockDepartments = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Marketing' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    departmentAPI.getDepartments.mockResolvedValue({ data: mockDepartments });
    employeeAPI.getEmployees.mockResolvedValue({
      data: mockEmployees,
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render page title', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('员工管理')).toBeInTheDocument();
      });
    });

    it('should render add employee button', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const addButton = screen.getByRole('link', { name: /添加员工/i });
        expect(addButton).toHaveAttribute('href', '/hr/employees/new');
      });
    });

    it('should render search input', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('搜索姓名、邮箱、员工编号...')).toBeInTheDocument();
      });
    });

    it('should render department filter', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should render status filter', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const statusSelect = screen.getByRole('combobox', { name: /全部状态/i });
        expect(statusSelect).toBeInTheDocument();
      });
    });

    it('should render role filter', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const roleSelect = screen.getByRole('combobox', { name: /全部角色/i });
        expect(roleSelect).toBeInTheDocument();
      });
    });

    it('should render reset button', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /重置/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load employees on mount', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
            limit: 10,
          })
        );
      });
    });

    it('should load departments on mount', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(departmentAPI.getDepartments).toHaveBeenCalled();
      });
    });

    it('should display employee data', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('EMP001')).toBeInTheDocument();
        expect(screen.getByText('EMP002')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      employeeAPI.getEmployees.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });

    it('should show empty state when no employees', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('table-empty')).toHaveTextContent('暂无员工数据');
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by search term', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('搜索姓名、邮箱、员工编号...');
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'John' })
        );
      });
    });

    it('should filter by department', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const departmentSelect = screen.getByRole('combobox', { name: /全部部门/i });
      await user.selectOptions(departmentSelect, 'dept-1');

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ department_id: 'dept-1' })
        );
      });
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /全部状态/i })).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox', { name: /全部状态/i });
      await user.selectOptions(statusSelect, 'active');

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'active' })
        );
      });
    });

    it('should filter by role', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /全部角色/i })).toBeInTheDocument();
      });

      const roleSelect = screen.getByRole('combobox', { name: /全部角色/i });
      await user.selectOptions(roleSelect, 'manager');

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'manager' })
        );
      });
    });

    it('should reset filters when reset button clicked', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /重置/i })).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /重置/i });
      await user.click(resetButton);

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({
            department_id: '',
            status: '',
            role: '',
            search: '',
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should show pagination when multiple pages', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: mockEmployees,
        pagination: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('第 1 / 5 页，共 50 条')).toBeInTheDocument();
      });
    });

    it('should not show pagination when single page', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: mockEmployees,
        pagination: {
          total: 5,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('第')).not.toBeInTheDocument();
      });
    });

    it('should go to next page', async () => {
      const user = userEvent.setup();

      employeeAPI.getEmployees.mockResolvedValue({
        data: mockEmployees,
        pagination: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('第 1 / 5 页')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /下一页/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });

    it('should go to previous page', async () => {
      const user = userEvent.setup();

      employeeAPI.getEmployees.mockResolvedValue({
        data: mockEmployees,
        pagination: {
          total: 50,
          page: 2,
          limit: 10,
          totalPages: 5,
        },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('第 2 / 5 页')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /上一页/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it('should disable previous button on first page', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: mockEmployees,
        pagination: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /上一页/i });
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable next button on last page', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: mockEmployees,
        pagination: {
          total: 50,
          page: 5,
          limit: 10,
          totalPages: 5,
        },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /下一页/i });
        expect(nextButton).toBeDisabled();
      });
    });
  });

  describe('Actions', () => {
    it('should navigate to edit page when edit link clicked', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const editLinks = screen.getAllByText('编辑');
        expect(editLinks[0]).toHaveAttribute('href', '/hr/employees/emp-001');
      });
    });

    it('should navigate to history page when history link clicked', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const historyLinks = screen.getAllByText('历史');
        expect(historyLinks[0]).toHaveAttribute('href', '/hr/employees/emp-001/history');
      });
    });

    it('should open delete modal when delete button clicked', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('table-row-emp-001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('删除');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal-mock')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent('确认删除');
      });
    });

    it('should show employee name in delete modal', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除');
        user.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('确定要删除员工「John Doe」吗')).toBeInTheDocument();
      });
    });

    it('should close delete modal when cancel clicked', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除');
        user.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByTestId('modal-mock')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /取消/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal-mock')).not.toBeInTheDocument();
      });
    });

    it('should delete employee when confirm clicked', async () => {
      const user = userEvent.setup();

      employeeAPI.deleteEmployee.mockResolvedValue({});

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除');
        user.click(deleteButtons[0]);
      });

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /确定删除/i });
        user.click(confirmButton);
      });

      await waitFor(() => {
        expect(employeeAPI.deleteEmployee).toHaveBeenCalledWith('emp-001');
      });
    });

    it('should reload employees after deletion', async () => {
      const user = userEvent.setup();

      employeeAPI.deleteEmployee.mockResolvedValue({});

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      // Initial load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Open delete modal
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('删除');
        user.click(deleteButtons[0]);
      });

      // Confirm delete
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /确定删除/i });
        user.click(confirmButton);
      });

      // Verify reload was called
      await waitFor(() => {
        expect(employeeAPI.getEmployees).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Status Badges', () => {
    it('should show active status badge', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('在职')).toBeInTheDocument();
      });
    });

    it('should show inactive status badge', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: [
          {
            id: 'emp-003',
            employee_no: 'EMP003',
            name: 'Inactive Employee',
            department_name: 'Engineering',
            position_title: 'Engineer',
            role: 'employee',
            status: 'inactive',
            hire_date: '2020-01-01',
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('离职')).toBeInTheDocument();
      });
    });
  });

  describe('Role Badges', () => {
    it('should show employee role badge', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('员工')).toBeInTheDocument();
      });
    });

    it('should show manager role badge', async () => {
      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('经理')).toBeInTheDocument();
      });
    });

    it('should show HR role badge', async () => {
      employeeAPI.getEmployees.mockResolvedValue({
        data: [
          {
            id: 'emp-004',
            employee_no: 'EMP004',
            name: 'HR Admin',
            department_name: 'HR',
            position_title: 'HR Manager',
            role: 'hr',
            status: 'active',
            hire_date: '2021-01-01',
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('HR')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when employees loading fails', async () => {
      employeeAPI.getEmployees.mockRejectedValueOnce(new Error('加载失败'));

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should show error message when departments loading fails', async () => {
      departmentAPI.getDepartments.mockRejectedValueOnce(new Error('加载失败'));

      render(
        <BrowserRouter>
          <HREmployeesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });
});
