# TypeScript Migration Best Practices for Node.js/Express Backends

## Executive Summary

This document provides comprehensive guidance for migrating a Node.js/Express backend from JavaScript to TypeScript. Based on analysis of the current HR System backend (Express 4.18.2, PostgreSQL, JWT, Jest testing), this guide covers configuration, dependencies, migration strategy, development workflow, testing, and build optimization.

---

## 1. TypeScript Configuration (tsconfig.json)

### Recommended Base Configuration

Create a `tsconfig.json` in the backend root directory:

```json
{
  "compilerOptions": {
    /* Basic Options */
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,

    /* Module Resolution */
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@routes/*": ["src/routes/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@tests/*": ["tests/*"]
    },
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,

    /* Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,

    /* Emit */
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    /* Advanced */
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "coverage"]
}
```

### Configuration Explanation

#### Target ES Version: ES2020
- **Recommendation**: ES2020 or ES2022
- **Why**: Modern Node.js versions (14+) have excellent ES2020 support
- **Benefits**:
  - Optional chaining (`?.`)
  - Nullish coalescing (`??`)
  - Dynamic imports
  - Better async/await support
  - Public/private class fields

#### Module System: CommonJS
- **Current Setup**: Keep `commonjs` for compatibility with existing Express setup
- **Alternative**: ES modules (`"module": "ESNext"`) for future-proofing
- **Migration Path**: Start with CommonJS, migrate to ES modules later

#### Path Mapping
- **Purpose**: Clean, maintainable imports
- **Benefits**:
  - No relative path nightmares (`../../../utils`)
  - Easier refactoring
  - Better IDE support
- **Setup**: Requires `tsconfig.json` paths + module resolution config

#### Strict Mode Settings
```json
{
  "strict": true,                    // Enables all strict checking
  "noImplicitAny": true,            // Error on implicit any types
  "strictNullChecks": true,         // Explicit null/undefined handling
  "noImplicitReturns": true,         // Ensure all code paths return
  "noUnusedLocals": true,           // Catch unused variables
  "noUnusedParameters": true        // Catch unused parameters
}
```

---

## 2. Type Definitions for Dependencies

### Required Type Packages

Update `package.json` dependencies section:

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/pg": "^8.10.9",
    "@types/uuid": "^9.0.7",
    "@types/jest": "^29.5.11",
    "@types/supertest": "^2.0.16",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "ts-jest": "^29.1.1",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "@typescript-eslint/parser": "^6.16.0"
  }
}
```

### Type Definition Details

#### Express Types
```typescript
// @types/express provides built-in types
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Usage in route handlers
app.get('/api/profile', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // req.user is properly typed
});
```

#### PostgreSQL Types
```typescript
// @types/pg provides QueryResult<R> for type-safe queries
import { Pool, PoolClient, QueryResult } from 'pg';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  created_at: Date;
}

// Type-safe query result
const result: QueryResult<Employee> = await pool.query(
  'SELECT * FROM employees WHERE id = $1',
  [employeeId]
);

// Access with type safety
const employee: Employee = result.rows[0]; // Fully typed
```

#### JWT Types
```typescript
// @types/jsonwebtoken provides JWT types
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Type-safe token operations
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
```

#### Bcrypt Types
```typescript
// @types/bcrypt provides string | undefined for hash/salt
import bcrypt from 'bcrypt';

// Type-safe hashing
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash; // Type: string
};

const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

---

## 3. Migration Strategy

### Step-by-Step Approach

#### Phase 1: Setup (1-2 days)
1. Install TypeScript and type definitions
2. Create `tsconfig.json`
3. Configure build scripts
4. Set up linting rules for TypeScript

#### Phase 2: Core Infrastructure (3-5 days)
1. Convert `src/app.js` to `src/app.ts`
2. Type middleware and utility functions
3. Convert database models
4. Type configuration files

#### Phase 3: Routes & Controllers (5-7 days)
1. Convert route handlers to TypeScript
2. Define Request/Response types
3. Implement proper error handling with types
4. Add input validation with type safety

#### Phase 4: Testing (3-5 days)
1. Configure Jest for TypeScript
2. Convert test files to TypeScript
3. Implement type-safe mocking
4. Add integration test types

#### Phase 5: Polish & Optimize (2-3 days)
1. Review and fix type errors
2. Optimize build process
3. Enable strict mode settings
4. Add declaration files

### File Extension Strategy

#### Use `.ts` for:
- Application code (routes, models, middleware)
- Utility functions
- Configuration files
- Type definitions

