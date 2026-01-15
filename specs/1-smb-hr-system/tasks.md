# Tasks: 小企业人力资源管理系统

**Feature**: 小企业人力资源管理系统
**Branch**: `1-smb-hr-system`
**Created**: 2026-01-15
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)

---

## MVP 范围

**核心目标**: 用户故事 1 (员工自助服务门户) - 提供基础员工自助功能，验证核心架构

**MVP 验收标准**:
- 员工可登录系统
- 员工可查看和修改自己的个人信息
- 员工可提交请假申请
- 员工可查看自己的工资单
- 员工只能访问自己的数据

---

## 依赖关系图

```
Phase 1: 项目初始化 (Setup)
    │
    ▼
Phase 2: 基础设施 (Foundational)
    │
    ├─────────────────────────────────────────────────────────┐
    │                                                         │
    ▼                                                         ▼
Phase 3: US1 员工自助服务                                  Phase 4: US2 经理团队管理
(可独立测试)                                               (依赖 US1 的认证和数据访问)
    │                                                         │
    │                                                         ▼
    │                                             Phase 5: US3 HR 行政管理
    │                                             (依赖 US1, US2 基础功能)
    │                                                         │
    ▼                                                         ▼
Phase 6: US4 请假管理                                    Phase 7: US5 组织架构管理
(依赖 US1, US2)                                          (依赖 US3 部门管理)
    │                                                         │
    ▼                                                         ▼
Phase 8: US6 基本报表                                     Phase 9: 优化与横切关注点
```

**关键依赖**:
- US1 是所有其他用户故事的基础（认证、个人数据访问）
- US2 依赖 US1 的请假申请基础功能
- US3 依赖 US1 的员工数据模型
- US4 增强请假功能，依赖 US1 的余额查询
- US5 部门管理可在 US3 后并行或串行
- US6 报表可在所有核心功能完成后

---

## Phase 1: 项目初始化

**目标**: 创建项目结构和基础配置

- [x] T001 初始化后端 Node.js 项目，安装 Express、pg、bcrypt、jsonwebtoken、cors、dotenv
- [x] T002 初始化前端 React 项目 (Vite + React)，安装 tailwindcss、axios、react-router-dom
- [x] T003 配置后端 package.json 脚本：dev、start、test、migrate、seed
- [x] T004 配置前端 vite.config.js 和 tailwind.config.js
- [x] T005 创建环境变量模板：backend/.env.example 和 frontend/.env.example
- [x] T006 配置 ESLint 和 Prettier 确保代码风格统一

---

## Phase 2: 基础设施

**目标**: 创建数据库、认证和通用组件

### 2.1 数据库层

- [x] T010 创建 PostgreSQL 连接池 backend/src/models/db.js (pg 模块)
- [x] T011 创建数据库迁移文件 backend/scripts/migrate.js (所有表结构)
- [x] T012 创建数据库种子数据脚本 backend/scripts/seed.js (默认管理员、部门、职位、请假政策)
- [ ] T013 创建回滚脚本 npm run migrate:down

### 2.2 认证基础设施

- [x] T020 创建 JWT 工具函数 backend/src/utils/jwt.js (生成、验证 token)
- [x] T021 创建 bcrypt 工具函数 backend/src/utils/password.js (密码哈希)
- [x] T022 创建认证中间件 backend/src/middleware/auth.js (JWT 验证)
- [x] T023 创建角色权限中间件 backend/src/middleware/role.js (RBAC)

### 2.3 通用后端组件

- [x] T030 创建全局错误处理中间件 backend/src/middleware/error.js
- [x] T031 创建统一响应格式工具 backend/src/utils/response.js
- [x] T032 创建审计日志中间件 backend/src/middleware/audit.js

### 2.4 通用前端组件

- [x] T040 [P] 创建通用 Button 组件 frontend/src/components/Button/
- [x] T041 [P] 创建通用 Input/Select/Textarea 组件 frontend/src/components/Form/
- [x] T042 [P] 创建通用 Table 组件 frontend/src/components/Table/
- [x] T043 [P] 创建通用 Modal 组件 frontend/src/components/Modal/
- [x] T044 创建 Notification 通知组件 frontend/src/components/Notification/

