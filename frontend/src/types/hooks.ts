/**
 * Custom Hook Types for HRMS Frontend
 */

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface UsePaginationReturn {
  current: number;
  pageSize: number;
  total: number;
  setCurrent: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotal: (total: number) => void;
  next: () => void;
  prev: () => void;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<keyof T, string>;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  setValues: (values: T) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
}

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export interface UseConfirmReturn {
  confirm: () => Promise<boolean>;
  withOptions: (options: UseConfirmOptions) => Promise<boolean>;
}

export interface UsePermissionOptions {
  required?: string | string[];
  onDenied?: () => void;
}

export interface UsePermissionReturn {
  hasPermission: (permission: string | string[]) => boolean;
  canAccess: boolean;
}

export interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
}

export interface UseSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  filtered: T[];
  isSearching: boolean;
}

export interface UseTableOptions<T> {
  data: T[];
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface UseTableReturn<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  total: number;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  filters: Record<string, any>;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (field: keyof T, order: 'asc' | 'desc') => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  nextPage: () => void;
  prevPage: () => void;
}

export interface UseClickOutsideReturn {
  ref: (node: HTMLElement | null) => void;
}

export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setValue: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
}

export interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncReturn<T> extends ApiState<T> {
  execute: () => Promise<T | undefined>;
}

export interface UseDocumentTitleOptions {
  restoreOnUnmount?: boolean;
}

export interface UseDocumentTitleReturn {
  setDocumentTitle: (title: string) => void;
}