#### Use `.tsx` ONLY for:
- React components (if added to backend for SSR)
- Files with JSX syntax

#### Keep `.js` for:
- Configuration files that don't need types (jest.config.js, nodemon.js)
- Build scripts (if not type-sensitive)

### Handling CommonJS to ES Modules Migration

#### Option 1: Keep CommonJS (Recommended for Migration)
```typescript
// current-app.js → current-app.ts
const express = require('express');
const cors = require('cors');

module.exports = app;
// or
exports.handler = (req, res) => { ... };
```

#### Option 2: Gradual Migration to ES Modules
```typescript
// Step 1: Use import with CommonJS
import express = require('express');
const app = express();
export default app;

// Step 2: Pure ES modules (when ready)
import express from 'express';
const app = express();
export default app;
```

#### Updated tsconfig for ES Modules:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### Type Annotation Best Practices

#### 1. Function Parameters and Return Types
```typescript
// ❌ Bad: Implicit any
app.get('/api/users', (req, res) => {
  const { page, limit } = req.query;
  return res.json(getUsers(page, limit));
});

// ✅ Good: Explicit types
app.get(
  '/api/users',
  (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 10;

    return res.json(getUsers(parsedPage, parsedLimit));
  }
);

// With custom types
app.get(
  '/api/users',
  async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
);
```

#### 2. Interface Definitions
```typescript
// Define interfaces for request/response
interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
}

interface CreateUserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

// Use in route handler
app.post(
  '/api/users',
  async (
    req: Request<{}, CreateUserResponse, CreateUserRequest>,
    res: Response<CreateUserResponse>
  ) => {
    const userData = req.body;

    try {
      const user = await userService.create(userData);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);
```

#### 3. Database Models
```typescript
// models/User.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  departmentId?: string;
}
```

---

## 4. Development Workflow

### Recommended npm Scripts

Update `package.json` scripts section:

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "dev": "nodemon --exec ts-node src/app.ts",
    "dev:tsc": "ts-node src/app.ts",
    "start": "node dist/app.js",
    "start:prod": "NODE_ENV=production node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

### ts-node Development Setup

#### Install ts-node
```bash
npm install --save-dev ts-node nodemon
```

#### Create nodemon.json
```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.spec.ts", "src/**/*.test.ts"],
  "exec": "ts-node src/app.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

#### tsconfig for Development (tsconfig.dev.json)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "module": "commonjs"
  }
}
```

### Watch Mode Strategies

#### 1. Type-Check Only (Fast)
```bash
# Continuous type checking without compilation
npm run type-check:watch
```

#### 2. Full Rebuild on Change
```bash
# Rebuild on every change
npm run build:watch
```

#### 3. Run with ts-node
```bash
# Direct execution without compilation
npm run dev
```

### Development vs Production Workflow

#### Development
```bash
# Quick iteration with ts-node
npm run dev

# Or with type checking
npm run dev & npm run type-check:watch
```

#### Production Build
```bash
# Compile TypeScript
npm run build

# Run compiled JavaScript
npm start

# Or in production mode
npm run start:prod
```

---

## 5. Testing with TypeScript

### Jest Configuration for TypeScript

#### Create jest.config.ts
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/app.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;
```

#### Update package.json Jest Config
```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/src", "<rootDir>/tests"],
    "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    "moduleFileExtensions": ["ts", "js", "json"],
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/app.ts",
      "!src/**/*.d.ts"
    ]
  }
}
```

### Type-Safe Testing Patterns

#### 1. Unit Testing with Type Safety
```typescript
// tests/unit/userService.test.ts
import { UserService } from '@/services/UserService';
import { mock } from 'jest-mock-extended';

describe('UserService', () => {
  let userService: UserService;
  let mockDb: ReturnType<typeof mock>;

  beforeEach(() => {
    mockDb = mock();
    userService = new UserService(mockDb);
  });

  it('should create user with valid data', async () => {
    // Arrange
    const userData: CreateUserInput = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      departmentId: 'dept-123',
      password: 'SecurePass123!',
    };

    mockDb.query.mockResolvedValue({
      rows: [{ id: 'user-123', ...userData }],
      rowCount: 1,
    } as any);

    // Act
    const result = await userService.create(userData);

    // Assert
    expect(result.id).toBe('user-123');
    expect(result.email).toBe(userData.email);
    expect(result.password).toBeUndefined(); // Should not return password
  });

  it('should throw error for invalid email', async () => {
    // Type-safe error assertion
    const invalidData = {
      email: 'invalid-email',
      firstName: 'John',
      lastName: 'Doe',
      departmentId: 'dept-123',
      password: 'SecurePass123!',
    };

    await expect(userService.create(invalidData))
      .rejects
      .toThrow('Invalid email format');
  });
});
```

#### 2. Integration Testing with Supertest
```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '@/app';