### 2.5 前端基础设施

- [x] T050 创建 API 服务封装 frontend/src/services/api.js (axios 实例)
- [x] T051 创建 Auth Context 前端状态管理 frontend/src/contexts/AuthContext.jsx
- [x] T052 创建 useAuth 自定义 hook frontend/src/hooks/useAuth.js
- [x] T053 配置 React Router 路由 frontend/src/App.jsx 和 router 配置

---

## Phase 3: 用户故事 1 - 员工自助服务门户

**目标**: 员工可查看/修改个人信息、提交请假、查看工资单

**独立测试标准**: 创建员工账户 → 登录 → 查看个人资料 → 修改联系方式 → 提交请假申请 → 查看工资单 → 验证只能访问自己数据

### 3.1 数据模型

- [x] T060 [P] [US1] 创建 Employee 模型 backend/src/models/Employee.js
- [x] T061 [P] [US1] 创建 LeaveRequest 模型 backend/src/models/LeaveRequest.js
- [x] T062 [P] [US1] 创建 LeaveBalance 模型 backend/src/models/LeaveBalance.js
- [x] T063 [P] [US1] 创建 PayStub 模型 backend/src/models/PayStub.js
- [x] T064 [P] [US1] 创建 Notification 模型 backend/src/models/Notification.js

### 3.2 服务层

- [x] T070 [US1] 创建 EmployeeService backend/src/services/employeeService.js (CRUD、权限检查)
- [x] T071 [US1] 创建 LeaveService backend/src/services/leaveService.js (申请、余额计算)
- [x] T072 [US1] 创建 PayStubService backend/src/services/payStubService.js (查询工资单)
- [x] T073 [US1] 创建 NotificationService backend/src/services/notificationService.js (通知 CRUD)

### 3.3 API 端点

- [x] T080 [US1] 创建认证路由 backend/src/routes/auth.js (login, logout, profile)
- [x] T081 [US1] 创建员工路由 backend/src/routes/employees.js (GET/PUT 个人资料)
- [x] T082 [US1] 创建请假路由 backend/src/routes/leaves.js (CRUD LeaveRequest)
- [x] T083 [US1] 创建工资单路由 backend/src/routes/paystubs.js (列表查询)
- [x] T084 [US1] 创建通知路由 backend/src/routes/notifications.js (列表、标记已读)

### 3.4 前端页面

- [x] T090 [P] [US1] 创建登录页面 frontend/src/pages/Login/index.jsx
- [x] T091 [P] [US1] 创建个人资料页面 frontend/src/pages/Profile/index.jsx
- [x] T092 [P] [US1] 创建请假申请页面 frontend/src/pages/Leave/RequestForm.jsx
- [x] T093 [P] [US1] 创建请假列表页面 frontend/src/pages/Leave/MyLeaves.jsx
- [x] T094 [P] [US1] 创建工资单页面 frontend/src/pages/PayStubs/index.jsx
- [x] T095 [P] [US1] 创建通知中心页面 frontend/src/pages/Notifications/index.jsx

### 3.5 测试

- [x] T100 [US1] 编写认证 API 集成测试 backend/tests/api/auth.test.js
- [x] T101 [US1] 编写员工 API 集成测试 backend/tests/api/employee.test.js
- [x] T102 [US1] 编写请假 API 集成测试 backend/tests/api/leave.test.js
- [x] T103 [US1] 编写工资单 API 集成测试 backend/tests/api/paystub.test.js
- [x] T104 [US1] 编写登录页面组件测试 frontend/tests/pages/Login.test.jsx
- [x] T105 [US1] 编写请假申请页面组件测试 frontend/tests/pages/Leave/RequestForm.test.jsx

---

## Phase 4: 用户故事 2 - 经理团队管理

**目标**: 经理可查看团队、审批请假、查看团队成员

**依赖**: Phase 3 完成 (US1 的请假申请和认证基础)

