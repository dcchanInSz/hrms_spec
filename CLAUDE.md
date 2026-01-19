# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 小企业人力资源管理系统 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-16

## Active Technologies

- Node.js 18+ (1-smb-hr-system)
- Express 4.x (1-smb-hr-system)
- TypeScript 5.x (002-backend-typescript)
- TypeScript 5.x (001-frontend-typescript)
- PostgreSQL (1-smb-hr-system)

## Project Structure

```text
hrms_spec/
├── backend/                 # Node.js + Express + PostgreSQL API
│   ├── src/
│   │   ├── controllers/    # HTTP request handlers (auto-generated from routes)
│   │   ├── middleware/     # Express middleware (auth, role, error, etc.)
│   │   ├── models/         # Data models (Employee, Department, etc.)
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # Utility functions (jwt, password, etc.)
│   │   └── types/          # TypeScript type definitions
│   ├── scripts/            # Migration and seed scripts
│   ├── tests/              # Test files
│   └── .github/workflows/  # CI/CD workflows
│
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/      # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── .github/workflows/ # CI/CD workflows
│
├── .github/                # Global GitHub workflows
└── specs/                   # Feature specifications
```

## Architecture Overview

### Backend (Node.js + Express + TypeScript)

**Layered Architecture:**
- **Routes** (`src/routes/`): Define API endpoints and delegate to services
- **Services** (`src/services/`): Contain business logic and data validation
- **Models** (`src/models/`): Data models and database interactions
- **Middleware** (`src/middleware/`): Cross-cutting concerns (auth, logging, etc.)

**Key Features:**
- JWT-based authentication
- Role-based access control (HR, Manager, Employee)
- PostgreSQL database with connection pooling
- Comprehensive security middleware (Helmet, CORS, rate limiting)
- Audit logging for all API requests
- SQL injection protection

**API Endpoints:**
- `/api/auth/*` - Authentication (login, logout, profile)
- `/api/employees/*` - Employee management
- `/api/leaves/*` - Leave management
- `/api/teams/*` - Team management (managers)
- `/api/admin/*` - HR admin functions
- `/api/reports/*` - Reporting and analytics
- `/api/paystubs/*` - Payroll management
- `/api/notifications/*` - Notification system

### Frontend (React + Vite + TypeScript)

**Component Architecture:**
- Context-based state management (AuthContext, NotificationContext)
- React Router for navigation
- Axios for API communication
- TailwindCSS for styling
- Vite for development and building

**State Management:**
- `AuthContext` - User authentication and authorization
- `NotificationContext` - Global notification system

## Commands

### Backend

```bash
cd backend

# Development
npm run dev                  # Start development server with hot reload
npm run type-check           # TypeScript type checking
npm run type-check:watch     # Watch mode type checking

# Building
npm run build                # Compile TypeScript to JavaScript
npm run start                # Run production build
npm run clean                # Clean build artifacts

# Code Quality
npm run lint                 # ESLint code quality check
npm run lint:fix            # Auto-fix ESLint issues
npm run format              # Prettier code formatting
npm run format:check        # Check code formatting

# Testing
npm test                     # Run all tests with coverage
npm run test:watch          # Watch mode for testing

# Database
npm run migrate              # Run database migrations
npm run migrate:down        # Rollback migrations
npm run seed                # Seed database with test data
npm run db:reset            # Reset database (migrate + seed)

# Pre-commit & CI
npm run ci                  # Run full CI pipeline locally
npm run workflow:verify     # Verify workflow configuration
npm run pre-commit-check    # Run pre-commit hooks
```

### Frontend

```bash
cd frontend

# Development
npm run dev                 # Start Vite dev server
npm run preview             # Preview production build

# Building
npm run build               # Build for production

# Code Quality
npm run lint                # ESLint code quality check
npm run lint:fix            # Auto-fix ESLint issues
npm run type-check          # TypeScript type checking
npm run type-check:watch   # Watch mode type checking

# Testing
npm test                    # Run tests with coverage (vitest)
npm run test:watch         # Watch mode for testing
```

### Root Level

```bash
# Docker
docker-compose up -d        # Start all services
docker-compose down        # Stop all services
docker-compose build       # Build all containers
```

## Development Workflow

### 1. Setting Up Local Environment

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed

# Frontend
cd frontend
npm install
cp .env.example .env  # if exists
# Edit .env with API URL

# Start both
npm run dev  # in backend
npm run dev  # in frontend
```

### 2. Default Test Accounts

After running migrations and seeds, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| HR Admin | hr@company.com | hr123456 |
| Manager | manager@company.com | mgr123456 |
| Employee | employee@company.com | emp123456 |

### 3. Pre-commit Hooks

The project uses Husky + lint-staged for pre-commit validation:

- ESLint auto-fixes
- Prettier formatting
- TypeScript type checking

All checks must pass before commit.

### 4. CI/CD Pipeline

**GitHub Actions Workflows** (`.github/workflows/`):

- **`ci.yml`**: Main CI pipeline
  - Type checking
  - Linting
  - Testing (with coverage)
  - Building

- **`codeql.yml`**: Security analysis
  - Weekly scans
  - Pull request checks

- **`dependency-review.yml`**: Dependency security
  - Vulnerability scanning
  - New dependency review

**Trigger Conditions:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual dispatch

## Code Style

### TypeScript Strict Mode

The project enforces strict TypeScript configuration:
- `strict` - All strict type checking options
- `noImplicitAny` - No implicit `any` types
- `strictNullChecks` - Strict null/undefined checking
- `noUnusedLocals` - Detect unused local variables
- `noUnusedParameters` - Detect unused parameters
- `exactOptionalPropertyTypes` - Exact optional property types
- `noImplicitOverride` - Explicit override modifiers required
- `noPropertyAccessFromIndexSignature` - Strict index signature access
- `noUncheckedIndexedAccess` - Unchecked indexed access

### ESLint Rules

Backend: TypeScript-focused rules with strict settings
Frontend: React + TypeScript rules with hooks and refresh plugins

### Prettier Configuration

Automated code formatting with consistent style:
- 2-space indentation
- Single quotes
- Trailing commas
- Print width: 100

## Key Configuration Files

### Backend
- `backend/tsconfig.json` - TypeScript configuration
- `backend/.eslintrc.json` - ESLint rules
- `backend/.prettierrc` - Code formatting
- `backend/jest.config.js` - Test configuration
- `backend/.husky/` - Git hooks

### Frontend
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/.eslintrc.json` - ESLint rules
- `frontend/vite.config.ts` - Vite bundler configuration
- `frontend/tailwind.config.js` - TailwindCSS configuration

