/**
 * RequestForm Page Component Tests
 * Tests for T105: RequestForm Page Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RequestFormPage from '../../src/pages/Leave/RequestForm';
import { leaveAPI } from '../../src/services/api';

// Mock the API
vi.mock('../../src/services/api', () => ({
  leaveAPI: {
    getLeaveTypes: vi.fn(),
    getBalance: vi.fn(),
    createRequest: vi.fn(),
  },
}));

describe('RequestFormPage', () => {
  const mockLeaveTypes = {
    data: [
      { value: 'annual', label: '年假' },
      { value: 'sick', label: '病假' },
      { value: 'personal', label: '事假' },
      { value: 'other', label: '其他' },
    ],
  };

  const mockBalances = {
    data: [
      { type: 'annual', total: 15, used: 5, available: 10 },
      { type: 'sick', total: 10, used: 1, available: 9 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    leaveAPI.getLeaveTypes.mockResolvedValue(mockLeaveTypes);
    leaveAPI.getBalance.mockResolvedValue(mockBalances);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render page title', async () => {
    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('申请请假')).toBeInTheDocument();
    });
  });

  it('should display leave balance table', async () => {
    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('当前余额')).toBeInTheDocument();
      expect(screen.getByText('年假')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', async () => {
    leaveAPI.getLeaveTypes.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    leaveAPI.getBalance.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display leave type select', async () => {
    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });
  });

  it('should display date inputs', async () => {
    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/开始日期/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/结束日期/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/请假天数/i)).toBeInTheDocument();
    });
  });

  it('should show available days when leave type selected', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/假期类型/i);
    await user.selectOptions(select, 'annual');

    await waitFor(() => {
      expect(screen.getByText(/可用天数:/i)).toBeInTheDocument();
      expect(screen.getByText(/10 天/i)).toBeInTheDocument();
    });
  });

  it('should calculate days excluding weekends', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/开始日期/i)).toBeInTheDocument();
    });

    // Select a Monday to Friday
    const startDate = screen.getByLabelText(/开始日期/i);
    const endDate = screen.getByLabelText(/结束日期/i);

    await user.type(startDate, '2024-01-08'); // Monday
    await user.type(endDate, '2024-01-12'); // Friday

    await waitFor(() => {
      expect(screen.getByLabelText(/请假天数/i)).toHaveValue('5');
    });
  });

  it('should show reason textarea', async () => {
    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/请假原因/i)).toBeInTheDocument();
    });
  });

  it('should submit form successfully', async () => {
    const user = userEvent.setup();
    leaveAPI.createRequest.mockResolvedValueOnce({ success: true });

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });

    // Fill out the form
    await user.selectOptions(screen.getByLabelText(/假期类型/i), 'annual');
    await user.type(screen.getByLabelText(/开始日期/i), '2024-02-01');
    await user.type(screen.getByLabelText(/结束日期/i), '2024-02-03');
    await user.type(screen.getByLabelText(/请假天数/i), '3');
    await user.type(screen.getByLabelText(/请假原因/i), 'Family trip');

    // Submit
    await user.click(screen.getByRole('button', { name: /提交申请/i }));

    await waitFor(() => {
      expect(leaveAPI.createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          leave_type: 'annual',
          start_date: '2024-02-01',
          end_date: '2024-02-03',
          days: '3',
          reason: 'Family trip',
        })
      );
    });
  });

  it('should show success message on successful submission', async () => {
    const user = userEvent.setup();
    leaveAPI.createRequest.mockResolvedValueOnce({ success: true });
    leaveAPI.getBalance.mockResolvedValueOnce({
      data: [
        { type: 'annual', total: 15, used: 8, available: 7 },
      ],
    });

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/假期类型/i), 'annual');
    await user.type(screen.getByLabelText(/开始日期/i), '2024-02-01');
    await user.type(screen.getByLabelText(/结束日期/i), '2024-02-03');
    await user.type(screen.getByLabelText(/请假天数/i), '3');
    await user.click(screen.getByRole('button', { name: /提交申请/i }));

    await waitFor(() => {
      expect(screen.getByText(/请假申请已提交成功/i)).toBeInTheDocument();
    });
  });

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup();
    leaveAPI.createRequest.mockRejectedValueOnce(new Error('提交失败，请重试'));

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/假期类型/i), 'annual');
    await user.type(screen.getByLabelText(/开始日期/i), '2024-02-01');
    await user.type(screen.getByLabelText(/结束日期/i), '2024-02-03');
    await user.click(screen.getByRole('button', { name: /提交申请/i }));

    await waitFor(() => {
      expect(screen.getByText(/提交失败，请重试/i)).toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    leaveAPI.createRequest.mockResolvedValueOnce({ success: true });
    leaveAPI.getBalance.mockResolvedValueOnce({
      data: [
        { type: 'annual', total: 15, used: 5, available: 10 },
      ],
    });

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });

    // Fill form
    await user.selectOptions(screen.getByLabelText(/假期类型/i), 'annual');
    await user.type(screen.getByLabelText(/开始日期/i), '2024-02-01');

    // Submit
    await user.click(screen.getByRole('button', { name: /提交申请/i }));

    await waitFor(() => {
      expect(screen.getByText(/请假申请已提交成功/i)).toBeInTheDocument();
    });

    // Form should be cleared (select should be reset)
    const select = screen.getByLabelText(/假期类型/i);
    expect(select).toHaveValue('');
  });

  it('should have reset button', async () => {
    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /重置/i })).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    leaveAPI.createRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <RequestFormPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/假期类型/i)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/假期类型/i), 'annual');
    await user.type(screen.getByLabelText(/开始日期/i), '2024-02-01');
    await user.type(screen.getByLabelText(/结束日期/i), '2024-02-03');

    // Submit
    await user.click(screen.getByRole('button', { name: /提交申请/i }));

    // Should show loading
    expect(screen.getByRole('button', { name: /提交中/i })).toBeInTheDocument();
  });
});
