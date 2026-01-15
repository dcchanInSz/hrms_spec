# 小企业人力资源管理系统 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-15

## Active Technologies

- Node.js 18+ (1-smb-hr-system)
- Express 4.x (1-smb-hr-system)
- TypeScript 5.x (002-backend-typescript)
- PostgreSQL (1-smb-hr-system)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

```bash
cd backend
npm run type-check    # TypeScript type checking
npm run build         # Compile TypeScript to JavaScript
npm run dev          # Start development server with TypeScript
npm test; npm run lint

cd frontend
npm test; npm run lint
```

## Code Style

Node.js/JavaScript/TypeScript: Follow standard conventions with strict type safety
TypeScript: Enable strict mode, avoid implicit any types, use explicit type annotations

## Recent Changes

- 002-backend-typescript: Added TypeScript 5.x support for backend migration
- 1-smb-hr-system: Added Node.js + Express + PostgreSQL

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
