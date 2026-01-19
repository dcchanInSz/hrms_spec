/**
 * Manager Dashboard Page Component Tests
 * Tests for T142: Team Dashboard Page Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ManagerDashboardPage from '../../src/pages/Manager/Dashboard';
import { teamAPI } from '../../src/services/api';

// Mock the API
vi.mock('../../src/services/api', () => ({
  teamAPI: {
    getDashboard: vi.fn(),
  },
}));

// Mock useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'mgr-001',
      name: 'Manager Smith',
      role: 'manager',
    },
  }),
}));

describe('ManagerDashboardPage', () => {
  const mockDashboardData = {
    data: {
      teamSize: 5,
      teamMembers: [],
      pendingApprovals: [
        {
          id: 'leave-001',
          employee_name: 'John Doe',
          leave_type: 'annual',
          start_date: '2024-02-01',
          end_date: '2024-02-03',
          days: 3,
          reason: 'Family trip',
        },
      ],
      leaveStats: {
        pending_count: 2,
        approved_count: 10,
        rejected_count: 1,
        approved_days: 25,
      },
      todayLeaves: [
        {
          id: 'leave-002',
          employee_name: 'Jane Smith',
          leave_type: 'sick',
          start_date: '2024-01-15',
          end_date: '2024-01-15',
        },
      ],
      analytics: {
        total_approved: '10',
        total_days: '25',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    teamAPI.getDashboard.mockResolvedValue(mockDashboardData);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render page title', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('团队仪表盘')).toBeInTheDocument();
    });
  });

  it('should display welcome message with manager name', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('欢迎您，Manager Smith')).toBeInTheDocument();
      expect(screen.getByText('当前管理团队人数：5 人')).toBeInTheDocument();
    });
  });

  it('should display team size stat card', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('团队人数')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should display pending approvals stat card', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('待审批')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should display approved count stat card', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('已批准')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should display used days stat card', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('已使用天数')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('should display pending approvals list', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('待审批请假')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('2024-02-01 至 2024-02-03')).toBeInTheDocument();
      expect(screen.getByText('3天')).toBeInTheDocument();
      expect(screen.getByText('Family trip')).toBeInTheDocument();
    });
  });

  it('should display today leaves list', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('今日请假人员')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should show empty state when no pending approvals', async () => {
    teamAPI.getDashboard.mockResolvedValueOnce({
      data: {
        teamSize: 3,
        pendingApprovals: [],
        todayLeaves: [],
        leaveStats: {
          pending_count: 0,
          approved_count: 0,
          rejected_count: 0,
          approved_days: 0,
        },
      },
    });

    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('暂无待审批的请假申请')).toBeInTheDocument();
    });
  });

  it('should show empty state when no one is on leave today', async () => {
    teamAPI.getDashboard.mockResolvedValueOnce({
      data: {
        teamSize: 5,
        pendingApprovals: [],
        todayLeaves: [],
        leaveStats: {
          pending_count: 0,
          approved_count: 0,
          rejected_count: 0,
          approved_days: 0,
        },
      },
    });

    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('今天没有人请假')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', async () => {
    teamAPI.getDashboard.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error message on fetch failure', async () => {
    teamAPI.getDashboard.mockRejectedValueOnce(new Error('获取数据失败'));

    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('获取仪表盘数据失败')).toBeInTheDocument();
    });
  });

  it('should have link to approvals page', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /查看全部/i });
      expect(link).toHaveAttribute('href', '/manager/approvals');
    });
  });

  it('should have quick action buttons', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /审批管理/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /团队成员/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /请假日历/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /团队报表/i })).toBeInTheDocument();
    });
  });

  it('should display leave type badge with correct color', async () => {
    render(
      <BrowserRouter>
        <ManagerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('年假')).toBeInTheDocument();
    });
  });
});
