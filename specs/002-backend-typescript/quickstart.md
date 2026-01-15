# Quickstart Guide: Convert Backend to TypeScript

**Feature**: Convert Backend to TypeScript
**Created**: 2026-01-15
**Version**: 1.0
**Estimated Time**: 2-3 weeks

## Overview

This guide provides step-by-step instructions for migrating the HR System backend from JavaScript to TypeScript. Follow these instructions to successfully convert the codebase while maintaining functionality and improving type safety.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- VS Code or compatible IDE with TypeScript support

## Phase 1: Setup TypeScript Foundation (Day 1)

### Step 1: Install TypeScript Dependencies

Navigate to the backend directory and install TypeScript and type definitions:

```bash
cd backend

# Install TypeScript and compiler
npm install --save-dev typescript @types/node

# Install type definitions for existing dependencies
npm install --save-dev @types/express @types/bcrypt @types/cors @types/jsonwebtoken @types/pg @types/uuid @types/jest @types/supertest

# Install additional tools
npm install --save-dev ts-node ts-node-dev nodemon

# Install ESLint for TypeScript
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Step 2: Create TypeScript Configuration

Create `tsconfig.json` in the backend root:

```bash
cat > tsconfig.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@models/*": ["./src/models/*"],
      "@services/*": ["./src/services/*"],
      "@routes/*": ["./src/routes/*"],
      "@middleware/*": ["./src/middleware/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["./src/**/*"],
  "exclude": ["./node_modules", "./dist", "./tests"]
}
EOF
```

### Step 3: Update package.json Scripts

Add TypeScript scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "type-check": "tsc --noEmit",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/ --ext .ts",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean"
  }
}
```

### Step 4: Create TypeScript Type Declarations

Create `src/types/express.d.ts` for Express type extensions:

```typescript
// src/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        department?: string;
      };
      tenantId?: string;
    }
  }
}

export {};
```

### Step 5: Test Initial Setup

Verify TypeScript installation:

```bash
# Type check (should show no errors initially)
npm run type-check

# Compile (should create dist/ directory)
npm run build
```

If successful, proceed to Phase 2.

## Phase 2: Migrate Core Files (Days 2-5)

### Step 1: Convert app.js to app.ts

Convert the main application file:

```bash
# Rename file
mv src/app.js src/app.ts

# Update imports in src/app.ts
# Change: const express = require('express');
# To: import express from 'express';
```

Example conversion:

```typescript
// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';
import { auditLog } from './middleware/audit';
import { rateLimiter } from './middleware/rateLimit';
import { securityHeaders } from './middleware/securityHeaders';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Apply global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(securityHeaders);
app.use(auditLog);

// ... rest of the file
```

### Step 2: Convert Models

Convert model files one by one, starting with `src/models/db.js`:

```bash
mv src/models/db.js src/models/db.ts

# Update to use import syntax
```

Example conversion:

```typescript
// src/models/db.ts
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
});

export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export default pool;
```

### Step 3: Convert Services

Convert service files:

```bash
# Example: Employee Service
mv src/services/employeeService.js src/services/employeeService.ts

# Update imports and add types
```

Example conversion:

```typescript
// src/services/employeeService.ts
import db from '../models/db';
import { Employee } from '../types/models';

export class EmployeeService {
  async findAll(): Promise<Employee[]> {
    const result = await db.query('SELECT * FROM employees WHERE employment_status = $1', ['active']);
    return result.rows;
  }

  async findById(id: string): Promise<Employee | null> {
    const result = await db.query('SELECT * FROM employees WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const result = await db.query(
      'INSERT INTO employees (first_name, last_name, email, department_id, position_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.departmentId, employeeData.positionId]
    );
    return result.rows[0];
  }

  // ... other methods
}

export default new EmployeeService();
```

### Step 4: Add Type Definitions

Create type definitions for your models:

```bash
mkdir -p src/types/models

# Create Employee type
cat > src/types/models/Employee.ts << 'EOF'
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  employmentStatus: 'active' | 'inactive' | 'terminated';
  salary?: number;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF
```

### Step 5: Test Compilation

After each conversion:

```bash
# Check for type errors
npm run type-check

# Compile to verify everything works
npm run build
```

Fix any type errors before proceeding.

## Phase 3: Migrate Routes and Middleware (Days 6-10)

### Step 1: Convert Middleware

Convert middleware files:

```bash
# Example: Auth middleware
mv src/middleware/auth.js src/middleware/auth.ts

# Add proper typing
```

Example conversion:

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/jwt';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
```

### Step 2: Convert Routes

Convert route handlers:

```bash
# Example: Auth routes
mv src/routes/auth.js src/routes/auth.ts
```

Example conversion:

```typescript
// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/db';
import { UserPayload } from '../types/jwt';

