/**
 * API Response Types for HRMS Frontend
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
}

export interface AuthResponse {
  token: string;
  user: any;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface HRDashboard {
  totalEmployees: number;
  activeEmployees: number;
  departmentCount: number;
  pendingLeaveRequests: number;
  recentHires: any[];
  upcomingBirthdays: any[];
}

export interface TeamAnalytics {
  totalTeamMembers: number;
  pendingLeaveRequests: number;
  averageLeaveUtilization: number;
  teamLeaveDistribution: {
    leaveType: string;
    count: number;
  }[];
}

export interface HeadcountReport {
  total: number;
  byDepartment: {
    departmentId: number;
    departmentName: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
}

export interface LeaveUtilizationReport {
  totalRequests: number;
  approvedRequests: number;
  utilizationByType: {
    leaveType: string;
    total: number;
    approved: number;
    percentage: number;
  }[];
}

export interface ReportExportParams {
  format: 'pdf' | 'csv' | 'xlsx';
  startDate?: string;
  endDate?: string;
  departmentId?: number;
}

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

export interface OrgChartNode {
  id: number;
  name: string;
  title: string;
  department: string;
  managerId?: number;
  children: OrgChartNode[];
  level: number;
}

export interface ReportingChain {
  employeeId: number;
  chain: {
    employeeId: number;
    name: string;
    title: string;
    level: number;
  }[];
}

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

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponseType<T> = ApiResponse<T> | T;
