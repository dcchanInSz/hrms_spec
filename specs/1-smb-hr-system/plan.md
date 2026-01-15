# Implementation Plan: 小企业人力资源管理系统

**Branch**: `1-smb-hr-system` | **Date**: 2026-01-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/speckit.specify` with clarifications from `/speckit.clarify`

## Summary

构建一个面向 10-50 人小型企业的人力资源管理系统，支持三种角色（HR 管理员、经理、员工）的核心 HR 功能。系统采用前后端分离架构，后端提供 RESTful API，前端使用响应式 Web 界面。

**核心技术方案**:
- 后端：Node.js + Express + PostgreSQL（关系型数据库，企业级可靠性）
- 前端：React + TailwindCSS（组件化开发，统一设计语言）
- 认证：JWT + RBAC（基于角色的访问控制）
- 测试：Jest + React Testing Library

## Technical Context

**Language/Version**: Node.js 18+ (LTS)
**Primary Dependencies**: Express 4.x, React 18, PostgreSQL, pg, JWT, bcrypt
**Storage**: PostgreSQL（关系型数据库，企业级可靠性，ACID 事务支持）
**Testing**: Jest（单元测试）, Supertest（API 测试）, React Testing Library
**Target Platform**: Web 浏览器（桌面 + 移动端响应式）
**Project Type**: Web Application (前后端分离)
**Performance Goals**: 页面加载 < 2s，API 响应 < 500ms
**Constraints**: 需要 PostgreSQL 数据库服务，数据本地存储 2 年
**Scale/Scope**: 10-50 并发用户，约 7 个核心数据实体

## Constitution Check

*GATE: Pass before Phase 1 design*

### I. Code Quality Gate

| 要求 | 评估 | 状态 |
|------|------|------|
| 可读性优先 | 清晰的 MVC 分层 + RESTful API 命名规范 | PASS |
| 单一职责 | 后端：控制器-服务-数据访问分层；前端：组件-页面-hooks 分层 | PASS |
| DRY 原则 | 提取公共组件（表单、列表、通知）、共享类型定义 | PASS |
| 命名规范 | 驼峰命名（JS）、小写下划线（数据库）、RESTful 端点 | PASS |
| 错误处理 | 全局错误中间件、统一的错误响应格式 | PASS |

### II. Testing Standards Gate

| 要求 | 评估 | 状态 |
|------|------|------|
| TDD 支持 | 测试文件与源文件同目录，Jest 自动发现 | PASS |
| 100% 覆盖边界 | 关键业务逻辑（审批流程、余额计算）需覆盖 | PASS |
| 测试隔离 | 每个测试使用事务回滚，测试后恢复数据库状态 | PASS |
| Mock 原则 | 仅 Mock 外部服务，核心逻辑真实测试 | PASS |

### III. User Experience Consistency Gate

| 要求 | 评估 | 状态 |
|------|------|------|
| 视觉一致性 | TailwindCSS 统一设计系统 | PASS |
| 交互一致性 | 统一的表单验证、加载状态、错误提示 | PASS |
| 响应式适配 | 移动优先， breakpoint 定义 | PASS |
| 无障碍访问 | 语义化 HTML，ARIA 标签支持 | PASS |

### IV. Performance Requirements Gate

| 要求 | 评估 | 状态 |
|------|------|------|
| 响应时间 < 100ms | PostgreSQL 查询优化 + 索引支持，懒加载非关键数据 | PASS |
| 资源效率 | 无后台服务进程，HTTP 请求驱动 | PASS |
| 懒加载策略 | 路由级别代码分割，列表分页加载 | PASS |

**结论**: 所有门控通过 ✓

## Project Structure

### Documentation (this feature)

```text
specs/1-smb-hr-system/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (this plan)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
backend/
├── src/
│   ├── controllers/     # HTTP 请求处理
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── leaveController.js
│   │   └── reportController.js
│   ├── services/        # 业务逻辑
│   │   ├── authService.js
│   │   ├── leaveService.js
│   │   └── notificationService.js
│   ├── models/          # 数据模型
│   │   ├── db.js        # PostgreSQL 连接池 (pg)
│   │   └── init.js      # 数据库初始化 (migrations)
│   ├── middleware/      # 中间件
│   │   ├── auth.js      # JWT 认证
│   │   └── role.js      # RBAC 权限
│   ├── routes/          # 路由定义
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── leaves.js
│   │   └── reports.js
│   └── utils/           # 工具函数
│       └── logger.js
├── tests/
│   ├── unit/            # 单元测试
│   └── integration/     # 集成测试
└── package.json

frontend/
├── src/
│   ├── components/      # 通用组件
│   │   ├── Button/
│   │   ├── Form/
│   │   ├── Table/
│   │   ├── Modal/
│   │   └── Notification/
│   ├── pages/           # 页面组件
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Employees/
│   │   ├── Leave/
│   │   └── Reports/
│   ├── hooks/           # 自定义 hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── services/        # API 调用
│   │   └── api.js
│   ├── contexts/        # React Context
│   │   └── AuthContext.jsx
│   ├── styles/          # 全局样式
│   │   └── index.css
│   └── App.jsx          # 应用入口
├── tests/
│   ├── unit/            # 组件测试
│   └── setup.js         # 测试配置
├── index.html
└── vite.config.js
```

**Structure Decision**: 采用前后端分离的 Web 应用架构。后端提供 RESTful API，前端使用 React 单页应用，通过 Vite 构建部署。

## Phase 0: Research Decisions

### 技术选型决策

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 后端框架 | Express vs Fastify vs Koa | Express | 生态成熟，文档完善，中间件丰富 |
| 数据库 | SQLite vs PostgreSQL vs MySQL | PostgreSQL | 企业级可靠性、ACID 事务、JSON 支持、扩展性好 |
| 前端框架 | React vs Vue vs Angular | React | 组件化开发、生态环境成熟、团队熟悉 |
| CSS 方案 | TailwindCSS vs styled-components vs CSS Modules | TailwindCSS | 原子化 CSS、响应式快捷、减少样式冲突 |
| 认证方式 | Session vs JWT | JWT | 无状态、可扩展、前后端分离友好 |

### 数据模型关键决策

| 实体 | 主键策略 | 关系 | 说明 |
|------|----------|------|------|
| Employee | UUID | belongsTo Department, belongsTo Manager | 汇报关系指向另一 Employee |
| Department | UUID | hasMany Employees, belongsTo Parent | 支持无限层级部门 |
| LeaveRequest | UUID | belongsTo Employee, approvedBy Manager | 状态机管理生命周期 |

### API 设计原则

- RESTful 风格：`GET /api/employees`, `POST /api/leave-requests`
- 认证：`Authorization: Bearer <token>`
- 错误响应：`{ "error": "message", "code": "ERROR_CODE" }`
- 分页：`?page=1&limit=20`

---

## Phase 1: Design Artifacts

待生成：
- [ ] `data-model.md` - 完整数据模型定义
- [ ] `contracts/openapi.yaml` - OpenAPI 3.0 规范
- [ ] `quickstart.md` - 开发环境搭建指南

## Complexity Tracking

无需复杂性问题记录。所有设计决策均符合简化原则。

---

**Generated**: 2026-01-14
**Next Step**: `/speckit.tasks` - 将计划分解为可执行任务
