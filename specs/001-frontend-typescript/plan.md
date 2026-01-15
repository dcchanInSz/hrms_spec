# Implementation Plan: Convert Frontend to TypeScript

**Branch**: `001-frontend-typescript` | **Date**: 2026-01-15 | **Spec**: [link](spec.md)
**Input**: Feature specification from `/specs/001-frontend-typescript/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将 HRMS 前端项目从 JavaScript 迁移到 TypeScript，实现类型安全和开发体验提升。该项目基于 React 18 和 Vite 构建，包含 41 个 JavaScript/JSX 文件需要转换为 TypeScript/TSX。迁移策略采用渐进式方法，确保所有现有功能保持不变，同时提供完整的类型检查和 IntelliSense 支持。

## Technical Context

**Language/Version**: TypeScript 5.x (从 JavaScript ES2015+ 迁移)
**Primary Dependencies**: React 18.2, Vite 5.0, React Router 6.x, Axios 1.6
**Storage**: N/A (前端应用)
**Testing**: Vitest 1.2, @testing-library/react, ESLint 8.x
**Target Platform**: 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web Application (React SPA with Vite)
**Performance Goals**: 构建时间 <60秒, 热更新 <2秒, 类型检查 <30秒
**Constraints**: 零停机迁移, 保持所有现有功能, 零运行时类型错误
**Scale/Scope**: 41 个源文件, 5 个测试文件, ~20 个组件页面

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality (NON-NEGOTIABLE)**:
- ✅ TypeScript strict mode 提供更强的类型检查
- ✅ 明确的数据类型定义提升代码可读性
- ✅ 减少运行时错误，通过编译时检查
- ⚠️ 需要确保迁移过程中代码风格统一 (通过 ESLint + Prettier)

**Testing Standards (NON-NEGOTIABLE)**:
- ✅ 保持 100% 测试覆盖率要求
- ✅ 测试文件同步迁移到 TypeScript
- ✅ 类型安全提升测试可维护性
- ✅ 测试隔离性不受影响

**User Experience Consistency**:
- ✅ 零 UI/UX 变更
- ✅ 保持现有组件功能不变
- ✅ 性能目标明确：构建和类型检查时间
- ✅ 响应时间保持 <100ms

**Quality Gates**:
- ✅ 所有现有测试通过
- ✅ 无类型错误
- ✅ 构建成功
- ✅ 代码风格检查通过
- ✅ 文档更新

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-typescript/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/       # UI 组件 (.tsx)
│   ├── pages/          # 页面组件 (.tsx)
│   ├── contexts/       # React 上下文 (.tsx)
│   ├── hooks/          # 自定义 hooks (.ts)
│   ├── services/       # API 服务 (.ts)
│   ├── utils/          # 工具函数 (.ts)
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 应用入口
├── tests/              # 测试文件 (.test.tsx)
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置 (.ts)
└── package.json        # 依赖配置

# 对比: JavaScript 迁移前结构
frontend/src/
├── components/       # UI 组件 (.jsx)
├── pages/           # 页面组件 (.jsx)
├── contexts/        # React 上下文 (.jsx)
├── hooks/           # 自定义 hooks (.js)
├── services/        # API 服务 (.js)
├── utils/           # 工具函数 (.js)
└── App.jsx          # 主应用组件
```

**Structure Decision**: 采用单一前端项目结构，使用 React + TypeScript + Vite。保持现有目录结构不变，只更改文件扩展名 (.jsx → .tsx, .js → .ts)，确保最小化迁移影响。

## Phase 0: Outline & Research

### Research Tasks

1. **TypeScript 迁移最佳实践**
   - 渐进式迁移策略 vs 一次性转换
   - React + TypeScript 集成模式
   - tsconfig.json 最佳配置

2. **Vite + TypeScript 集成**
   - Vite 5 TypeScript 支持
   - 热更新优化配置
   - 构建优化策略

3. **类型定义策略**
   - React 组件 props 类型化
   - React Router 类型安全
   - Axios 响应类型定义
   - Context 和 Hook 类型

4. **开发工具配置**
   - ESLint TypeScript 规则
   - Prettier + TypeScript
   - IDE 配置优化

## Phase 1: Design & Contracts

### Data Model Design

需要创建的数据模型:
- **User 类型**: id, name, email, role, department
- **Employee 类型**: employeeId, position, hireDate, manager
- **Leave 类型**: leaveId, type, startDate, endDate, status
- **API 响应类型**: 所有后端 API 响应的 TypeScript 类型

### Contracts

API 契约从现有 JavaScript 实现推断:
- Auth API (login, logout, profile)
- Employee API (CRUD operations)
- Leave API (request, approve, list)
- Department API (manage structure)

### Quick Start

开发者指南:
- 如何运行 TypeScript 项目
- 如何处理类型错误
- 开发工作流说明

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

此迁移没有违反宪法原则，采用的是标准 TypeScript 迁移流程。
