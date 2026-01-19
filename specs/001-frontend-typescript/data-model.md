# Data Model: Frontend TypeScript Types

**Date**: 2026-01-15
**Feature**: Convert Frontend to TypeScript
**Branch**: 001-frontend-typescript

## Overview

本文档定义了 HRMS 前端应用中所有 TypeScript 类型定义，基于后端 API 契约和前端业务逻辑。这些类型将用于组件 props、API 响应、Context 状态等。

---

## 1. Core Entity Types

### User Entity
```typescript
/**
 * 用户基本信息
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  managerId?: number;
  managerName?: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户权限枚举
 */
export enum UserPermission {
  // Profile permissions
  ProfileRead = 'profile:read',
  ProfileWrite = 'profile:write',

  // Leave permissions
  LeaveCreate = 'leave:create',
  LeaveReadOwn = 'leave:read:own',
  LeaveApprove = 'leave:approve',
  LeaveReadTeam = 'leave:read:team',

  // Paystub permissions
  PayStubReadOwn = 'paystub:read:own',

  // Notification permissions
  NotificationReadOwn = 'notification:read:own',

  // Team permissions
  TeamRead = 'team:read',
}

/**
 * 用户角色权限映射
 */
export const ROLE_PERMISSIONS: Record<User['role'], UserPermission[]> = {
  employee: [
    UserPermission.ProfileRead,
    UserPermission.ProfileWrite,
    UserPermission.LeaveCreate,
    UserPermission.LeaveReadOwn,
    UserPermission.PayStubReadOwn,
    UserPermission.NotificationReadOwn,
  ],
  manager: [
    UserPermission.ProfileRead,
    UserPermission.ProfileWrite,
    UserPermission.LeaveCreate,
    UserPermission.LeaveReadOwn,
    UserPermission.LeaveApprove,
    UserPermission.LeaveReadTeam,
    UserPermission.PayStubReadOwn,
    UserPermission.TeamRead,
  ],
  hr: [
    // HR has all permissions
  ],
};
```

### Employee Entity
```typescript
/**
 * 员工详细信息
 */
export interface Employee {
  id: number;
  employeeId: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  hireDate: string;
  terminationDate?: string;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
  managerId?: number;
  managerName?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  address?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 员工创建/更新请求
 */
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  hireDate: string;
  departmentId: number;
  positionId: number;
  managerId?: number;
  salary?: number;
  address?: string;
  emergencyContact?: string;
}
```

### Leave Entity
```typescript
/**
 * 请假类型
 */
export enum LeaveType {
  Annual = 'annual',
  Sick = 'sick',
  Maternity = 'maternity',
  Paternity = 'paternity',
  Bereavement = 'bereavement',
  Personal = 'personal',
  Study = 'study',
  Unpaid = 'unpaid',
}

/**
 * 请假状态
 */
export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

/**
 * 请假记录
 */
export interface Leave {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 请假余额
 */
export interface LeaveBalance {
  leaveType: LeaveType;
  totalEntitled: number;
  used: number;
  pending: number;
  remaining: number;
  carryOver?: number;
}

/**
 * 请假政策
 */
export interface LeavePolicy {
  id: number;
  name: string;
  leaveType: LeaveType;
  maxDaysPerYear: number;
  maxConsecutiveDays?: number;
  minNoticePeriod?: number;
  requiresApproval: boolean;
  allowHalfDay: boolean;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 请假请求表单数据
 */
export interface LeaveRequestFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}
```

### Department Entity
```typescript
/**
 * 部门信息
 */
export interface Department {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  managerId?: number;
  managerName?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 部门表单数据
 */
export interface DepartmentFormData {
  name: string;
  description?: string;
  parentId?: number;
  managerId?: number;
}
```

### Position Entity
```typescript
/**
 * 职位信息
 */
export interface Position {
  id: number;
  title: string;
  description?: string;
  departmentId: number;
  departmentName: string;
  grade?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 职位表单数据
 */
export interface PositionFormData {
  title: string;
  description?: string;
  departmentId: number;
  grade?: string;
  salaryMin?: number;
  salaryMax?: number;
}
```

