# API Contracts: Leave Management

**Date**: 2026-01-15
**Feature**: Convert Frontend to TypeScript
**Branch**: 001-frontend-typescript

## Overview

本文档定义了 HRMS 系统中请假管理相关的 API 契约。

---

## Base Types

```typescript
/**
 * 请假类型
 */
type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'bereavement' | 'personal' | 'study' | 'unpaid';

/**
 * 请假状态
 */
type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

/**
 * 请假记录
 */
interface Leave {
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
interface LeaveBalance {
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
interface LeavePolicy {
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
 * 请假请求表单
 */
interface LeaveRequestFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

/**
 * 审批数据
 */
interface ApprovalData {
  comment?: string;
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

/**
 * 分页参数
 */
interface PaginationParams {
  page?: number;
  pageSize?: number;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
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
```

---

## 1. Get My Leaves

### GET /api/leaves

**Purpose**: 获取当前用户的请假记录

**Headers**:
- Authorization: Bearer {token}

**Query Parameters**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 状态过滤
- `leaveType`: 请假类型过滤
- `startDate`: 开始日期过滤
- `endDate`: 结束日期过滤

**Success Response** (200 OK):
```typescript
interface MyLeavesResponse {
  success: true;
  data: {
    items: Leave[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

---

## 2. Get Leave Types

### GET /api/leaves/types

**Purpose**: 获取可用的请假类型

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface LeaveTypesResponse {
  success: true;
  data: {
    value: LeaveType;
    label: string;
  }[];
}
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    { "value": "annual", "label": "年假" },
    { "value": "sick", "label": "病假" },
    { "value": "maternity", "label": "产假" }
  ]
}
```

---

## 3. Get Leave Balance

### GET /api/leaves/balances

**Purpose**: 获取当前用户的请假余额

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface LeaveBalanceResponse {
  success: true;
  data: LeaveBalance[];
}
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "leaveType": "annual",
      "totalEntitled": 15,
      "used": 5,
      "pending": 2,
      "remaining": 8,
      "carryOver": 3
    },
    {
      "leaveType": "sick",
      "totalEntitled": 10,
      "used": 1,
      "pending": 0,
      "remaining": 9
    }
  ]
}
```

---

## 4. Get Leave Policies

### GET /api/leaves/policies

**Purpose**: 获取请假政策列表

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface LeavePoliciesResponse {
  success: true;
  data: LeavePolicy[];
}
```

---

## 5. Create Leave Request

### POST /api/leaves

**Purpose**: 创建新的请假申请

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}
```

**Example Request**:
```json
{
  "leaveType": "annual",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "reason": "家庭旅行"
}
```

**Success Response** (201 Created):
```typescript
interface CreateLeaveResponse {
  success: true;
  data: Leave;
  message: "请假申请提交成功";
}
```

**Error Response** (400 Bad Request):
```typescript
interface CreateLeaveErrorResponse {
  success: false;
  data: null;
  message: "余额不足或日期冲突";
  errors: {
    startDate?: string[];
    endDate?: string[];
    leaveType?: string[];
  };
}
```

---

## 6. Cancel Leave Request

### PUT /api/leaves/{id}/cancel

**Purpose**: 取消自己的请假申请（仅待审批状态）

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface CancelLeaveResponse {
  success: true;
  data: Leave;
  message: "请假申请已取消";
}
```

**Error Response** (400 Bad Request):
```typescript
interface CancelLeaveErrorResponse {
  success: false;
  data: null;
  message: "无法取消已审批的请假申请";
}
```

---

## 7. Get Pending Approvals (Manager)

### GET /api/leaves/pending

**Purpose**: 获取待审批的请假列表（经理权限）

**Headers**:
- Authorization: Bearer {token}

**Success Response** (200 OK):
```typescript
interface PendingLeavesResponse {
  success: true;
  data: Leave[];
}
```

---

## 8. Approve Leave

### PUT /api/leaves/{id}/approve

