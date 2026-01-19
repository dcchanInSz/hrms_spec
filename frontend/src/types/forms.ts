/**
 * Form Types for HRMS Frontend
 *
 * This file contains all form-related type definitions including
 * generic form state, validation rules, and specific form data types.
 */

import { EmployeeFormData, LeaveRequestFormData, DepartmentFormData, PositionFormData } from './entities';

/**
 * Form Field Type
 */
export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form State
 */
export interface FormState<T> {
  fields: Record<keyof T, FormField>;
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<keyof T, string | undefined>;
}

/**
 * Validation Rule
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

/**
 * Form Validation Rules
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

/**
 * Form Error Type
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Generic Form Data Type
 */
export type GenericFormData = Record<string, any>;

/**
 * Specific Form Types
 */

/**
 * Login Form
 */
export interface LoginForm {
  email: string;
  password: string;
}

/**
 * Change Password Form
 */
export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile Form
 */
export interface ProfileForm {
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * Department Form
 */
export type DepartmentForm = DepartmentFormData;

/**
 * Position Form
 */
export type PositionForm = PositionFormData;

/**
 * Employee Form
 */
export type EmployeeForm = EmployeeFormData;

/**
 * Leave Form
 */
export type LeaveForm = LeaveRequestFormData;

/**
 * Notification Form
 */
export interface NotificationForm {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

/**
 * Report Form
 */
export interface ReportForm {
  startDate: string;
  endDate: string;
  departmentId?: number;
  format: 'pdf' | 'csv' | 'xlsx';
}

/**
 * Search Form
 */
export interface SearchForm {
  query: string;
  filters: Record<string, any>;
}

/**
 * Filter Form
 */
export interface FilterForm {
  [key: string]: any;
}

/**
 * Pagination Form
 */
export interface PaginationForm {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Import Form
 */
export interface ImportForm {
  file: File;
  mapping: Record<string, string>;
}

/**
 * Export Form
 */
export interface ExportForm {
  format: 'pdf' | 'csv' | 'xlsx';
  fields: string[];
  filters?: Record<string, any>;
}

/**
 * Settings Form
 */
export interface SettingsForm {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

/**
 * Form Submission Result
 */
export interface FormSubmissionResult<T = any> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Form Props
 */
export interface FormProps<T = GenericFormData> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validationRules?: ValidationRules<T>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Form Field Props
 */
export interface FormFieldProps<T = GenericFormData> {
  name: keyof T;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: any }[];
  className?: string;
}

/**
 * Form Context Type
 */
export interface FormContextType<T = GenericFormData> {
  values: T;
  errors: FormErrors<T>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: keyof T, value: any) => void;
  setError: (name: keyof T, error: string) => void;
  setTouched: (name: keyof T, touched?: boolean) => void;
  validate: () => boolean;
  reset: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}
