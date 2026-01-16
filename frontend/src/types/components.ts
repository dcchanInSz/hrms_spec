/**
 * Component Props Types for HRMS Frontend
 */

import { ReactNode } from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: {
    label: string;
    value: string | number;
  }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export interface TextareaProps {
  label?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowClick?: (record: T) => void;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xl' | 'full';
  className?: string;
  showClose?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'secondary';
  loading?: boolean;
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export interface NotificationProps {
  notification: {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    link?: string;
  };
  onMarkAsRead?: (id: number) => void;
  onClick?: () => void;
  className?: string;
}

export interface ExportButtonProps {
  type: string;
  label?: string;
  format?: string;
  params?: Record<string, any>;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface BalanceCardProps {
  leaveType: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
  carryOver?: number;
  className?: string;
}

export interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
}

export interface EmployeeListPageProps {
  employees: any[];
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onCreateEmployee: () => void;
  onEditEmployee: (id: number) => void;
  onDeleteEmployee: (id: number) => void;
  onSearch: (query: string) => void;
}

export interface LeaveRequestFormProps {
  leaveTypes: string[];
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  balance?: any[];
}

export interface EmployeeFormProps {
  employee?: any;
  mode: 'create' | 'edit';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface LeaveApprovalPageProps {
  pendingRequests: any[];
  loading?: boolean;
  onApprove: (id: number, data?: any) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
}

export interface LayoutProps {
  children: ReactNode;
  user?: any;
  onLogout?: () => void;
  className?: string;
}

export interface DepartmentTreeProps {
  departments: any[];
  onSelect?: (department: any) => void;
  selectedId?: number;
  className?: string;
}
