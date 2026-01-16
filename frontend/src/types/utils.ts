/**
 * Utility Types for HRMS Frontend
 */

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = Omit<T, K> & Pick<T, K>;
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
export type PaginatedItem<T> = T & {
  page: number;
  pageSize: number;
};
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export function isEmployee(value: any): value is any {
  return value && typeof value.id === 'number' && typeof value.email === 'string';
}

export function isLeave(value: any): value is any {
  return value && typeof value.id === 'number' && typeof value.leaveType === 'string';
}

export function isDepartment(value: any): value is any {
  return value && typeof value.id === 'number' && typeof value.name === 'string';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (isString(value) || isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  TIME_FORMAT: 'HH:mm:ss',
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ROLES: {
    EMPLOYEE: 'employee',
    MANAGER: 'manager',
    HR: 'hr',
  } as const,
  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  } as const,
  LEAVE_TYPES: {
    ANNUAL: 'annual',
    SICK: 'sick',
    MATERNITY: 'maternity',
    PATERNITY: 'paternity',
    BEREAVEMENT: 'bereavement',
    PERSONAL: 'personal',
    STUDY: 'study',
    UNPAID: 'unpaid',
  } as const,
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  } as const,
  EXPORT_FORMATS: {
    CSV: 'csv',
    PDF: 'pdf',
    XLSX: 'xlsx',
  } as const,
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  } as const,
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s-()]+$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
  } as const,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password',
  },
  EMPLOYEES: {
    BASE: '/employees',
    ME: '/employees/me',
    TEAM: '/teams/members',
    ADMIN: '/admin/employees',
  },
  LEAVES: {
    BASE: '/leaves',
    TYPES: '/leaves/types',
    BALANCES: '/leaves/balances',
    POLICIES: '/leaves/policies',
    PENDING: '/leaves/pending',
    TEAM: '/leaves/team',
    ADMIN: '/admin/leaves',
    ROLLOVER: '/leaves/year-end-rollover',
  },
  PAYSTUBS: {
    BASE: '/paystubs',
    ADMIN: '/admin/paystubs',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ_ALL: '/notifications/read-all',
  },
  DEPARTMENTS: {
    BASE: '/admin/departments',
  },
  POSITIONS: {
    BASE: '/admin/positions',
  },
  REPORTS: {
    HR_DASHBOARD: '/reports/hr-dashboard',
    TEAM_ANALYTICS: '/reports/team-analytics',
    HEADCOUNT: '/reports/headcount',
    LEAVE_UTILIZATION: '/reports/leave-utilization',
    EXPORT: '/reports/export',
  },
  AUDIT: {
    BASE: '/admin/audit-logs',
  },
  ORG: {
    CHART: '/org/chart',
    REPORTING_CHAIN: '/org/reporting-chain',
    EMPLOYEES: '/org/employees',
    STATISTICS: '/org/statistics',
    SEARCH: '/org/search',
    CHANGES: '/org/changes',
    EXPORT: '/org/export',
  },
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MY_LEAVES: '/my-leaves',
  LEAVE_REQUEST: '/leave/request',
  LEAVE_POLICIES: '/leave/policies',
  LEAVE_BALANCE: '/leave/balance',
  PAYSTUBS: '/paystubs',
  NOTIFICATIONS: '/notifications',
  MANAGER: {
    BASE: '/manager',
    DASHBOARD: '/manager/dashboard',
    TEAM: '/manager/team',
    APPROVALS: '/manager/approvals',
    CALENDAR: '/manager/calendar',
  },
  HR: {
    BASE: '/hr',
    EMPLOYEES: '/hr/employees',
    EMPLOYEE_NEW: '/hr/employees/new',
    EMPLOYEE_EDIT: '/hr/employees/:id/edit',
    DEPARTMENTS: '/hr/departments',
    ORG_CHART: '/hr/org-chart',
    AUDIT_LOGS: '/hr/audit-logs',
    REPORTS: '/hr/reports',
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_PREFERENCES: 'table_preferences',
} as const;

export const EVENTS = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  LEAVE_REQUESTED: 'leave:requested',
  LEAVE_APPROVED: 'leave:approved',
  LEAVE_REJECTED: 'leave:rejected',
  EMPLOYEE_CREATED: 'employee:created',
  EMPLOYEE_UPDATED: 'employee:updated',
  EMPLOYEE_DELETED: 'employee:deleted',
} as const;

export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export type Nullable<T> = T | null;
export type Emptyable<T> = T | null | undefined;
export type ArrayItem<T> = T extends Array<infer U> ? U : never;
export type PromiseType<T> = T extends Promise<infer U> ? U : never;
export type FunctionType<T extends (...args: any) => any = (...args: any) => any> = T;

export type ComponentProps<T extends React.ComponentType<any>> = React.ComponentPropsWithoutRef<T>;
export type ComponentRef<T extends React.ComponentType<any>> = React.Ref<React.ElementRef<T>>;

export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type ClickEvent = React.MouseEvent<HTMLElement>;
export type SubmitEvent = React.FormEvent<HTMLFormElement>;
export type FocusEvent = React.FocusEvent<HTMLElement>;