### Database
- `backend/scripts/migrate.js` - Database migration runner
- `backend/scripts/seed.js` - Database seeding
- `.env.example` - Environment variables template

## Security Features

- **Authentication**: JWT tokens with configurable expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Configurable rate limiters per route
- **Security Headers**: Helmet.js for common security headers
- **CORS**: Configurable cross-origin resource sharing
- **SQL Protection**: Parameterized queries and SQL injection prevention
- **Audit Logging**: All API requests logged with metadata

## Testing

### Backend Testing Stack
- **Framework**: Jest with ts-jest preset
- **Test Types**: Unit tests, integration tests
- **Coverage**: Required for all new code
- **Location**: `backend/tests/` and `backend/src/**/*.test.ts`

### Frontend Testing Stack
- **Framework**: Vitest
- **UI Testing**: React Testing Library
- **Coverage**: Required for all new code
- **Location**: `frontend/tests/` and component files

### Running Tests

```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm test -- --coverage    # With coverage report

# Frontend
cd frontend
npm test                   # Run all tests
npm run test:watch        # Watch mode
```

Coverage reports:
- Backend: `backend/coverage/lcov-report/index.html`
- Frontend: `frontend/coverage/`

## Database

### PostgreSQL 14+

**Required Tables:**
- `employees` - Employee information
- `departments` - Department structure
- `positions` - Job positions
- `leave_requests` - Leave applications
- `leave_balances` - Leave balances
- `pay_stubs` - Payroll information
- `notifications` - System notifications
- `audit_logs` - Audit trail

### Migration & Seeding

```bash
cd backend
npm run migrate           # Run migrations
npm run seed             # Seed with test data
npm run db:reset         # Complete reset
```

## Environment Variables

### Backend (`.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

## Recent Changes

- **001-frontend-typescript**: Added TypeScript 5.x support for frontend migration
- **002-backend-typescript**: Added TypeScript 5.x support for backend migration
- **1-smb-hr-system**: Added Node.js + Express + PostgreSQL

## Common Tasks

### Adding a New API Endpoint

1. Create route in `backend/src/routes/`
2. Implement business logic in `backend/src/services/`
3. Update database model in `backend/src/models/`
4. Add middleware if needed in `backend/src/middleware/`
5. Add TypeScript types in `backend/src/types/`
6. Write tests in `backend/tests/`
7. Update frontend API service in `frontend/src/services/`

### Adding a New Component

1. Create component in `frontend/src/components/`
2. Add TypeScript types in `frontend/src/types/`
3. Write tests in component file or `frontend/tests/`
4. Add to page in `frontend/src/pages/`

### Database Schema Changes

1. Create migration script in `backend/scripts/`
2. Update models in `backend/src/models/`
3. Add TypeScript types
4. Update API endpoints
5. Update frontend types
6. Test migration: `npm run migrate`

## Important Documentation

- `README.md` - Project overview and setup
- `backend/CI_CD.md` - CI/CD workflow documentation
- `backend/PROJECT_SUMMARY.md` - TypeScript migration summary
- `backend/TYPESCRIPT_WORKFLOW.md` - TypeScript development workflow
- `ENVIRONMENT.md` - Environment configuration guide

## VS Code Integration

Recommended extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL (optional)

Workspace settings in `.vscode/` folder configured for:
- TypeScript preferences
- ESLint integration
- Prettier as default formatter
- Auto-formatting on save

## Performance Considerations

- Database connection pooling
- Query optimization with parameterized statements
- Rate limiting to prevent abuse
- Caching for frequently accessed data
- Lazy loading for frontend components
- Code splitting for bundle optimization

## Monitoring & Logging

- **Backend**: Console logging with structured format
- **Audit Logs**: All API requests in `audit_logs` table
- **Error Handling**: Centralized error middleware
- **Health Check**: `/health` endpoint for monitoring

## Troubleshooting

### Common Issues

**TypeScript Errors:**
```bash
npm run type-check           # Check for type errors
npm run type-check:watch   # Watch mode for quick feedback
```

**Database Connection Issues:**
- Verify PostgreSQL is running
- Check `.env` credentials
- Ensure database exists: `createdb hr_system`

**Port Already in Use:**
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.ts`

**Test Failures:**
- Run `npm run lint` to check code style
- Ensure all environment variables are set
- Check database connection for integration tests

### Getting Help

1. Check existing documentation files
2. Review test files for examples
3. Check GitHub Actions logs for CI failures
4. Verify all environment variables are set correctly

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
