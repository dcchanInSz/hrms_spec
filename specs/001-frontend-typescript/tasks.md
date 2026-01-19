# Tasks: Convert Frontend to TypeScript

**Input**: Design documents from `/specs/001-frontend-typescript/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The feature specification does not explicitly request new tests, but includes acceptance scenarios for validating user stories. Existing tests must continue to pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` and `frontend/tests/` at repository root
- Paths shown below assume frontend/ project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript environment setup

- [x] T001 Create types directory structure at frontend/src/types/
- [x] T002 Install TypeScript 5.x dependencies in frontend/package.json
- [x] T003 Install @types packages for React, React DOM, React Router, and Axios
- [x] T004 [P] Create tsconfig.json with strict mode configuration
- [x] T005 [P] Create tsconfig.node.json for build configuration
- [x] T006 [P] Update .eslintrc.json to support TypeScript linting
- [x] T007 Create type definition index file at frontend/src/types/index.ts
- [x] T008 [P] Update package.json scripts to include type checking commands

**Checkpoint**: TypeScript environment ready - can begin foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create core entity types in frontend/src/types/entities.ts (User, Employee, Leave, Department, Position, PayStub, Notification)
- [x] T010 Create API response types in frontend/src/types/api.ts (ApiResponse, PaginatedResponse, etc.)
- [x] T011 Create component props types in frontend/src/types/components.ts (ButtonProps, InputProps, SelectProps, etc.)
- [x] T012 Create context types in frontend/src/types/context.ts (AuthContextType, NotificationContextType)
- [x] T013 Create custom hook types in frontend/src/types/hooks.ts (UseApiReturn, UsePaginationReturn, etc.)
- [x] T014 Create form types in frontend/src/types/forms.ts (LoginForm, EmployeeForm, LeaveForm, etc.)
- [x] T015 Create utility types in frontend/src/types/utils.ts (type guards, constants, enums)
- [x] T016 Update vite.config.js to vite.config.ts with TypeScript support
- [x] T017 Verify TypeScript compilation with npx tsc --noEmit
- [x] T018 [P] Create build verification task to ensure TypeScript builds successfully

**Checkpoint**: Foundation ready - type definitions complete, can begin user story implementation

---

## Phase 3: User Story 1 - Developer Experience with Type Safety (Priority: P1) 🎯 MVP

**Goal**: Enable TypeScript strict mode and provide full type checking for all components

**Independent Test**: A developer opens a TypeScript component file, sees type errors highlighted, and gets IntelliSense suggestions

### Tests for User Story 1 (Not Required - Acceptance Scenarios Only)

> **NOTE**: Validate acceptance scenarios manually or through existing tests
> 1. Open TypeScript component in IDE → verify IntelliSense works
> 2. Add type error → verify compilation fails with clear message
> 3. Rename prop → verify IDE highlights all usages

### Implementation for User Story 1

- [x] T019 [P] [US1] Migrate main.jsx to main.tsx with type annotations
- [x] T020 [P] [US1] Convert utils/validation.js to utils/validation.ts
- [x] T021 [P] [US1] Convert services/api.js to services/api.ts with typed interfaces
- [x] T022 [P] [US1] Convert hooks/useAuth.js to hooks/useAuth.ts with typed return
- [x] T023 [US1] Convert contexts/AuthContext.jsx to contexts/AuthContext.tsx with full typing
- [x] T024 [US1] Convert contexts/NotificationContext.jsx to contexts/NotificationContext.tsx
- [x] T025 [P] [US1] Convert utility components (Button, Input, Select) to TypeScript
- [x] T026 [P] [US1] Convert layout components to TypeScript
- [x] T027 [P] [US1] Update all import/export statements to TypeScript-compatible syntax
- [x] T028 [US1] Enable strict mode in tsconfig.json and fix all type errors
- [x] T029 [US1] Verify IDE shows proper IntelliSense for all TypeScript files

**Checkpoint**: At this point, TypeScript strict mode is enabled, developers get IntelliSense and type checking

---

## Phase 4: User Story 2 - Incremental Migration (Priority: P1)

**Goal**: Complete migration of all JavaScript files to TypeScript without breaking functionality

**Independent Test**: All components work identically to JavaScript version, no runtime errors

### Tests for User Story 2 (Not Required - Acceptance Scenarios Only)

