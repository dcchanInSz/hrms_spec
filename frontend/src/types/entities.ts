/**
 * Core Entity Types for HRMS Frontend
 *
 * This file contains all the core entity type definitions based on the
 * backend API contracts and business logic.
 */

/**
 * User basic information
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
 * User permissions enum
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
 * User role permissions mapping
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

/**
 * Employee detailed information
 */
export interface Employee {
  id: number;
  employeeId: string;
  userId: number;
  firstName: string;
  lastName: string;
  name: string;
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
 * Employee create/update request
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

/**
 * Leave types enum
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
 * Leave status enum
 */
export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

/**
 * Leave record
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
  departmentName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Leave balance
 */
export interface LeaveBalance {
  type?: LeaveType;
  leaveType: LeaveType;
  totalEntitled: number;
  total: number;
  used: number;
  pending: number;
  remaining: number;
  available: number;
  carryOver?: number;
}

/**
 * Leave policy
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
 * Leave request form data
 */
export interface LeaveRequestFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

/**
 * Department information
 */
export interface Department {
  id: number;
  code?: string;
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  managerId?: number;
  managerName?: string;
  employeeCount?: number;
  sortOrder?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Department form data
 */
export interface DepartmentFormData {
  name: string;
  description?: string;
  parentId?: number;
  managerId?: number;
}

/**
 * Position information
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
 * Position form data
 */
export interface PositionFormData {
  title: string;
  description?: string;
  departmentId: number;
  grade?: string;
  salaryMin?: number;
  salaryMax?: number;
}

/**
 * PayStub entity
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
 * PayStub details
 */
export interface PayStubDetail {
  id: number;
  payStubId: number;
  description: string;
  amount: number;
  type: 'earning' | 'deduction';
  category: string;
}

/**
 * Notification entity
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
 * Notification type enum
 */
export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}
