# TypeScript Configuration Contract

**Version**: 1.0
**Created**: 2026-01-15
**Feature**: Convert Backend to TypeScript

## Overview

This contract defines the TypeScript configuration structure and validation rules for the backend migration.

## Contract Specification

### tsconfig.json Structure

```json
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
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"]
    }
  },
  "include": [
    "./src/**/*"
  ],
  "exclude": [
    "./node_modules",
    "./dist",
    "./tests"
  ]
}
```

## Configuration Options Contract

### Compiler Options

| Option | Type | Required | Default | Validation |
|--------|------|----------|---------|------------|
| target | string (ES version) | Yes | ES2020 | Must be ES2015+ |
| module | string | Yes | commonjs | Must be 'commonjs', 'esnext', or 'node' |
| lib | string[] | Yes | ES2020 | Array of ECMAScript library files |
| outDir | string | Yes | ./dist | Must be valid directory path |
| rootDir | string | Yes | ./src | Must be valid directory path |
| strict | boolean | Yes | true | Must be true for type safety |
| noImplicitAny | boolean | Yes | true | Must be true to enforce type annotations |
| skipLibCheck | boolean | Yes | true | Must be true for performance |
| esModuleInterop | boolean | Yes | true | Must be true for compatibility |
| declaration | boolean | Yes | true | Must be true to generate .d.ts files |
| sourceMap | boolean | Yes | true | Must be true for debugging |
| paths | object | No | - | Must resolve to valid directories |

### Path Mapping Contract

```typescript
interface PathMapping {
  [alias: string]: string[];
}

const pathMappings: PathMapping = {
  "@/*": ["./src/*"],
  "@models/*": ["./src/models/*"],
  "@services/*": ["./src/services/*"],
  "@routes/*": ["./src/routes/*"],
  "@middleware/*": ["./src/middleware/*"],
  "@utils/*": ["./src/utils/*"],
  "@types/*": ["./src/types/*"]
};
```

### Include/Exclude Patterns

```typescript
interface FilePatterns {
  include: string[];
  exclude: string[];
}

const filePatterns: FilePatterns = {
  include: [
    "./src/**/*",
    "./src/**/*.ts",
    "./src/**/*.tsx"
  ],
  exclude: [
    "./node_modules/**/*",
    "./dist/**/*",
    "./tests/**/*",
    "./**/*.test.ts",
    "./**/*.spec.ts"
  ]
};
```

## Validation Rules

### 1. Directory Structure Validation

**Rule**: All paths in `paths` mapping must resolve to existing directories
**Error**: Path alias "{alias}" resolves to non-existent directory "{path}"
**Example**: `@models/*` must resolve to `./src/models/`

### 2. Target Version Validation

**Rule**: Target ES version must be compatible with Node.js 18+
**Error**: Target ES version "{target}" is not compatible with Node.js 18
**Allowed**: ES2018, ES2019, ES2020, ES2021, ES2022

### 3. Module System Validation

**Rule**: Module system must match Node.js CommonJS runtime
**Error**: Module system "{module}" is incompatible with Node.js runtime
**Required**: commonjs

### 4. Strict Mode Requirements

**Rule**: Strict mode must be enabled for type safety
**Error**: TypeScript strict mode must be enabled
**Required Options**:
- strict: true
- strictNullChecks: true
- strictFunctionTypes: true
- noImplicitAny: true
- noImplicitReturns: true

### 5. Output Directory Validation

**Rule**: Output directory must be different from source directory
**Error**: outDir "{outDir}" must be different from rootDir "{rootDir}"
**Required**: outDir ≠ rootDir

## Performance Contract

### Compilation Time Limits

| Operation | Maximum Time | Measurement |
|-----------|--------------|-------------|
| Full compilation | 10 seconds | SC-002 |
| Incremental type check | 1 second | SC-003 |
| Watch mode update | 500 milliseconds | - |
| Build info file write | 100 milliseconds | - |

### Memory Usage Limits

| Operation | Maximum Memory |
|-----------|---------------|
| Type checking process | 512 MB |
| Full compilation | 1 GB |
| Watch mode | 256 MB |

## Quality Gates Contract

### Gate 1: Zero Compilation Errors

