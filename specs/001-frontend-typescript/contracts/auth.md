# API Contracts: Authentication

**Date**: 2026-01-15
**Feature**: Convert Frontend to TypeScript
**Branch**: 001-frontend-typescript

## Overview

本文档定义了 HRMS 系统中认证相关的 API 契约。所有请求和响应都使用 TypeScript 接口定义，确保前后端类型安全。

---

## Base Types

```typescript
/**
 * 基础 API 响应
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * 用户角色
 */
type UserRole = 'employee' | 'manager' | 'hr';

/**
 * 用户信息
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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
```

---

## 1. Login Endpoint

### POST /api/auth/login

**Purpose**: 用户登录获取认证令牌

**Request**:
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Example Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200 OK):
```typescript
interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
  message: "登录成功";
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "张三",
      "email": "user@example.com",
      "role": "employee",
      "departmentId": 1,
      "departmentName": "技术部",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  },
  "message": "登录成功"
}
```

**Error Response** (401 Unauthorized):
```typescript
interface LoginErrorResponse {
  success: false;
  data: null;
  message: "邮箱或密码错误";
  errors?: Record<string, string[]>;
}
```

---

## 2. Logout Endpoint

### POST /api/auth/logout

**Purpose**: 用户登出并使令牌失效

**Headers**:
- Authorization: Bearer {token}

**Request**: No body required

**Success Response** (200 OK):
```typescript
interface LogoutResponse {
  success: true;
  data: null;
  message: "登出成功";
}
```

**Example Response**:
```json
{
  "success": true,
  "data": null,
  "message": "登出成功"
}
```

---

## 3. Get Profile Endpoint

### GET /api/auth/profile

**Purpose**: 获取当前用户资料

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface ProfileResponse {
  success: true;
  data: User;
  message?: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "user@example.com",
    "role": "employee",
    "departmentId": 1,
    "departmentName": "技术部",
    "positionId": 5,
    "positionName": "高级工程师",
    "managerId": 2,
    "managerName": "李四",
    "phoneNumber": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z"
  },
  "message": "获取成功"
}
```

---

## 4. Update Profile Endpoint

### PUT /api/auth/profile

**Purpose**: 更新当前用户资料

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
}
```

**Example Request**:
```json
{
  "name": "张三",
  "phoneNumber": "13800138000",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Success Response** (200 OK):
```typescript
interface UpdateProfileResponse {
  success: true;
  data: User;
  message: "资料更新成功";
}
```

**Error Response** (400 Bad Request):
```typescript
interface ValidationErrorResponse {
  success: false;
  data: null;
  message: "验证失败";
  errors: {
    name?: string[];
    email?: string[];
    phoneNumber?: string[];
  };
}
```

**Example Error Response**:
```json
{
  "success": false,
  "data": null,
  "message": "验证失败",
  "errors": {
    "name": ["姓名不能为空"],
    "email": ["邮箱格式不正确"]
  }
}
```

---

## 5. Change Password Endpoint

### PUT /api/auth/password

**Purpose**: 修改当前用户密码

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Example Request**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response** (200 OK):
```typescript
interface ChangePasswordResponse {
  success: true;
  data: null;
  message: "密码修改成功";
}
```

**Example Response**:
```json
{
  "success": true,
  "data": null,
  "message": "密码修改成功"
}
```

**Error Response** (400 Bad Request):
```typescript
interface ChangePasswordErrorResponse {
  success: false;
  data: null;
  message: "当前密码不正确";
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
  };
}
```

---

## Error Response Format

### Standard Error Structure

所有认证端点的错误响应都遵循以下格式：

```typescript
interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  errors?: Record<string, string[]>;
}
```

### Common Error Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | 验证失败 | 请求参数验证错误 |
| 401 | 未授权 | 令牌无效或已过期 |
| 403 | 禁止访问 | 没有权限访问资源 |
| 404 | 用户不存在 | 指定的用户不存在 |
| 409 | 邮箱已存在 | 创建用户时邮箱重复 |
| 422 | 业务逻辑错误 | 密码强度不足等 |
| 500 | 服务器错误 | 内部服务器错误 |

---

## Type Definitions Summary

### Request Types
- `LoginRequest`
- `UpdateProfileRequest`
- `ChangePasswordRequest`

### Response Types
- `LoginResponse`
- `LogoutResponse`
- `ProfileResponse`
- `UpdateProfileResponse`
- `ChangePasswordResponse`

### Entity Types
- `User`
- `UserRole`
- `ApiResponse<T>`

### Utility Types
- `ErrorResponse`
- `ValidationErrorResponse`

---

## Security Considerations

1. **令牌存储**: 令牌应存储在 localStorage 中
2. **令牌刷新**: 令牌过期前需要刷新机制
3. **密码强度**: 新密码应满足复杂度要求
4. **HTTPS**: 所有认证请求必须使用 HTTPS
5. **CSRF 保护**: 防止跨站请求伪造攻击

---

## Implementation Notes

1. 所有认证端点都需要在请求头中包含 `Authorization: Bearer {token}`
2. 令牌包含在本地存储中，API 服务会自动添加到请求头
3. 401 错误会自动触发登出流程
4. 建议在用户不活跃一段时间后自动登出

---

## Testing

### Test Cases

1. **成功登录**
   - 输入正确的邮箱和密码
   - 验证返回令牌和用户信息

2. **登录失败**
   - 输入错误的密码
   - 验证返回 401 错误

3. **令牌过期**
   - 使用过期令牌访问资源
   - 验证返回 401 错误并自动登出

4. **更新资料**
   - 修改用户资料
   - 验证返回更新的用户信息

5. **修改密码**
   - 输入正确的当前密码和新密码
   - 验证密码修改成功

---

## Related Documentation

- [Employee API Contracts](./employee.md)
- [Leave API Contracts](./leave.md)
- [Data Model](../data-model.md)
