# Quick Start Guide: Frontend TypeScript Migration

**Date**: 2026-01-15
**Feature**: Convert Frontend to TypeScript
**Branch**: 001-frontend-typescript

## Overview

本文档提供了 HRMS 前端项目 TypeScript 迁移的快速入门指南，帮助开发团队理解迁移过程和开发工作流。

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Migration Workflow](#migration-workflow)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)
7. [Resources](#resources)

---

## Prerequisites

### Required Software

- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **TypeScript**: 5.x（将通过 npm 安装）

### Recommended Tools

- **IDE**: Visual Studio Code
- **Extensions**:
  - TypeScript Importer
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - TypeScript Hero

### System Requirements

- **内存**: 建议 8GB 以上
- **存储**: 项目编译后需要额外 ~200MB 空间
- **网络**: 用于下载依赖包

---

## Development Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Install TypeScript

```bash
npm install --save-dev typescript
```

### Step 3: Install Type Definitions

```bash
# Core type definitions
npm install --save-dev @types/react @types/react-dom @types/node

# React Router type definitions
npm install --save-dev @types/react-router-dom

# Axios type definitions
npm install --save-dev @types/axios

# Additional type definitions
npm install --save-dev @vitejs/plugin-react
```

### Step 4: Create TypeScript Configuration

创建 `tsconfig.json` 文件：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 5: Update ESLint Configuration

更新 `.eslintrc.json`：

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## Migration Workflow

### Phase 1: Create Type Definitions

#### 1. Create Types Directory

```bash
mkdir -p src/types
```

#### 2. Create Base Type Files

**src/types/api.ts** - API 相关类型
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
}

// 更多类型定义...
```

**src/types/components.ts** - 组件 Props 类型
```typescript
import { ReactNode } from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}

// 更多组件类型...
```

**src/types/context.ts** - Context 类型
```typescript
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// 更多 Context 类型...
```

### Phase 2: Migrate Files

#### Migration Order

按依赖顺序迁移文件：

1. **首先迁移工具函数**
   ```bash
   # 迁移前
   src/utils/validation.js

   # 迁移后
   src/utils/validation.ts
   ```

2. **然后迁移 API 服务**
   ```bash
   # 迁移前
   src/services/api.js

   # 迁移后
   src/services/api.ts
   ```

3. **迁移自定义 Hooks**
   ```bash
   # 迁移前
   src/hooks/useAuth.js

   # 迁移后
   src/hooks/useAuth.ts
   ```

4. **迁移 Context Providers**
   ```bash
   # 迁移前
   src/contexts/AuthContext.jsx

   # 迁移后
   src/contexts/AuthContext.tsx
   ```

5. **迁移组件**
   ```bash
   # 迁移前
   src/components/Button/index.jsx

   # 迁移后
   src/components/Button/index.tsx
   ```

6. **迁移页面组件**
   ```bash
   # 迁移前
   src/pages/Login/index.jsx

   # 迁移后
   src/pages/Login/index.tsx
   ```

7. **最后迁移主应用**
   ```bash
   # 迁移前
   src/App.jsx

   # 迁移后
   src/App.tsx
   ```

### Phase 3: File-by-File Conversion

#### Convert a JSX File to TSX

**Before (App.jsx)**:
```jsx
import { useState } from 'react';
import Button from './components/Button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}

export default App;
```

**After (App.tsx)**:
```tsx
import { useState } from 'react';
import Button from './components/Button';

function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}