### PayStub Entity
```typescript
/**
 * 工资单
 */
export interface PayStub {
  id: number;
  employeeId: number;
  employeeName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  taxes: number;
  deductions: number;
  benefits?: number;
  overtime?: number;
  leaveDeductions?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 工资单明细
 */
export interface PayStubDetail {
  id: number;
  payStubId: number;
  description: string;
  amount: number;
  type: 'earning' | 'deduction';
  category: string;
}
```

### Notification Entity
```typescript
/**
 * 通知
 */
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}
```

---

## 2. API Response Types

### Generic API Response
```typescript
/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

### Auth API Types
```typescript
/**
 * 登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * 更新用户资料请求
 */
export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### Report API Types
```typescript
/**
 * HR 仪表盘数据
 */
export interface HRDashboard {
  totalEmployees: number;
  activeEmployees: number;
  departmentCount: number;
  pendingLeaveRequests: number;
  recentHires: Employee[];
  upcomingBirthdays: Employee[];
}

/**
 * 团队分析数据
 */
export interface TeamAnalytics {
  totalTeamMembers: number;
  pendingLeaveRequests: number;
  averageLeaveUtilization: number;
  teamLeaveDistribution: {
    leaveType: LeaveType;
    count: number;
  }[];
}

/**
 * 人数统计
 */
export interface HeadcountReport {
  total: number;
  byDepartment: {
    departmentId: number;
    departmentName: string;
    count: number;
  }[];
  byStatus: {
    status: Employee['status'];
    count: number;
  }[];
}

/**
 * 请假利用率
 */
export interface LeaveUtilizationReport {
  totalRequests: number;
  approvedRequests: number;
  utilizationByType: {
    leaveType: LeaveType;
    total: number;
    approved: number;
    percentage: number;
  }[];
}

/**
 * 报表导出参数
 */
export interface ReportExportParams {
  format: 'pdf' | 'csv' | 'xlsx';
  startDate?: string;
  endDate?: string;
  departmentId?: number;
}
```

### Audit Log Entity
```typescript
/**
 * 审计日志
 */
export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
```

### Organization Chart Types
```typescript
/**
 * 组织架构节点
 */
export interface OrgChartNode {
  id: number;
  name: string;
  title: string;
  department: string;
  managerId?: number;
  children: OrgChartNode[];
  level: number;
}

/**
 * 汇报链
 */
export interface ReportingChain {
  employeeId: number;
  chain: {
    employeeId: number;
    name: string;
    title: string;
    level: number;
  }[];
}

/**
 * 组织变更
 */
export interface OrgChange {
  id: number;
  employeeId: number;
  employeeName: string;
  changeType: 'promotion' | 'transfer' | 'department_change' | 'manager_change';
  oldValue: string;
  newValue: string;
  effectiveDate: string;
  approvedBy?: number;
  createdAt: string;
}
```

---

## 3. Component Props Types

### Generic Component Props
```typescript
/**
 * 通用按钮组件 Props
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
}

/**
 * 输入框组件 Props
 */
export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

/**
 * 选择框组件 Props
 */
export interface SelectProps<T = any> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: {
    label: string;
    value: T;
  }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

/**
 * 表格组件 Props
 */
export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  render?: (value: any, record: T, index: number) => React.ReactNode;
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
}

/**
 * 模态框组件 Props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

/**
 * 确认对话框 Props
 */
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}
```

### Page-Specific Props
```typescript
/**
 * 登录页面 Props
 */
export interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
}

/**
 * 员工列表页面 Props
 */
export interface EmployeeListPageProps {
  employees: Employee[];
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

/**
 * 请假申请表 Props
 */
export interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  onSubmit: (data: LeaveRequestFormData) => Promise<void>;
  loading?: boolean;
  balance?: LeaveBalance[];
}

/**
 * 员工表单 Props
 */
export interface EmployeeFormProps {
  employee?: Employee;
  mode: 'create' | 'edit';
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 经理审批页面 Props
 */
export interface LeaveApprovalPageProps {
  pendingRequests: Leave[];
  loading?: boolean;
  onApprove: (id: number, data?: any) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
}
```

