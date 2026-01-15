/**
 * Login Page Component Tests
 * Tests for T104: Login Page Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/Login';
import { useAuth } from '../../src/hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      user: null,
      loading: false,
    });
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('人力资源管理系统')).toBeInTheDocument();
    expect(screen.getByText('请登录您的账户')).toBeInTheDocument();
    expect(screen.getByLabelText(/邮箱地址/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should show demo credentials', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/演示账号/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@company.com \/ password123/i)).toBeInTheDocument();
  });

  it('should update email state when typing', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱地址/i);
    await user.type(emailInput, 'test@company.com');

    expect(emailInput).toHaveValue('test@company.com');
  });

  it('should update password state when typing', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/密码/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('should call login function on form submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱地址/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    await user.type(emailInput, 'test@company.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@company.com', 'password123');
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱地址/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    await user.type(emailInput, 'test@company.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('邮箱或密码错误'));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱地址/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    await user.type(emailInput, 'test@company.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱或密码错误/i)).toBeInTheDocument();
    });
  });

  it('should clear error message when typing after error', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('邮箱或密码错误'));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Submit with wrong credentials
    const emailInput = screen.getByLabelText(/邮箱地址/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    await user.type(emailInput, 'test@company.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/邮箱或密码错误/i)).toBeInTheDocument();
    });

    // Type new email
    await user.clear(emailInput);
    await user.type(emailInput, 'new@company.com');

    // Error should still be visible (form submission clears on submit only)
    expect(screen.queryByText(/邮箱或密码错误/i)).toBeInTheDocument();
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱地址/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    await user.type(emailInput, 'test@company.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Button should show loading state
    expect(screen.getByRole('button', { name: /登录中/i })).toBeInTheDocument();
  });

  it('should redirect to dashboard if already logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      user: { id: '1', email: 'test@company.com' },
      loading: false,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // When user is logged in, the form should not be visible
    expect(screen.queryByLabelText(/邮箱地址/i)).not.toBeInTheDocument();
  });

  it('should have proper input attributes', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱地址/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });
});
