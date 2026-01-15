// src/types/models/index.ts
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee extends BaseModel {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  employmentStatus: 'active' | 'inactive' | 'terminated';
  salary?: number;
  managerId?: string;
}

export interface Department extends BaseModel {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  employeeCount: number;
}

export interface Position extends BaseModel {
  title: string;
  level: number;
  departmentId: string;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface LeaveRequest extends BaseModel {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  approverId?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface LeavePolicy extends BaseModel {
  name: string;
  leaveType: string;
  annualAllowance: number;
  carryOverAllowed: boolean;
  maxCarryOver?: number;
  isActive: boolean;
}

export interface LeaveBalance extends BaseModel {
  employeeId: string;
  leaveTypeId: string;
  balance: number;
  used: number;
  carriedOver?: number;
}

export interface PayStub extends BaseModel {
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  grossPay: number;
  netPay: number;
  deductions: Deduction[];
  taxes: Tax[];
  payDate: Date;
}

export interface Deduction {
  name: string;
  amount: number;
}

export interface Tax {
  name: string;
  rate: number;
  amount: number;
}

export interface AuditLog extends BaseModel {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
}

export interface Notification extends BaseModel {
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}