---

## 4. Context Types

### AuthContext Type
```typescript
/**
 * 认证上下文类型
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  hasPermission: (permission: UserPermission) => boolean;
  hasRole: (roles: User['role'] | User['role'][]) => boolean;
  isAuthenticated: boolean;
}

/**
 * 认证状态
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  token: string | null;
}
```

### NotificationContext Type
```typescript
/**
 * 通知上下文类型
 */
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (params?: PaginationParams) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
}
```

---

## 5. Custom Hook Types

### useAuth Hook
```typescript
export type UseAuthReturn = AuthContextType;
```

### useApi Hook
```typescript
/**
 * API 调用状态
 */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * useApi Hook 返回类型
 */
export interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * useApi Hook 选项
 */
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}
```

### usePagination Hook
```typescript
/**
 * 分页 Hook 返回类型
 */
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
```

### useDebounce Hook
```typescript
/**
 * 防抖 Hook 类型
 */
export function useDebounce<T>(value: T, delay: number): T;
```

---

## 6. Form Types

### Generic Form State
```typescript
/**
 * 表单字段类型
 */
export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * 表单状态
 */
export interface FormState<T> {
  fields: Record<keyof T, FormField>;
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<keyof T, string | undefined>;
}

/**
 * 表单验证规则
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

/**
 * 表单验证规则集合
 */
export interface ValidationRules<T> {
  [K in keyof T]?: ValidationRule;
}
```

### Specific Form Types
```typescript
/**
 * 登录表单
 */
export interface LoginForm {
  email: string;
  password: string;
}

/**
 * 员工表单
 */
export type EmployeeForm = EmployeeFormData;

/**
 * 请假表单
 */
export type LeaveForm = LeaveRequestFormData;

/**
 * 部门表单
 */
export type DepartmentForm = DepartmentFormData;

/**
 * 职位表单
 */
export type PositionForm = PositionFormData;
```

---

## 7. Utility Types

### Common Utility Types
```typescript
/**
 * 选中的值类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 只读类型
 */
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * 分页项类型
 */
export type PaginatedItem<T> = T & {
  page: number;
  pageSize: number;
};

/**
 * API 错误类型
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * 响应类型
 */
export type ApiResponseType<T> = ApiResponse<T> | T;
```

---

## 8. Type Guards

### Generic Type Guards
```typescript
/**
 * 检查是否为员工
 */
export function isEmployee(value: any): value is Employee {
  return value && typeof value.id === 'number' && typeof value.email === 'string';
}

/**
 * 检查是否为请假记录
 */
export function isLeave(value: any): value is Leave {
  return value && typeof value.id === 'number' && typeof value.leaveType === 'string';
}

/**
 * 检查是否为部门
 */
export function isDepartment(value: any): value is Department {
  return value && typeof value.id === 'number' && typeof value.name === 'string';
}
```

---

## 9. Constants and Enums

### Application Constants
```typescript
/**
 * 应用常量
 */
export const APP_CONSTANTS = {
  // 分页默认设置
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // 日期格式
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

  // 文件上传
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],

  // 角色
  ROLES: {
    EMPLOYEE: 'employee',
    MANAGER: 'manager',
    HR: 'hr',
  } as const,

  // 请假状态
  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  } as const,
};
```

---

## Summary

本文档定义了 HRMS 前端应用中所有需要的 TypeScript 类型，包括：

1. **核心实体类型**: User, Employee, Leave, Department, Position, PayStub, Notification
2. **API 响应类型**: 通用响应、分页响应、认证响应
3. **组件 Props 类型**: 通用组件和特定页面组件的 props
4. **Context 类型**: 认证和通知上下文的类型定义
5. **自定义 Hook 类型**: useAuth, useApi, usePagination 等
6. **表单类型**: 各种表单的数据结构
7. **工具类型**: 实用工具类型和类型守卫
8. **常量**: 应用中使用的常量和枚举

这些类型定义将确保代码的类型安全性和开发体验。