describe('Auth API', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('POST /api/auth/login', () => {
    it('should return JWT token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123!',
        })
        .expect(200);

      // Type-safe assertions
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

#### 3. Mocking with TypeScript
```typescript
// tests/mocks/userRepository.mock.ts
export class MockUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const user: User = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // More type-safe mock implementations...
}
```

### Type-Safe Mock Setup
```typescript
import { jest } from '@jest/globals';

interface MockDb {
  query: jest.MockedFunction<(text: string, params?: any[]) => Promise<any>>;
  connect: jest.MockedFunction<() => Promise<any>>;
}

const createMockDb = (): MockDb => ({
  query: jest.fn(),
  connect: jest.fn(),
});

// Usage
const mockDb = createMockDb();
mockDb.query.mockResolvedValue({ rows: [], rowCount: 0 });
```

---

## 6. Build Process

### TypeScript Compilation

#### Basic Build
```bash
# Compile TypeScript to JavaScript
tsc

# Output goes to 'dist' directory as configured in tsconfig.json
```

#### Build Options
```bash
# Watch mode - rebuild on changes
tsc --watch

# Emit declaration files
tsc --declaration

# Emit source maps
tsc --sourceMap

# Clean build
tsc --build --clean && tsc
```

### Build Output Structure

```
backend/
├── src/
│   ├── app.ts
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── dist/                    # Compiled output
│   ├── app.js              # Compiled app
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── coverage/                # Test coverage
└── tsconfig.json
```

### Build Optimization

#### Incremental Builds
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  }
}
```

#### Project References (for large codebases)
```json
{
  "files": [],
  "references": [
    { "path": "./src" },
    { "path": "./tests" }
  ]
}
```

#### Tree Shaking Support
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020",
    "outDir": "./dist",
    "declaration": true
  }
}
```

### Docker Integration

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/app.js"]
```

#### .dockerignore
```
node_modules
npm-debug.log
dist
coverage
.tsbuildinfo
*.map
.env
.git
```

### Build Scripts in package.json

```json
{
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "tsc",
    "postbuild": "cp -r src/templates dist/ 2>/dev/null || true",
    "build:check": "tsc --noEmit"
  }
}
```

### Source Maps for Debugging

#### tsconfig.json
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "declarationMap": true,
    "inlineSourceMap": false,
    "mapRoot": "./"
  }
}
```

#### VS Code Debug Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "cwd": "${workspaceFolder}",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/app.ts"],
      "protocol": "inspector",
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

## 7. ESLint Configuration for TypeScript

### Install ESLint for TypeScript
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-const": "error"
  },
  "ignorePatterns": ["dist/", "node_modules/", "coverage/"]
}
```

---

## 8. Path Mapping Setup

### tsconfig.json Path Configuration
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@routes/*": ["src/routes/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@tests/*": ["tests/*"]
    }
  }
}
```

### Module Resolver Configuration

#### Option 1: TypeScript built-in (Recommended)
```typescript
// tsconfig.json already configured with paths
import { User } from '@models/User';
import { authMiddleware } from '@middleware/auth';
```

#### Option 2: tsconfig-paths (Alternative)
```bash
npm install --save-dev tsconfig-paths
```

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": { /* ... */ }
  }
}
```

```typescript
// In app.ts or main entry
import 'tsconfig-paths/register';
```

---

## 9. Practical Migration Example

### Converting app.js to app.ts

#### Before (app.js)
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

#### After (app.ts)
```typescript
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Import routes with path mapping
import authRoutes from '@/routes/auth';
import employeeRoutes from '@/routes/employees';

// Type definitions
interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
}

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get(
  '/health',
  (req: Request, res: Response<HealthResponse>) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// 404 handler
app.use(
  (req: Request, res: Response<ErrorResponse>) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
    });
  }
);

