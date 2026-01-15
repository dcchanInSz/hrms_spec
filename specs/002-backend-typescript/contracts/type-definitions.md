# Type Definitions Contract

**Version**: 1.0
**Created**: 2026-01-15
**Feature**: Convert Backend to TypeScript

## Overview

This contract defines the type definitions required for all external dependencies and internal modules in the TypeScript backend.

## Required Type Packages

### Core Dependencies

```json
{
  "typescript": "^5.3.3",
  "@types/node": "^20.10.6"
}
```

### Express Framework

```json
{
  "@types/express": "^4.17.21"
}
```

**Type Definitions**:
- `Express.Application`
- `Express.Request`
- `Express.Response`
- `Express.NextFunction`
- `Express.Router`
- `RequestHandler`
- `ErrorRequestHandler`

**Custom Extensions**:
```typescript
// Extend Express Request with custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        department?: string;
      };
      tenantId?: string;
      auditLog?: {
        action: string;
        resource: string;
        resourceId?: string;
        userId: string;
        timestamp: Date;
      };
    }
  }
}
```

### Database (PostgreSQL)

```json
{
  "@types/pg": "^8.10.9"
}
```

**Type Definitions**:
- `Client` - PostgreSQL client
- `Pool` - Connection pool
- `QueryResult` - Query result interface
- `QueryConfig` - Query configuration

**Custom Types**:
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  fields: FieldInfo[];
}

interface FieldInfo {
  name: string;
  dataTypeID: number;
}
```

### Authentication (JWT)

```json
{
  "@types/jsonwebtoken": "^9.0.5"
}
```

**Type Definitions**:
- `JwtPayload`
- `Secret`
- `SignOptions`
- `VerifyOptions`

**Custom JWT Types**:
```typescript
interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  departmentId?: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