> **NOTE**: Validate through existing test suite
> 1. Convert JSX to TSX → verify functionality intact
> 2. Mix JS/TS files → verify build succeeds
> 3. PropTypes converted → verify type safety

### Implementation for User Story 2

- [x] T030 [P] [US2] Convert page components to TypeScript (Login, Dashboard, Profile)
- [x] T031 [P] [US2] Convert Leave management pages (MyLeaves, RequestForm, Policies, Balance)
- [x] T032 [P] [US2] Convert Manager pages (Dashboard, TeamMembers, LeaveApproval, Reports/Analytics)
- [x] T033 [P] [US2] Convert HR pages (AuditLogs, Dashboard, Departments, Employees)
- [x] T034 [P] [US2] Convert PayStubs and Notifications pages
- [x] T035 [P] [US2] Convert remaining utility components (Modal, Table, LoadingOverlay, etc.)
- [x] T036 [US2] Convert App.jsx to App.tsx with full routing type safety
- [x] T037 [US2] Remove all PropTypes and JSDoc, replace with TypeScript interfaces
- [x] T038 [US2] Update all dynamic imports to be TypeScript-compatible
- [x] T039 [US2] Verify all functionality works identically to JavaScript version

**Checkpoint**: All 41 JavaScript/JSX files converted to TypeScript, functionality preserved

---

## Phase 5: User Story 3 - Build System Integration (Priority: P2)

**Goal**: Ensure TypeScript compiles correctly in Vite build system with optimal performance

**Independent Test**: npm run build produces working bundle, npm run dev has fast hot reload

### Tests for User Story 3 (Not Required - Acceptance Scenarios Only)

> **NOTE**: Validate through build commands
> 1. npm run build → verify compilation succeeds in <60 seconds
> 2. npm run dev → verify hot reload works in <2 seconds
> 3. Build output → verify no type errors

### Implementation for User Story 3

- [x] T040 [P] [US3] Optimize tsconfig.json for Vite build performance
- [x] T041 [P] [US3] Configure source maps in vite.config.ts
- [x] T042 [P] [US3] Setup build optimization for production bundles
- [x] T043 [P] [US3] Configure TypeScript path mapping for @ alias
- [x] T044 [US3] Integrate TypeScript compilation into npm run build script
- [x] T045 [US3] Setup TypeScript incremental compilation for faster builds
- [x] T046 [US3] Configure Vite esbuild options for TypeScript
- [x] T047 [US3] Add build performance monitoring (target: <60s build time)
- [x] T048 [US3] Verify development server hot reload performance (target: <2s)

**Checkpoint**: Build system produces optimized bundles with fast iteration

---

## Phase 6: User Story 4 - Testing Compatibility (Priority: P2)

**Goal**: All existing tests pass with TypeScript components, test files also use TypeScript

**Independent Test**: npm test runs successfully with TypeScript, all tests pass

### Tests for User Story 4 (Not Required - Acceptance Scenarios Only)

> **NOTE**: Validate through existing test suite
> 1. Convert test files → verify tests pass
> 2. TypeScript in tests → verify type checking works
> 3. Test failures → verify clear error messages

### Implementation for User Story 4

- [x] T049 [P] [US4] Install @types packages for testing libraries (Vitest)
- [x] T050 [P] [US4] Convert test setup file tests/setup.js to tests/setup.ts
- [x] T051 [P] [US4] Convert Login test tests/pages/Login/Login.test.jsx to tests/pages/Login/Login.test.tsx
- [x] T052 [P] [US4] Convert Leave tests/tests/pages/Leave/RequestForm.test.jsx to TypeScript
- [x] T053 [P] [US4] Convert Manager tests/tests/pages/Manager/Dashboard.test.jsx to TypeScript
- [x] T054 [P] [US4] Convert HR tests/tests/pages/HR/Employees.test.jsx to TypeScript
- [x] T055 [US4] Update test configuration to support TypeScript files
- [x] T056 [US4] Add type definitions for test utilities and mocks
- [x] T057 [US4] Verify all tests pass with TypeScript components
- [x] T058 [US4] Update npm test script to include type checking

**Checkpoint**: All tests pass, test files use TypeScript, type checking works in tests

---

## Phase 7: User Story 5 - Type Definitions for Dependencies (Priority: P2)

**Goal**: All third-party libraries have proper TypeScript type definitions

**Independent Test**: All imported libraries show type hints and IntelliSense in IDE

