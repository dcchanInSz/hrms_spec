/**
 * Frontend Test Setup
 * Configuration for Vitest and React Testing Library
 */

import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  create: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

// Mock useAuth hook
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUser = null;

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    user: mockUser,
    loading: false,
  }),
}));

// Helper function to render with router
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test', route);
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

// Re-export testing utilities
export { render, screen, fireEvent, waitFor, React };