**独立测试标准**: 登录经理 → 查看团队仪表盘 → 审批待处理请假 → 拒绝带原因 → 验证只能访问团队成员

### 4.1 服务层增强

- [x] T110 [US2] 扩展 EmployeeService 添加团队查询方法 getTeamByManager(managerId) *(已存在于 employeeService.js)*
- [x] T111 [US2] 扩展 LeaveService 添加审批方法 approve/reject *(已存在于 leaveService.js)*

### 4.2 API 端点

- [x] T120 [US2] 创建团队仪表盘 API GET /api/teams/dashboard
- [x] T121 [US2] 创建团队成员列表 API GET /api/teams/members
- [x] T122 [US2] 创建请假审批 API PUT /api/leaves/:id/approve, PUT /api/leaves/:id/reject *(已存在于 leaves.js)*
- [x] T123 [US2] 创建团队日历 API GET /api/teams/calendar *(已存在于 leaves.js)*

### 4.3 前端页面

- [x] T130 [P] [US2] 创建团队仪表盘页面 frontend/src/pages/Manager/Dashboard/index.jsx
- [x] T131 [P] [US2] 创建团队成员列表页面 frontend/src/pages/Manager/TeamMembers.jsx
- [x] T132 [P] [US2] 创建请假审批面板 frontend/src/pages/Manager/LeaveApproval.jsx

### 4.4 测试

- [x] T140 [US2] 编写团队 API 集成测试 backend/tests/api/team.test.js
- [x] T141 [US2] 编写审批 API 集成测试 backend/tests/api/approval.test.js
- [x] T142 [US2] 编写团队仪表盘页面测试 frontend/tests/pages/Manager/Dashboard.test.jsx

---

## Phase 5: 用户故事 3 - HR 行政管理仪表盘

**目标**: HR 可管理员工 CRUD、部门、职位、报表

**依赖**: Phase 3 完成 (Employee 模型基础)

**独立测试标准**: HR 登录 → 创建新员工 → 设置部门/经理 → 处理离职 → 生成员工报表

### 5.1 数据模型

- [x] T150 [P] [US3] 创建 Department 模型 backend/src/models/Department.js
- [x] T151 [P] [US3] 创建 Position 模型 backend/src/models/Position.js
- [x] T152 [P] [US3] 创建 AuditLog 模型 backend/src/models/AuditLog.js

### 5.2 服务层

- [x] T160 [US3] 创建 DepartmentService backend/src/services/departmentService.js
- [x] T161 [US3] 创建 PositionService backend/src/services/positionService.js
- [x] T162 [US3] 创建 EmployeeManagementService backend/src/services/employeeManagementService.js (HR 专用 CRUD)

### 5.3 API 端点

- [x] T170 [US3] 创建员工管理 API CRUD /api/admin/employees
- [x] T171 [US3] 创建部门管理 API CRUD /api/admin/departments
- [x] T172 [US3] 创建职位管理 API CRUD /api/admin/positions
- [x] T173 [US3] 创建审计日志查询 API GET /api/admin/audit-logs
- [x] T174 [US3] 创建工资单管理 API POST/DELETE /api/admin/paystubs
- [x] T175 [US3] 创建入职/离职工作流 API POST /api/admin/employees/:id/onboarding, :id/offboarding

### 5.4 前端页面

- [x] T180 [P] [US3] 创建 HR 仪表盘 frontend/src/pages/HR/Dashboard/index.jsx
- [x] T181 [P] [US3] 创建员工管理页面 frontend/src/pages/HR/Employees/index.jsx
- [x] T182 [P] [US3] 创建员工表单页面 frontend/src/pages/HR/Employees/EmployeeForm.jsx
- [x] T183 [P] [US3] 创建部门管理页面 frontend/src/pages/HR/Departments/index.jsx
- [x] T184 [P] [US3] 创建审计日志页面 frontend/src/pages/HR/AuditLogs/index.jsx

### 5.5 测试