export default App;
```

#### Add Type Annotations

**Before (Button/index.jsx)**:
```jsx
function Button({ variant = 'primary', onClick, children }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

**After (Button/index.tsx)**:
```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  onClick,
  children,
  ...props
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

#### Convert Context

**Before (AuthContext.jsx)**:
```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // implementation
  };

  const value = {
    user,
    loading,
    login,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**After (AuthContext.tsx)**:
```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string): Promise<void> => {
    // implementation
  };

  const logout = (): void => {
    // implementation
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Common Tasks

### Running Development Server

```bash
cd frontend
npm run dev
```

### Building for Production

```bash
cd frontend
npm run build
```

### Type Checking

```bash
cd frontend
npx tsc --noEmit
```

### Linting

```bash
cd frontend
npm run lint
```

### Running Tests

```bash
cd frontend
npm test
```

### Fix Type Errors

```bash
# Check for type errors
npx tsc --noEmit

# Auto-fix some issues
npm run lint -- --fix
```

---

## Troubleshooting

### Issue 1: Cannot find module

**Problem**:
```
TS2307: Cannot find module './components/Button' or its corresponding type declarations.
```

**Solution**:
确保文件扩展名正确：
```typescript
// ❌ Wrong
import Button from './components/Button';

// ✅ Correct
import Button from './components/Button/index';
```

或创建 `index.ts` 文件导出：
```typescript
// src/components/Button/index.ts
export { default } from './Button';
```

### Issue 2: Type 'any' is not allowed

**Problem**:
```
TS7016: Parameter 'props' implicitly has an 'any' type.
```

**Solution**:
添加类型注解：
```typescript
// ❌ Wrong
function Button(props) {
  return <button>{props.children}</button>;
}

// ✅ Correct
interface ButtonProps {
  children: React.ReactNode;
}

function Button(props: ButtonProps) {
  return <button>{props.children}</button>;
}
```

### Issue 3: JSX element type does not have any construct or call signatures

**Problem**:
```
TS2607: JSX element type 'Component' does not have any construct or call signatures.
```

**Solution**:
确保组件正确导出：
```typescript
// ❌ Wrong
export default function Button() {}

// ✅ Correct
const Button: React.FC = () => {};
export default Button;
```

### Issue 4: Property does not exist on type

**Problem**:
```
TS2339: Property 'history' does not exist on type 'PropsWithChildren'.
```

**Solution**:
使用 React Router 的类型：
```typescript
// ✅ Correct
import { useNavigate, useParams } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  const params = useParams();
}
```

### Issue 5: Circular Dependencies

**Problem**:
```
TS2304: Cannot find name 'User' or its corresponding type declarations.
```

**Solution**:
重构代码结构，避免循环依赖：
```typescript
// 创建单独的类型文件
// src/types/index.ts
export * from './api';
export * from './components';
export * from './context';

// 使用绝对路径导入
import { User } from '@/types';
```

---

## Best Practices

### 1. Type Annotations

✅ **DO**:
```typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
```

❌ **DON'T**:
```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
```

### 2. Interface vs Type

✅ **DO**:
```typescript
// Interface for object shapes
interface User {
  id: number;
  name: string;
}

// Type for unions and primitives
type Status = 'active' | 'inactive';
type ID = number | string;
```

### 3. Optional vs Undefined

✅ **DO**:
```typescript
interface Props {
  required: string;
  optional?: string;  // Undefined is allowed
}
```

❌ **DON'T**:
```typescript
interface Props {
  required: string;
  optional: string | undefined;  // Redundant
}
```

### 4. Array and Object Types

✅ **DO**:
```typescript
const users: User[] = [];
const userMap: Record<string, User> = {};
const optionalArray: number[] | undefined = undefined;
```

❌ **DON'T**:
```typescript
const users: Array<User> = [];
const userMap: { [key: string]: User } = {};
const optionalArray: (number)[] | undefined = undefined;
```

### 5. Function Return Types

✅ **DO**:
```typescript
const add = (a: number, b: number): number => {
  return a + b;
};

const fetchData = async (): Promise<User> => {
  const response = await api.get('/user');
  return response.data;
};
```

### 6. Event Handlers

✅ **DO**:
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  console.log(event.currentTarget);
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(event.target.value);
};
```

### 7. Component Props

✅ **DO**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### 8. Avoid 'any'

✅ **DO**:
```typescript
// Use unknown first, then narrow
const handleData = (data: unknown): User => {
  if (typeof data === 'object' && data !== null) {
    return data as User;
  }
  throw new Error('Invalid data');
};

// Use specific types
const handleConfig = (config: Record<string, string>): void => {
  // implementation
};
```

❌ **DON'T**:
```typescript
const handleData = (data: any): any => {
  return data.user;
};
```

---

## Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheets](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript + React](https://react.dev/learn/typescript)

### Tools

- [TypeScript Playground](https://www.typescriptlang.org/play/)
- [TSX](https://www.npmjs.com/package/tsx) - Run TypeScript directly
- [ts-node](https://www.npmjs.com/package/ts-node) - TypeScript execution

### Useful Commands

```bash
# Check TypeScript version
npx tsc --version

# Watch mode for type checking
npx tsc --watch

# Generate types from JSON schema
npx quicktype --src schema.json --out types.ts

# Find unused variables
npx tsc --noUnusedLocals --noUnusedParameters
```

### Migration Checklist

- [ ] Install TypeScript and type definitions
- [ ] Create tsconfig.json
- [ ] Update ESLint configuration
- [ ] Create type definition files
- [ ] Migrate files in dependency order
- [ ] Add type annotations
- [ ] Fix type errors
- [ ] Run tests
- [ ] Update documentation
- [ ] Enable strict mode

---

## Support

如需帮助，请：

1. 检查 [Troubleshooting](#troubleshooting) 章节
2. 查看 TypeScript 文档
3. 联系开发团队

---

**Last Updated**: 2026-01-15
**Version**: 1.0.0