**Contract**: All TypeScript files must compile without errors
**Validation**: `tsc --noEmit` exits with code 0
**Error Message**: TypeScript compilation failed with {count} error(s)

### Gate 2: No Implicit Any Types

**Contract**: All variables must have explicit types
**Validation**: `noImplicitAny: true` enforced
**Error Message**: Variable "{variable}" has an implicit 'any' type

### Gate 3: Strict Null Checks

**Contract**: All nullable types must be explicitly handled
**Validation**: `strictNullChecks: true` enforced
**Error Message**: Type '{type}' is not assignable to type '{type} | null'

### Gate 4: Type Declarations Generated

**Contract**: Declaration files generated for all modules
**Validation**: Declaration files exist in output directory
**Error Message**: Declaration file not generated for "{module}"

## Migration Contract

### Phase 1: Configuration Setup

**Deliverable**: tsconfig.json created and validated
**Validation**: TypeScript compilation starts without errors
**Rollback**: Remove tsconfig.json, revert to JavaScript

### Phase 2: Source Migration

**Deliverable**: All .js files converted to .ts
**Validation**: Compilation succeeds with zero errors
**Rollback**: Revert files to .js extensions

### Phase 3: Type Definition Integration

**Deliverable**: @types packages installed and configured
**Validation**: Type checking finds no missing type errors
**Rollback**: Remove @types packages, use type: any

### Phase 4: Testing Integration

**Deliverable**: Jest configured for TypeScript
**Validation**: All tests pass with type checking
**Rollback**: Revert to JavaScript test configuration

### Phase 5: Production Build

**Deliverable**: Optimized production build
**Validation**: Build completes under 10 seconds, size ≤ JavaScript baseline
**Rollback**: Use JavaScript build process

## Backward Compatibility Contract

### API Contract Preservation

**Requirement**: All existing API endpoints must remain unchanged
**Validation**: OpenAPI contract unchanged after migration
**Error**: API contract modified: {endpoint} - {change}

### Database Contract Preservation

**Requirement**: Database schema and queries unchanged
**Validation**: All database operations return identical results
**Error**: Database operation changed: {operation} - {change}

### Runtime Contract Preservation

**Requirement**: Application behavior unchanged
**Validation**: End-to-end tests pass identically
**Error**: Runtime behavior changed in {module}

## Testing Contract

### Test Configuration

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

### Test Validation Rules

1. **Type-Safe Assertions**: All tests must use typed expect
2. **Mock Type Safety**: All mocks must have proper types
3. **Test Coverage**: ≥ 90% coverage maintained
4. **Test Execution**: All tests must pass before deployment

## Error Handling Contract

### Compilation Errors

```typescript
interface CompilationError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  severity: "error" | "warning";
}
```

### Error Recovery

1. **Type Error**: Fix type annotation, recompile
2. **Module Resolution Error**: Update path mapping
3. **Build Error**: Check tsconfig.json validity
4. **Runtime Error**: Use source map for debugging

## Success Criteria Contract

### SC-001: File Extension Migration

**Contract**: All source files use .ts extension
**Validation**: `find src -name "*.js" | wc -l` returns 0
**Measurement**: Count of .js files in src directory

### SC-002: Compilation Performance

**Contract**: TypeScript compilation completes in < 10 seconds
**Validation**: `time tsc` shows elapsed time < 10s
**Measurement**: Wall-clock time for full compilation

### SC-003: Type Check Performance

**Contract**: Type checking feedback in < 1 second
**Validation**: `tsc --noEmit --watch` responds to changes < 1s
**Measurement**: Time from file save to type error display

### SC-004: Error Catch Rate

**Contract**: Type checking catches 90%+ type errors
**Validation**: Compare runtime errors before/after migration
**Measurement**: % reduction in type-related runtime errors

### SC-005: CI/CD Integration

**Contract**: TypeScript checks run in CI/CD pipeline
**Validation**: Pipeline includes `tsc` and `npm test`
**Measurement**: Pipeline execution logs

### SC-006: Strict Type Safety

**Contract**: No implicit any types in codebase
**Validation**: `tsc --noImplicitAny` returns no errors
**Measurement**: Count of implicit any warnings

---

**Contract Version**: 1.0
**Effective Date**: 2026-01-15
**Review Date**: After Phase 1 completion
**Approved By**: Implementation Plan