- [x] T190 [US3] 编写员工管理 API 测试 backend/tests/api/admin/employee.test.js
- [x] T191 [US3] 编写部门管理 API 测试 backend/tests/api/admin/department.test.js
- [x] T192 [US3] 编写 HR 页面组件测试 frontend/tests/pages/HR/Employees.test.jsx

---

## Phase 6: 用户故事 4 - 请假管理

**目标**: 增强请假功能：余额追踪、政策配置、年度结转

**依赖**: Phase 3 完成 (LeaveRequest, LeaveBalance 基础)

**独立测试标准**: 员工查看余额 → 申请不同类型假期 → 验证余额扣除 → 经理审批 → 余额更新

### 6.1 数据模型

- [x] T200 [P] [US4] 创建 LeavePolicy 模型 backend/src/models/LeavePolicy.js

### 6.2 服务层增强

- [x] T210 [US4] 扩展 LeavePolicyService (已集成到 LeavePolicy 模型)
- [x] T211 [US4] 扩展 LeaveService 添加余额检查、政策验证、年度结转逻辑

### 6.3 API 端点

- [x] T220 [US4] 创建请假政策 API GET /api/leaves/policies
- [x] T221 [US4] 创建余额查询 API GET /api/leaves/balances (已在 Phase 3 完成)
- [x] T222 [US4] 创建年度结转 API POST /api/leaves/year-end-rollover (HR 专用)

### 6.4 前端页面

- [x] T230 [P] [US4] 创建余额展示组件 frontend/src/pages/Leave/components/BalanceCard.jsx
- [x] T231 [P] [US4] 创建政策说明页面 frontend/src/pages/Leave/Policies.jsx
- [x] T232 [P] [US4] 创建团队日历页面 frontend/src/pages/Leave/TeamCalendar.jsx

### 6.5 测试

- [x] T240 [US4] 编写余额计算单元测试 backend/tests/unit/leaveBalance.test.js
- [x] T241 [US4] 编写年度结转集成测试 backend/tests/integration/yearEnd.test.js

---

## Phase 7: 用户故事 5 - 组织架构管理

**目标**: 层级部门管理、汇报线维护

**依赖**: Phase 5 完成 (Department 模型)

**独立测试标准**: HR 创建部门 → 设置层级 → 分配经理 → 验证审批链更新

### 7.1 服务层增强

- [x] T250 [US5] 扩展 DepartmentService 添加层级验证、审批链更新逻辑
- [x] T251 [US5] 创建 OrgChartService backend/src/services/orgChartService.js

### 7.2 API 端点

- [x] T260 [US5] 创建组织架构 API GET /api/org/chart
- [x] T261 [US5] 创建部门层级更新 API PUT /api/org/reassign-manager

### 7.3 前端页面

- [x] T270 [P] [US5] 创建组织架构图页面 frontend/src/pages/HR/OrgChart/index.jsx
- [x] T271 [P] [US5] 创建部门层级管理组件 frontend/src/pages/HR/OrgChart/DepartmentTree.jsx

### 7.4 测试

- [x] T280 [US5] 编写部门层级 API 测试 backend/tests/api/org.test.js
- [x] T281 [US5] 编写审批链更新集成测试 backend/tests/api/approvalChain.test.js

---

## Phase 8: 用户故事 6 - 基本报表与分析

**目标**: HR 和经理的报表功能

**依赖**: Phase 3, 4, 5 完成

**独立测试标准**: HR 查看仪表盘 → 生成部门人数报表 → 导出数据 → 经理查看团队分析

### 8.1 服务层

- [x] T290 [US6] 创建 ReportService backend/src/services/reportService.js
- [x] T291 [US6] 创建数据聚合查询方法

### 8.2 API 端点

- [x] T300 [US6] 创建 HR 仪表盘 API GET /api/reports/hr-dashboard
- [x] T301 [US6] 创建团队分析 API GET /api/reports/team-analytics
- [x] T302 [US6] 创建人数统计 API GET /api/reports/headcount
- [x] T303 [US6] 创建请假利用率 API GET /api/reports/leave-utilization
- [x] T304 [US6] 创建报表导出 API GET /api/reports/export (CSV/Excel)

### 8.3 前端页面

