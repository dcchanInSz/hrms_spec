# Data Model: 小企业人力资源管理系统

**数据库**: PostgreSQL 14+
**最后更新**: 2026-01-15

## 实体关系图

```
┌─────────────┐       ┌─────────────┐
│ Department  │───┐   │  Position   │
│ (部门)      │   │   │  (职位)     │
└─────────────┘   │   └─────────────┘
      │           │
      │ hasMany   │ belongsTo
      ↓           │
┌─────────────────────────────────────────┐
│                 Employee                 │
│                 (员工)                   │
│  - id: UUID                             │
│  - employee_no: VARCHAR(20) UNIQUE      │
│  - name: VARCHAR(100)                   │
│  - email: VARCHAR(255) UNIQUE           │
│  - phone: VARCHAR(20)                   │
│  - department_id: UUID                  │
│  - position_id: UUID                    │
│  - manager_id: UUID (nullable)          │
│  - hire_date: DATE                      │
│  - status: ENUM(active/inactive)        │
│  - role: ENUM(employee/manager/hr)      │
└─────────────────────────────────────────┘
      │
      │ hasMany
      ↓
┌─────────────┐       ┌─────────────┐
│ LeaveRequest│       │ LeaveBalance│
│ (请假申请)  │       │ (请假余额)  │
└─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐
│  PayStub    │       │ AuditLog    │
│  (工资单)   │       │ (审计日志)  │
└─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐
│Notification │       │LeavePolicy  │
│  (通知)     │       │  (请假政策) │
└─────────────┘       └─────────────┘
```

## 详细字段定义

### 1. Employee (员工)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| employee_no | VARCHAR(20) | UNIQUE, NOT NULL | 员工编号，如 EMP001 |
| name | VARCHAR(100) | NOT NULL | 姓名 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 登录邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 哈希 |
| phone | VARCHAR(20) | NULL | 联系电话 |
| emergency_contact | VARCHAR(100) | NULL | 紧急联系人 |
| emergency_phone | VARCHAR(20) | NULL | 紧急联系电话 |
| department_id | UUID | FK -> Department.id | 所属部门 |
| position_id | UUID | FK -> Position.id | 职位 |
| manager_id | UUID | FK -> Employee.id | 直属经理 |
| hire_date | DATE | NOT NULL | 入职日期 |
| termination_date | DATE | NULL | 离职日期 |
| status | ENUM | DEFAULT 'active' | 员工状态 |
| role | ENUM | DEFAULT 'employee' | 系统角色 |
| avatar_url | VARCHAR(500) | NULL | 头像 URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_employee_no` ON employee_no
- `idx_email` ON email
- `idx_department` ON department_id
- `idx_manager` ON manager_id
- `idx_status` ON status

### 2. Department (部门)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| name | VARCHAR(100) | NOT NULL | 部门名称 |
| code | VARCHAR(20) | UNIQUE | 部门编码 |
| description | TEXT | NULL | 描述 |
| parent_id | UUID | FK -> Department.id | 上级部门（支持层级） |
| manager_id | UUID | FK -> Employee.id | 部门经理 |
| sort_order | INTEGER | DEFAULT 0 | 排序 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否启用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_parent` ON parent_id
- `idx_manager` ON manager_id

### 3. Position (职位)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| title | VARCHAR(100) | NOT NULL | 职位名称 |
| code | VARCHAR(20) | UNIQUE | 职位编码 |
| level | INTEGER | DEFAULT 1 | 职级 |
| department_id | UUID | FK -> Department.id | 所属部门 |
| description | TEXT | NULL | 职位描述 |
| salary_min | DECIMAL(10,2) | NULL | 最低薪资 |
| salary_max | DECIMAL(10,2) | NULL | 最高薪资 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否启用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 4. LeaveRequest (请假申请)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| employee_id | UUID | FK -> Employee.id | 申请人 |
| leave_type | ENUM | NOT NULL | 年假/病假/事假/其他 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | NOT NULL | 结束日期 |
| days | DECIMAL(3,1) | NOT NULL | 请假天数 |
| reason | TEXT | NULL | 请假原因 |
| status | ENUM | DEFAULT 'pending' | 待审批/已批准/已拒绝/已撤回 |
| approver_id | UUID | FK -> Employee.id | 审批人 |
| approved_at | DATETIME | NULL | 审批时间 |
| rejection_reason | TEXT | NULL | 拒绝原因 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 申请时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**状态机**:
```
pending → approved
     ↓      ↑
     → rejected
     ↓
   archived (撤回)
```

