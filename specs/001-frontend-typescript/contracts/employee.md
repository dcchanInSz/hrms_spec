# API Contracts: Employee Management

**Date**: 2026-01-15
**Feature**: Convert Frontend to TypeScript
**Branch**: 001-frontend-typescript

## Overview

本文档定义了 HRMS 系统中员工管理相关的 API 契约。

---

## Base Types

```typescript
/**
 * 员工状态
 */
type EmployeeStatus = 'active' | 'inactive' | 'terminated';

/**
 * 员工信息
 */
interface Employee {
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
  status: EmployeeStatus;
  address?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 员工表单数据
 */
interface EmployeeFormData {
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
 * 分页参数
 */
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * 分页响应
 */
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 通用 API 响应
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
```

---

## 1. Get My Profile

### GET /api/employees/me

**Purpose**: 获取当前员工自己的资料信息

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface EmployeeResponse {
  success: true;
  data: Employee;
}
```

---

## 2. Update My Profile

### PUT /api/employees/me

**Purpose**: 更新当前员工的个人资料

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
}
```

**Success Response** (200 OK):
```typescript
interface UpdateEmployeeResponse {
  success: true;
  data: Employee;
  message: "资料更新成功";
}
```

---

## 3. Get Team Members

### GET /api/teams/members

**Purpose**: 获取团队成员列表

**Headers**:
- Authorization: Bearer {token}

**Query Parameters**:
- `managerId` (optional): 经理ID，不传则获取当前用户的团队

**Success Response** (200 OK):
```typescript
interface TeamMembersResponse {
  success: true;
  data: Employee[];
}
```

---

## 4. Get All Employees (HR Only)

### GET /api/admin/employees

**Purpose**: 获取所有员工列表（仅HR可访问）

**Headers**:
- Authorization: Bearer {token}

**Query Parameters**:
- `page`: 页码（从1开始）
- `pageSize`: 每页数量
- `sortBy`: 排序字段
- `sortOrder`: 排序方向（asc/desc）
- `search`: 搜索关键词（搜索姓名、邮箱、工号）

**Success Response** (200 OK):
```typescript
interface EmployeesListResponse {
  success: true;
  data: {
    items: Employee[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

---

## 5. Get Single Employee (HR Only)

### GET /api/admin/employees/{id}

**Purpose**: 获取指定员工详细信息（仅HR可访问）

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface EmployeeDetailResponse {
  success: true;
  data: Employee;
}
```

---

## 6. Create Employee (HR Only)

### POST /api/admin/employees

**Purpose**: 创建新员工（仅HR可访问）

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface CreateEmployeeRequest extends EmployeeFormData {
  // 继承所有可选字段
}
```

**Success Response** (201 Created):
```typescript
interface CreateEmployeeResponse {
  success: true;
  data: Employee;
  message: "员工创建成功";
}
```

**Error Response** (409 Conflict):
```typescript
interface CreateEmployeeErrorResponse {
  success: false;
  data: null;
  message: "邮箱或工号已存在";
  errors: {
    email?: string[];
    employeeId?: string[];
  };
}
```

---

## 7. Update Employee (HR Only)

### PUT /api/admin/employees/{id}

**Purpose**: 更新员工信息（仅HR可访问）

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface UpdateEmployeeRequest extends Partial<EmployeeFormData> {
  status?: EmployeeStatus;
}
```

**Success Response** (200 OK):
```typescript
interface UpdateEmployeeResponse {
  success: true;
  data: Employee;
  message: "员工信息更新成功";
}
```

---

## 8. Delete Employee (HR Only)

### DELETE /api/admin/employees/{id}

**Purpose**: 删除员工（仅HR可访问）

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface DeleteEmployeeResponse {
  success: true;
  data: null;
  message: "员工删除成功";
}
```

**Error Response** (400 Bad Request):
```typescript
interface DeleteEmployeeErrorResponse {
  success: false;
  data: null;
  message: "无法删除在职员工，请先办理离职手续";
}
```

---

## Validation Rules

### Create Employee Validation

| Field | Rules |
|-------|-------|
| firstName | 必填，1-50字符 |
| lastName | 必填，1-50字符 |
| email | 必填，邮箱格式，唯一 |
| phoneNumber | 可选，手机号格式 |
| dateOfBirth | 可选，日期格式，不能是未来日期 |
| hireDate | 必填，日期格式 |
| departmentId | 必填，整数 |
| positionId | 必填，整数 |
| managerId | 可选，整数 |
| salary | 可选，正数 |

### Update Employee Validation

| Field | Rules |
|-------|-------|
| firstName | 可选，1-50字符 |
| lastName | 可选，1-50字符 |
| email | 可选，邮箱格式，唯一 |
| phoneNumber | 可选，手机号格式 |
| address | 可选，1-200字符 |
| emergencyContact | 可选，1-100字符 |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | 验证失败 | 请求参数验证错误 |
| 401 | 未授权 | 令牌无效 |
| 403 | 禁止访问 | 没有权限（仅HR可访问） |
| 404 | 员工不存在 | 指定ID的员工不存在 |
| 409 | 邮箱已存在 | 邮箱或工号重复 |

---

## Implementation Notes

1. **权限控制**:
   - 所有 `/api/admin/employees/*` 端点仅HR可访问
   - `/api/employees/me` 和 `/api/employees/me` 仅员工本人可访问
   - `/api/teams/members` 可被经理和HR访问

2. **数据过滤**:
   - 搜索功能支持姓名、邮箱、工号模糊匹配
   - 分页参数默认为 page=1, pageSize=10

3. **状态管理**:
   - active: 在职员工
   - inactive: 暂时停职
   - terminated: 已离职

---

## Testing

### Test Cases

1. **获取员工列表**
   - HR可以查看所有员工
   - 支持分页、搜索、排序

2. **创建员工**
   - 验证必填字段
   - 验证邮箱唯一性
   - 验证工号唯一性

3. **更新员工**
   - 验证员工存在
   - 验证邮箱唯一性（排除当前员工）

4. **删除员工**
   - 验证员工存在
   - 不能删除在职员工

---

## Related Documentation

- [Auth API Contracts](./auth.md)
- [Department API Contracts](./department.md)
- [Data Model](../data-model.md)