interface JWTConfig {
  secret: string;
  expiresIn: string | number;
  algorithm?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### Security (Bcrypt)

```json
{
  "@types/bcrypt": "^5.0.2"
}
```

**Type Definitions**:
- `hash` - Synchronous hashing
- `hashSync` - Synchronous hash
- `compare` - Compare hash
- `compareSync` - Synchronous compare
- `genSalt` - Generate salt
- `genSaltSync` - Synchronous salt generation

### CORS

```json
{
  "@types/cors": "^2.8.17"
}
```

**Type Definitions**:
- `CorsOptions` - CORS configuration
- `CorsRequest` - CORS-enabled request

### UUID

```json
{
  "@types/uuid": "^9.0.7"
}
```

**Type Definitions**:
- `v1` - Version 1 UUID
- `v4` - Version 4 UUID
- `v5` - Version 5 UUID
- `parse` - Parse UUID string
- `unparse` - Convert UUID to string

### Environment Variables

```json
{
  "@types/dotenv": "^8.2.0"
}
```

**Type Definitions**:
- `config` - Load environment variables
- `parse` - Parse string

**Custom Env Types**:
```typescript
interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}
```

### Testing

```json
{
  "@types/jest": "^29.5.11",
  "@types/supertest": "^2.0.16",
  "ts-jest": "^29.1.1"
}
```

**Type Definitions**:
- `describe` - Test suite
- `test` - Test case
- `expect` - Assertions
- `beforeAll` - Setup before all tests
- `afterAll` - Cleanup after all tests
- `beforeEach` - Setup before each test
- `afterEach` - Cleanup after each test

**Custom Test Types**:
```typescript
interface TestSuite {
  name: string;
  tests: TestCase[];
  setup?: () => void;
  teardown?: () => void;
}

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
  timeout?: number;
  only?: boolean;
  skip?: boolean;
}

interface MockRepository<T> {
  findAll: () => Promise<T[]>;
  findById: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}
```

## Internal Module Types

### Models

```typescript
// Base Model Interface
interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Employee Model
interface Employee extends BaseModel {
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

// Department Model
interface Department extends BaseModel {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  employeeCount: number;
}

// Leave Request Model
interface LeaveRequest extends BaseModel {
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

// Position Model
interface Position extends BaseModel {
  title: string;
  level: number;
  departmentId: string;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
}

// Leave Policy Model
interface LeavePolicy extends BaseModel {
  name: string;
  leaveType: string;
  annualAllowance: number;
  carryOverAllowed: boolean;
  maxCarryOver?: number;
  isActive: boolean;
}

// Pay Stub Model
interface PayStub extends BaseModel {
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  grossPay: number;
  netPay: number;
  deductions: Deduction[];
  taxes: Tax[];
  payDate: Date;
}

// Audit Log Model
interface AuditLog extends BaseModel {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
}

// Notification Model
interface Notification extends BaseModel {
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}
```

### Services

```typescript
// Base Service Interface
interface BaseService<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDto<T>): Promise<T>;
  update(id: string, data: UpdateDto<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Employee Service Types
interface EmployeeService extends BaseService<Employee> {
  findByEmail(email: string): Promise<Employee | null>;
  findByDepartment(departmentId: string): Promise<Employee[]>;
  findByManager(managerId: string): Promise<Employee[]>;
  getManagers(): Promise<Employee[]>;
  updateManager(employeeId: string, managerId: string): Promise<Employee>;
}

// Leave Service Types
interface LeaveService extends BaseService<LeaveRequest> {
  calculateLeaveDays(startDate: Date, endDate: Date): Promise<number>;
  checkLeaveBalance(employeeId: string, leaveTypeId: string): Promise<number>;
  approveLeave(requestId: string, approverId: string): Promise<LeaveRequest>;
  rejectLeave(requestId: string, approverId: string, reason: string): Promise<LeaveRequest>;
  getPendingApprovals(approverId: string): Promise<LeaveRequest[]>;
}

// Report Service Types
interface ReportService {
  generateEmployeeReport(filters: EmployeeReportFilters): Promise<EmployeeReport>;
  generateLeaveReport(filters: LeaveReportFilters): Promise<LeaveReport>;
  generatePayrollReport(period: DateRange): Promise<PayrollReport>;
  exportReport(format: 'csv' | 'pdf' | 'excel'): Promise<Buffer>;
}

// Audit Log Service Types
interface AuditLogService {
  log(action: string, resource: string, resourceId: string, userId: string, changes?: object): Promise<void>;
  findByResource(resource: string, resourceId: string): Promise<AuditLog[]>;
  findByUser(userId: string, limit?: number): Promise<AuditLog[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>;
}
```

### Middleware

```typescript
// Authentication Middleware
interface AuthMiddleware {
  authenticate: RequestHandler;
  authorize: (roles: string[]) => RequestHandler;
  optional: RequestHandler;
}

// Role-based Access Control
interface RoleMiddleware {
  hasRole: (role: string) => RequestHandler;
  hasPermission: (permission: string) => RequestHandler;
  hasAnyRole: (roles: string[]) => RequestHandler;
}

// Error Handling Middleware
interface ErrorHandlingMiddleware {
  notFound: RequestHandler;
  errorHandler: ErrorRequestHandler;
  asyncHandler: (fn: RequestHandler) => RequestHandler;
}

// Rate Limiting Middleware
interface RateLimitMiddleware {
  standard: RequestHandler;
  strict: RequestHandler;
  custom: (options: RateLimitOptions) => RequestHandler;
}

// Audit Middleware
interface AuditMiddleware {
  logAction: (action: string, resource: string) => RequestHandler;
  trackChanges: RequestHandler;
}
```

### Utils

```typescript
// Database Utils
interface DBUtils {
  createConnection(): Promise<Pool>;
  runQuery<T>(query: string, params?: any[]): Promise<QueryResult<T>>;
  transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
  closeConnection(): Promise<void>;
}

// JWT Utils
interface JWTUtils {
  generateToken(payload: UserPayload): string;
  verifyToken(token: string): UserPayload;
  decodeToken(token: string): UserPayload | null;
  refreshToken(token: string): string;
}

// Password Utils
interface PasswordUtils {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  validatePasswordStrength(password: string): PasswordValidation;
}

// Response Utils
interface ResponseUtils {
  success: (res: Response, data: any, message?: string) => Response;
  error: (res: Response, error: Error | string, status?: number) => Response;
  paginated: (res: Response, data: any[], total: number, page: number, limit: number) => Response;
}

// Pagination Utils
interface PaginationUtils {
  calculateOffset(page: number, limit: number): { offset: number; limit: number };
  getPaginationParams(query: any): { page: number; limit: number; offset: number };
  createMeta(total: number, page: number, limit: number): PaginationMeta;
}
```

## API Route Types

```typescript
// Authentication Routes
interface AuthRoutes {
  POST /auth/login: LoginRequest → { accessToken: string; user: User }
  POST /auth/register: RegisterRequest → { accessToken: string; user: User }
  POST /auth/refresh: RefreshTokenRequest → { accessToken: string }
  POST /auth/logout: LogoutRequest → { success: boolean }
  GET /auth/me: AuthenticatedRequest → User
}

// Employee Routes
interface EmployeeRoutes {
  GET /employees: AuthenticatedRequest → Employee[]
  GET /employees/:id: AuthenticatedRequest → Employee
  POST /employees: CreateEmployeeRequest → Employee
  PUT /employees/:id: UpdateEmployeeRequest → Employee
  DELETE /employees/:id: AuthenticatedRequest → { success: boolean }
  GET /employees/:id/team: AuthenticatedRequest → Employee[]
}

// Leave Routes
interface LeaveRoutes {
  GET /leaves/my: AuthenticatedRequest → LeaveRequest[]
  POST /leaves: CreateLeaveRequest → LeaveRequest
  PUT /leaves/:id: UpdateLeaveRequest → LeaveRequest
  DELETE /leaves/:id: AuthenticatedRequest → { success: boolean }
  GET /leaves/approvals/pending: ManagerRequest → LeaveRequest[]
  PUT /leaves/:id/approve: ManagerRequest → LeaveRequest
  PUT /leaves/:id/reject: ManagerRequest → LeaveRequest
}

// Department Routes
interface DepartmentRoutes {
  GET /departments: AuthenticatedRequest → Department[]
  GET /departments/:id: AuthenticatedRequest → Department
  POST /departments: AdminRequest → Department
  PUT /departments/:id: AdminRequest → Department
  DELETE /departments/:id: AdminRequest → { success: boolean }
  GET /departments/:id/employees: AuthenticatedRequest → Employee[]
}

// Reports Routes
interface ReportRoutes {
  GET /reports/employees: AuthenticatedRequest → EmployeeReport
  GET /reports/leaves: AuthenticatedRequest → LeaveReport
  GET /reports/payroll: AuthenticatedRequest → PayrollReport
  GET /reports/export: AuthenticatedRequest → Buffer
}

// Admin Routes
interface AdminRoutes {
  GET /admin/users: AdminRequest → User[]
  GET /admin/audit-logs: AdminRequest → AuditLog[]
  GET /admin/system-info: AdminRequest → SystemInfo
  POST /admin/backup: AdminRequest → { success: boolean; backupId: string }
}
```

## Validation Contract

### Model Validation

```typescript
// Required validation for all models
interface ValidationRules<T> {
  required: (keyof T)[];
  optional: (keyof T)[];
  types: Record<keyof T, 'string' | 'number' | 'date' | 'boolean' | 'object'>;
  constraints: Record<keyof T, (value: any) => boolean | string>;
}

// Employee validation example
const employeeValidation: ValidationRules<Employee> = {
  required: ['firstName', 'lastName', 'email', 'departmentId', 'positionId', 'hireDate'],
  optional: ['phoneNumber', 'salary', 'managerId'],
  types: {
    id: 'string',
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    phoneNumber: 'string',
    departmentId: 'string',
    positionId: 'string',
    hireDate: 'date',
    employmentStatus: 'string',
    salary: 'number',
    managerId: 'string',
    createdAt: 'date',
    updatedAt: 'date'
  },
  constraints: {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email format',
    employmentStatus: (value) => ['active', 'inactive', 'terminated'].includes(value) || 'Invalid status'
  }
};
```

### API Validation

```typescript
// Request validation
interface RequestValidation<T> {
  body?: ValidationRules<T>;
  query?: ValidationRules<T>;
  params?: ValidationRules<T>;
}

// Example: Leave request validation
const leaveRequestValidation: RequestValidation<LeaveRequest> = {
  body: {
    required: ['leaveTypeId', 'startDate', 'endDate', 'reason'],
    optional: [],
    types: {
      leaveTypeId: 'string',
      startDate: 'date',
      endDate: 'date',
      reason: 'string'
    },
    constraints: {
      endDate: (value, req) => {
        const start = new Date(req.body.startDate);
        const end = new Date(value);
        return end > start || 'End date must be after start date';
      }
    }
  }
};
```

## Error Types Contract

```typescript
// Application Error Classes
abstract class AppError extends Error {
  abstract statusCode: number;
  abstract isOperational: boolean;
  name: string;
  message: string;
  stack?: string;
}

class ValidationError extends AppError {
  statusCode = 400;
  isOperational = true;
  errors: Record<string, string[]>;
}

class NotFoundError extends AppError {
  statusCode = 404;
  isOperational = true;
}

class UnauthorizedError extends AppError {
  statusCode = 401;
  isOperational = true;
}

class ForbiddenError extends AppError {
  statusCode = 403;
  isOperational = true;
}

class ConflictError extends AppError {
  statusCode = 409;
  isOperational = true;
}

class DatabaseError extends AppError {
  statusCode = 500;
  isOperational = true;
  originalError?: Error;
}
```

## Testing Type Definitions

```typescript
// Mock Types
interface MockData<T> {
  valid: T;
  invalid: Partial<T>;
  create: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
  update: Partial<T>;
}

// Test Context
interface TestContext {
  database: {
    setup: () => Promise<void>;
    teardown: () => Promise<void>;
    seed: () => Promise<void>;
  };
  auth: {
    createUser: (role?: string) => Promise<string>;
    getToken: (userId: string) => string;
  };
  mocks: {
    [key: string]: jest.Mock;
  };
}

// Test Suite Configuration
interface TestSuiteConfig {
  timeout: number;
  setupFiles: string[];
  teardownFiles: string[];
  coverage: {
    threshold: {
      global: {
        branches: number;
        functions: number;
        lines: number;
        statements: number;
      };
    };
  };
}
```

---

**Contract Version**: 1.0
**Effective Date**: 2026-01-15
**Review Date**: After TypeScript migration completion
**Approved By**: Implementation Plan