**索引**:
- `idx_employee` ON employee_id
- `idx_approver` ON approver_id
- `idx_status` ON status
- `idx_dates` ON start_date, end_date

### 5. LeaveBalance (请假余额)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| employee_id | UUID | FK -> Employee.id | 员工 |
| leave_type | ENUM | NOT NULL | 假期类型 |
| year | INTEGER | NOT NULL | 年度 |
| total_days | DECIMAL(4,1) | NOT NULL | 年度总天数 |
| used_days | DECIMAL(4,1) | DEFAULT 0 | 已使用天数 |
| carryover_days | DECIMAL(4,1) | DEFAULT 0 | 结转天数 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**复合唯一索引**: (employee_id, leave_type, year)

### 6. PayStub (工资单)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| employee_id | UUID | FK -> Employee.id | 员工 |
| pay_period_start | DATE | NOT NULL | 薪资周期开始 |
| pay_period_end | DATE | NOT NULL | 薪资周期结束 |
| base_salary | DECIMAL(10,2) | NOT NULL | 基本工资 |
| bonus | DECIMAL(10,2) | DEFAULT 0 | 奖金 |
| deduction | DECIMAL(10,2) | DEFAULT 0 | 扣除 |
| tax | DECIMAL(10,2) | DEFAULT 0 | 税款 |
| net_salary | DECIMAL(10,2) | NOT NULL | 实发工资 |
| notes | TEXT | NULL | 备注 |
| created_by | UUID | FK -> Employee.id | 录入人 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 录入时间 |

**索引**:
- `idx_employee_period` ON employee_id, pay_period_start

### 7. AuditLog (审计日志)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK -> Employee.id | 操作人 |
| action | VARCHAR(50) | NOT NULL | 操作类型 |
| entity_type | VARCHAR(50) | NOT NULL | 实体类型 |
| entity_id | UUID | NOT NULL | 实体 ID |
| old_value | JSON | NULL | 旧值 |
| new_value | JSON | NULL | 新值 |
| ip_address | VARCHAR(45) | NULL | IP 地址 |
| user_agent | VARCHAR(500) | NULL | 浏览器信息 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 操作时间 |

**保留策略**: 保留 2 年后归档

**索引**:
- `idx_user` ON user_id
- `idx_entity` ON entity_type, entity_id
- `idx_created` ON created_at

### 8. Notification (通知)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK -> Employee.id | 接收人 |
| type | ENUM | NOT NULL | 通知类型 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| message | TEXT | NOT NULL | 内容 |
| link | VARCHAR(500) | NULL | 跳转链接 |
| is_read | BOOLEAN | DEFAULT FALSE | 是否已读 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_user_unread` ON user_id, is_read

### 9. LeavePolicy (请假政策配置)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| leave_type | ENUM | UNIQUE | 假期类型 |
| default_days | DECIMAL(4,1) | NOT NULL | 默认年假天数 |
| carryover_limit | DECIMAL(4,1) | DEFAULT 0 | 结转上限 |
| requires_approval | BOOLEAN | DEFAULT TRUE | 是否需要审批 |
| advance_notice_days | INTEGER | DEFAULT 0 | 提前申请天数 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否启用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 关系约束

### 必须保证的完整性

1. **员工-经理关系**: 员工的 manager_id 必须指向另一员工，且不能形成环（可考虑应用层检查）
2. **部门层级**: 父部门不能是自己，支持多级但建议最多 3 级
3. **请假天数**: LeaveRequest.days = (end_date - start_date + 1) - 周末
4. **余额更新**: 请假批准时自动更新 LeaveBalance.used_days
5. **软删除**: 不使用物理删除，使用 status 字段标记

## 初始化数据

### 默认请假政策

| 类型 | 默认天数 | 结转上限 | 提前天数 |
|------|----------|----------|----------|
| 年假 | 10 天 | 5 天 | 3 天 |
| 病假 | 10 天 | 0 | 0 |
| 事假 | 5 天 | 0 | 2 天 |

### 默认角色

- `employee`: 普通员工
- `manager`: 部门经理
- `hr`: HR 管理员