// Error handler
app.use(
  (err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
export { server };
```

---

## 10. Migration Checklist

### Pre-Migration
- [ ] Install TypeScript: `npm install --save-dev typescript @types/node @types/express`
- [ ] Install type definitions for all dependencies
- [ ] Create tsconfig.json with recommended settings
- [ ] Update package.json scripts for TypeScript
- [ ] Install and configure ESLint for TypeScript
- [ ] Set up ts-node for development

### Phase 1: Infrastructure
- [ ] Convert src/app.js → src/app.ts
- [ ] Type all middleware functions
- [ ] Create type definitions for Request/Response
- [ ] Update configuration files to TypeScript

### Phase 2: Core Features
- [ ] Convert database models to TypeScript
- [ ] Type all route handlers
- [ ] Implement proper error handling with types
- [ ] Add input validation types

### Phase 3: Testing
- [ ] Configure Jest for TypeScript
- [ ] Convert all test files to .ts
- [ ] Implement type-safe mocking
- [ ] Add integration test types

### Phase 4: Optimization
- [ ] Enable strict mode
- [ ] Fix all type errors
- [ ] Optimize build process
- [ ] Set up source maps for debugging
- [ ] Configure Docker for TypeScript builds

### Post-Migration
- [ ] Run full test suite
- [ ] Check for type errors: `npm run type-check`
- [ ] Build production bundle: `npm run build`
- [ ] Update documentation
- [ ] Train team on TypeScript best practices

---

## 11. Common Pitfalls & Solutions

### Pitfall 1: Implicit Any Types
```typescript
// ❌ Problem: Using 'any' defeats TypeScript's purpose
const processData = (data: any) => {
  return data.items.map((item: any) => item.value);
};

// ✅ Solution: Define proper interfaces
interface DataItem {
  id: string;
  value: string;
}

interface DataResponse {
  items: DataItem[];
}

const processData = (data: DataResponse): DataItem[] => {
  return data.items.map((item) => ({
    id: item.id,
    value: item.value,
  }));
};
```

### Pitfall 2: Overusing 'as' Type Assertion
```typescript
// ❌ Problem: Blind type assertion
const user = JSON.parse(jsonString) as User;

// ✅ Solution: Type guard
const isUser = (obj: any): obj is User => {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string';
};

const user = JSON.parse(jsonString);
if (isUser(user)) {
  // user is now properly typed
}
```

### Pitfall 3: Not Handling Null/Undefined
```typescript
// ❌ Problem: Unsafe access
const userName = user?.name.toUpperCase(); // If name is undefined?

// ✅ Solution: Null-safe operations
const userName = user?.name?.toUpperCase() ?? 'Anonymous';

// Or with validation
const getDisplayName = (user: User | null): string => {
  if (!user || !user.name) return 'Anonymous';
  return user.name.toUpperCase();
};
```

### Pitfall 4: Circular Dependencies
```typescript
// ❌ Problem: Circular dependency
// userService.ts
import { UserRepository } from './UserRepository';
export class UserService {
  constructor(private repo: UserRepository) {}
}

// UserRepository.ts
import { UserService } from './UserService';
export class UserRepository {
  constructor(private service: UserService) {} // Circular!
}

// ✅ Solution: Use interface decoupling
// userService.ts
import { UserRepository } from './UserRepository';
export class UserService {
  constructor(private repo: UserRepository) {}
}

// UserRepository.ts
// No dependency on UserService
export class UserRepository {
  // Implementation
}
```

---

## 12. Resources & References

### Official Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js TypeScript Tutorial](https://nodejs.org/en/docs/guides/typescript/)
- [Express TypeScript Guide](https://expressjs.com/en/starter/installing.html)

### Useful Tools
- [ts-node](https://github.com/TypeStrong/ts-node) - Run TypeScript directly
- [nodemon](https://nodemon.io/) - Auto-restart on file changes
- [ts-jest](https://github.com/kulshekhar/ts-jest) - Jest support for TypeScript
- [typescript-eslint](https://typescript-eslint.io/) - ESLint for TypeScript

### Best Practices Resources
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) (applicable patterns)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Conclusion

Migrating from JavaScript to TypeScript provides significant benefits for maintainability, developer experience, and code quality. This guide provides a comprehensive roadmap for successfully migrating the HR System backend to TypeScript while minimizing disruption and maximizing benefits.

The key to successful migration is:
1. **Start with proper configuration** - A well-configured tsconfig.json is essential
2. **Migrate incrementally** - Convert modules one at a time
3. **Use strict mode** - Enable all TypeScript checks for maximum safety
4. **Define clear types** - Invest time in good interface definitions
5. **Test thoroughly** - Ensure type safety doesn't break functionality

By following this guide, the migration should take 2-3 weeks for a small-to-medium backend like the HR System, resulting in a more maintainable and type-safe codebase.