### Tests for User Story 5 (Not Required - Acceptance Scenarios Only)

> **NOTE**: Validate through IDE inspection
> 1. Import library → verify type definitions available
> 2. Use React Router → verify typed props and hooks
> 3. Use Axios → verify typed responses

### Implementation for User Story 5

- [x] T059 [P] [US5] Verify and install @types/react@18.2
- [x] T060 [P] [US5] Verify and install @types/react-dom@18.2
- [x] T061 [P] [US5] Verify and install @types/react-router-dom@6.x
- [x] T062 [P] [US5] Verify and install @types/axios@1.6
- [x] T063 [P] [US5] Install @types/node for Vite configuration
- [x] T064 [P] [US5] Install @types/vite for Vite types
- [x] T065 [US5] Create custom type declarations for libraries without types (if needed)
- [x] T066 [US5] Configure TypeScript to use DOM types for browser APIs
- [x] T067 [US5] Add global type declarations for Vite environment variables
- [x] T068 [US5] Verify all dependencies show proper IntelliSense in IDE

**Checkpoint**: All dependencies properly typed, developers get full IntelliSense support

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, optimization, and documentation

- [x] T069 [P] Run full type check with npx tsc --noEmit and fix remaining errors
- [x] T070 [P] Update npm run lint command to include TypeScript files
- [x] T071 [P] Add pre-commit hook for type checking (if using husky)
- [x] T072 [P] Optimize bundle size analysis and verify source maps
- [x] T073 [P] Update README.md with TypeScript development instructions
- [x] T074 [P] Create TypeScript coding guidelines document
- [x] T075 [P] Verify all success criteria are met:
  - All 41 files converted with zero type errors
  - TypeScript compilation <30 seconds
  - All tests pass (100% pass rate)
  - IDE shows type hints for 100% of files
  - Build produces working bundle <60 seconds
  - Zero runtime type errors
- [x] T076 [P] Performance audit: verify build time, hot reload, and type checking meet targets
- [x] T077 [P] Final integration test: run full application and verify all features work
- [x] T078 [P] Update CLAUDE.md with TypeScript frontend information

**Checkpoint**: Migration complete, all success criteria met, documentation updated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1) and User Story 2 (P1) can proceed first
  - User Stories 3-5 (P2) can proceed after US1 and US2 are complete
  - Or all user stories can proceed in parallel if team capacity allows
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 completion (shares infrastructure)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Can proceed in parallel with US4 and US5
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Can proceed in parallel with US3 and US5
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Can proceed in parallel with US3 and US4

### Within Each User Story

- Tests are not required (feature uses acceptance scenarios)
- Type definitions before component conversion
- Core files before utility files
- Components before pages
- Story complete before moving to next story

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - User Story 1 can proceed independently
  - User Story 2 can proceed (depends on US1 but can start immediately after)
  - User Stories 3-5 can proceed in parallel if needed
- All component migrations marked [P] within a story can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all type definition tasks for User Story 1 together:
Task: "Migrate main.jsx to main.tsx with type annotations"
Task: "Convert utils/validation.js to utils/validation.ts"
Task: "Convert services/api.js to services/api.ts"
Task: "Convert hooks/useAuth.js to hooks/useAuth.ts"

# These can all run in parallel as they modify different files
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Type Safety)
4. Complete Phase 4: User Story 2 (Incremental Migration)
5. **STOP and VALIDATE**: Test that TypeScript works and all files are migrated
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Type safety enabled
3. Add User Story 2 → Test independently → All files migrated
4. Add User Story 3 → Test independently → Build optimized
5. Add User Story 4 → Test independently → Tests compatible
6. Add User Story 5 → Test independently → All dependencies typed
7. Add Polish → Final verification and optimization

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Type Safety)
   - Developer B: User Story 2 (Incremental Migration)
   - Developer C: User Story 3 (Build Integration) + User Story 4 (Testing)
   - Developer D: User Story 5 (Type Definitions) + Polish
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify TypeScript compilation after each phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

**Success Criteria Tracking**:
- T001-T018: Setup and Foundational → Enable TypeScript development
- T019-T039: User Story 1-2 → Type safety and full migration
- T040-T048: User Story 3 → Optimized build system
- T049-T058: User Story 4 → Testing compatibility
- T059-T068: User Story 5 → Dependency type definitions
- T069-T078: Polish → Final verification and documentation