**Purpose**: 审批请假申请（经理权限）

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface ApproveLeaveRequest {
  comment?: string;
}
```

**Success Response** (200 OK):
```typescript
interface ApproveLeaveResponse {
  success: true;
  data: Leave;
  message: "请假申请已批准";
}
```

---

## 9. Reject Leave

### PUT /api/leaves/{id}/reject

**Purpose**: 拒绝请假申请（经理权限）

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface RejectLeaveRequest {
  reason: string;
}
```

**Success Response** (200 OK):
```typescript
interface RejectLeaveResponse {
  success: true;
  data: Leave;
  message: "请假申请已拒绝";
}
```

---

## 10. Get Team Leaves (Manager)

### GET /api/leaves/team

**Purpose**: 获取团队成员的请假记录（经理权限）

**Headers**:
- Authorization: Bearer {token}

**Query Parameters**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 状态过滤
- `startDate`: 开始日期
- `endDate`: 结束日期

**Success Response** (200 OK):
```typescript
interface TeamLeavesResponse {
  success: true;
  data: {
    items: Leave[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

---

## 11. Get All Leaves (HR)

### GET /api/admin/leaves

**Purpose**: 获取所有请假记录（HR权限）

**Headers**:
- Authorization: Bearer {token}

**Query Parameters**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 状态过滤
- `leaveType`: 请假类型过滤
- `employeeId`: 员工ID过滤
- `startDate`: 开始日期
- `endDate`: 结束日期

**Success Response** (200 OK):
```typescript
interface AllLeavesResponse {
  success: true;
  data: {
    items: Leave[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

---

## 12. Year End Rollover (HR)

### POST /api/leaves/year-end-rollover

**Purpose**: 年度结转（HR权限）

**Headers**:
- Authorization: Bearer {token}
- Content-Type: application/json

**Request**:
```typescript
interface YearEndRolloverRequest {
  year: number;
  carryOverPercentage: number;
}
```

**Success Response** (200 OK):
```typescript
interface YearEndRolloverResponse {
  success: true;
  data: {
    processed: number;
    carriedOver: number;
    forfeited: number;
  };
  message: "年度结转完成";
}
```

---

## Validation Rules

### Create Leave Request Validation

| Field | Rules |
|-------|-------|
| leaveType | 必填，必须是有效的请假类型 |
| startDate | 必填，日期格式，不能是过去日期 |
| endDate | 必填，日期格式，必须不早于开始日期 |
| reason | 可选，1-500字符（年假超过3天必填）|

### Business Rules

1. **余额检查**: 申请假期不能超过可用余额
2. **日期冲突**: 不能与已有假期重叠
3. **提前申请**: 某些假期类型需要提前N天申请
4. **连续天数**: 不能超过政策允许的最大连续天数
5. **审批流程**: 大部分假期需要经理审批

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | 验证失败 | 请求参数验证错误 |
| 401 | 未授权 | 令牌无效 |
| 403 | 禁止访问 | 没有权限 |
| 404 | 请假记录不存在 | 指定ID的请假记录不存在 |
| 409 | 日期冲突 | 与已有假期冲突 |
| 422 | 余额不足 | 可用假期余额不足 |

---

## Implementation Notes

1. **权限控制**:
   - `/api/leaves/*` (非admin): 员工只能访问自己的记录
   - `/api/leaves/team/*`: 经理可以访问下属记录
   - `/api/admin/leaves/*`: HR可以访问所有记录

2. **状态流转**:
   - pending → approved (审批通过)
   - pending → rejected (审批拒绝)
   - pending → cancelled (员工取消)
   - approved → completed (假期结束)

3. **余额计算**:
   - remaining = totalEntitled - used - pending

---

## Testing

### Test Cases

1. **创建请假申请**
   - 验证余额充足
   - 验证日期不冲突
   - 验证提前申请天数

2. **审批流程**
   - 经理可以审批下属申请
   - HR可以审批所有申请
   - 审批后状态正确更新

3. **取消申请**
   - 员工可以取消待审批申请
   - 员工不能取消已审批申请

4. **年度结转**
   - HR可以执行年度结转
   - 计算正确的结转数量

---

## Related Documentation

- [Auth API Contracts](./auth.md)
- [Employee API Contracts](./employee.md)
- [Data Model](../data-model.md)