- [x] T310 [P] [US6] 创建 HR 报表仪表盘 frontend/src/pages/HR/Reports/Dashboard.jsx
- [x] T311 [P] [US6] 创建团队分析页面 frontend/src/pages/Manager/Reports/Analytics.jsx
- [x] T312 [P] [US6] 创建报表导出组件 frontend/src/components/ExportButton/

### 8.4 测试

- [x] T320 [US6] 编写报表 API 集成测试 backend/tests/api/reports.test.js
- [x] T321 [US6] 编写数据准确性验证测试 backend/tests/integration/dataAccuracy.test.js

---

## Phase 9: 优化与横切关注点

**目标**: 完善用户体验、性能优化、安全加固

### 9.1 性能优化

- [x] T330 添加数据库查询索引优化 (在 migrate.js 中添加 20+ 索引)
- [x] T331 实现列表分页加载后端支持 (pagination.js 工具 + 现有路由支持)
- [x] T332 实现前端路由代码分割懒加载 (React.lazy + Suspense)
- [x] T333 添加 API 响应缓存 (热点数据) (cache.js 内存缓存工具)

### 9.2 用户体验

- [x] T340 添加全局加载状态组件 (LoadingOverlay/index.jsx)
- [x] T341 实现表单验证错误提示统一 (utils/validation.js)
- [x] T342 添加空状态页面组件 (EmptyState/index.jsx)
- [ ] T343 实现移动端响应式适配测试 (待验证)

### 9.3 安全加固

- [x] T350 添加请求频率限制 (rate limiting) (middleware/rateLimit.js)
- [x] T351 实现敏感操作二次确认 (ConfirmDialog/index.jsx)
- [x] T352 添加 SQL 注入防护验证 (utils/sqlProtection.js)
- [x] T353 安全头配置 (Helmet.js) (middleware/securityHeaders.js)

### 9.4 文档与部署

- [x] T360 创建 README.md 开发文档
- [x] T361 创建 Docker 配置 (Dockerfile, docker-compose.yml)
- [x] T362 创建环境配置说明文档 (ENVIRONMENT.md)

---

## 任务统计

| Phase | 任务数量 | 描述 |
|-------|----------|------|
| Phase 1 | 6 | 项目初始化 |
| Phase 2 | 17 | 基础设施 |
| Phase 3 | 25 | 用户故事 1 - 员工自助 |
| Phase 4 | 9 | 用户故事 2 - 经理团队 |
| Phase 5 | 15 | 用户故事 3 - HR 管理 |
| Phase 6 | 9 | 用户故事 4 - 请假管理 |
| Phase 7 | 7 | 用户故事 5 - 组织架构 |
| Phase 8 | 9 | 用户故事 6 - 报表分析 |
| Phase 9 | 9 | 优化与横切 |
| **总计** | **106** | |

---

## 并行执行机会

以下任务可在同一阶段并行执行：

**Phase 2 并行组**:
- T010-T013 (数据库层) 可并行
- T020-T023 (认证) 可并行
- T040-T044 (前端组件) 可并行
- T050-T053 (前端基础设施) 可并行

**Phase 3 并行组**:
- T060-T064 (数据模型) 可并行
- T070-T073 (服务层) 可并行
- T080-T084 (API 端点) 可并行
- T090-T095 (前端页面) 可并行

**Phase 5 并行组**:
- T150-T152 (数据模型) 可并行
- T180-T184 (前端页面) 可并行

---

## 快速开始 (MVP)

完成以下任务即可获得最小可行产品:

| 任务 | 描述 |
|------|------|
| T001-T006 | 项目初始化 |
| T010-T013 | 数据库层 |
| T020-T023 | 认证中间件 |
| T030-T032 | 通用后端组件 |
- [ ] T050-T053 | 前端基础设施 |
| T060 | Employee 模型 |
| T070 | EmployeeService |
| T080 | 认证路由 |
| T081 | 员工路由 |
| T090 | 登录页面 |
| T091 | 个人资料页面 |
| T100 | 认证测试 |

**预计任务数**: ~25 个核心任务