const router = Router();

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '24h'
    });

    res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

## Phase 4: Update Tests (Days 11-14)

### Step 1: Configure Jest for TypeScript

Update `package.json` Jest configuration:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/src", "<rootDir>/tests"],
    "testMatch": ["**/__tests__/**/*.ts", "**/*.(test|spec).ts"],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/**/*.d.ts",
      "!src/**/*.test.ts"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    }
  }
}
```

### Step 2: Convert Test Files

```bash
# Rename and convert test files
mv tests/auth.test.js tests/auth.test.ts
```

Example conversion:

```typescript
// tests/auth.test.ts
import request from 'supertest';
import express from 'express';
import authRouter from '../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  describe('POST /auth/login', () => {
    it('should return 200 for valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

## Phase 5: Final Integration (Days 15-21)

### Step 1: Update Development Workflow

Create `nodemon.json` for development:

```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.spec.ts", "src/**/*.test.ts"],
  "exec": "ts-node-dev --respawn --transpile-only src/app.ts"
}
```

### Step 2: Configure ESLint

Update `.eslintrc.json`:

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  },
  "ignorePatterns": ["dist/", "node_modules/"]
}
```

### Step 3: Build and Test

```bash
# Full build
npm run build

# Run type checking
npm run type-check

# Run tests
npm test

# Run linter
npm run lint

# Start development server
npm run dev
```

### Step 4: Verify Success Criteria

Check each success criterion:

```bash
# SC-001: Check file extensions
find src -name "*.js" | wc -l
# Should return 0

# SC-002: Check compilation time
time npm run build
# Should complete in < 10 seconds

# SC-003: Type checking performance
tsc --noEmit --watch
# Should respond in < 1 second

# SC-005: Test TypeScript in CI/CD
# Add to CI pipeline:
npm run type-check
npm run build
npm test
```

## Common Issues and Solutions

### Issue 1: "Cannot find module" errors

**Solution**: Update import paths or configure `tsconfig.json` paths correctly:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 2: Type errors with require()

**Solution**: Replace `require()` with `import`:

```typescript
// Instead of:
const module = require('module');

// Use:
import module from 'module';
// or
import * as module from 'module';
```

### Issue 3: Database query result typing

**Solution**: Use generic typing:

```typescript
const result = await db.query<Employee>('SELECT * FROM employees WHERE id = $1', [id]);
```

### Issue 4: Express middleware typing

**Solution**: Use proper middleware typing:

```typescript
import { Request, Response, NextFunction } from 'express';

const middleware = (req: Request, res: Response, next: NextFunction): void => {
  // middleware logic
  next();
};
```

## Performance Optimization

### Enable Incremental Builds

Already configured in `tsconfig.json`:

```json
{
  "incremental": true,
  "tsBuildInfoFile": "./dist/.tsbuildinfo"
}
```

### Configure Watch Mode

```bash
# Type checking only
tsc --noEmit --watch

# Full rebuild on change
ts-node-dev --watch src src/app.ts
```

## Deployment

### Production Build

```bash
# Clean build
npm run clean
npm run build

# Test production build
npm run start
```

### Docker Configuration

Update `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

## Rollback Plan

If issues arise, rollback can be done by:

1. **Revert TypeScript installation**:
```bash
npm uninstall typescript @types/node @types/express @types/bcrypt @types/cors @types/jsonwebtoken @types/pg @types/uuid @types/jest @types/supertest
```

2. **Rename files back to .js**:
```bash
find src -name "*.ts" -exec bash -c 'mv "$1" "${1%.ts}.js"' _ {} \;
```

3. **Revert package.json scripts**

4. **Remove tsconfig.json**:
```bash
rm tsconfig.json
```

## Next Steps

After successful migration:

1. **Enable Strict Mode**: Gradually enable stricter TypeScript rules
2. **Add Custom Type Guards**: Implement runtime type checking
3. **Generate API Documentation**: Use TypeScript types for API docs
4. **Optimize Imports**: Remove unused imports and dead code
5. **Add Unit Tests**: Increase test coverage to 100%

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express TypeScript Guide](https://expressjs.com/en/guide/typescript.html)
- [Jest with TypeScript](https://jestjs.io/docs/typescript)
- [ts-node-dev Documentation](https://github.com/whitecolor/ts-node-dev)

## Support

For issues during migration:

1. Check TypeScript compilation errors
2. Review `research.md` for best practices
3. Consult `contracts/typescript-config.md` for configuration details
4. Verify all success criteria are met

---

**Document Version**: 1.0
**Last Updated**: 2026-01-15
**Next Review**: After migration completion
