import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy, ReactNode } from 'react';
import { useAuth } from './hooks/useAuth';

// 布局组件
import Layout from './components/Layout';

// 懒加载页面组件 - 按角色分组
// 基础页面 (所有用户)
const LoginPage = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const MyLeavesPage = lazy(() => import('./pages/Leave/MyLeaves'));
const LeaveRequestPage = lazy(() => import('./pages/Leave/RequestForm'));
const LeavePoliciesPage = lazy(() => import('./pages/Leave/Policies'));
const LeaveBalancePage = lazy(() => import('./pages/Leave/components/BalanceCard'));
const PayStubsPage = lazy(() => import('./pages/PayStubs'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));

// 经理页面
const TeamDashboardPage = lazy(() => import('./pages/Manager/Dashboard'));
const TeamMembersPage = lazy(() => import('./pages/Manager/TeamMembers'));
const LeaveApprovalPage = lazy(() => import('./pages/Manager/LeaveApproval'));
const TeamCalendarPage = lazy(() => import('./pages/Leave/TeamCalendar'));

// HR 页面
const HREmployeesPage = lazy(() => import('./pages/HR/Employees'));
const HREmployeeFormPage = lazy(() => import('./pages/HR/Employees/EmployeeForm'));
const HRDepartmentsPage = lazy(() => import('./pages/HR/Departments'));
const HRAuditLogsPage = lazy(() => import('./pages/HR/AuditLogs'));
const HRReportsPage = lazy(() => import('./pages/HR/Reports/Dashboard'));
const OrgChartPage = lazy(() => import('./pages/HR/OrgChart'));

// 用户角色类型
type UserRole = 'employee' | 'manager' | 'hr';

// 加载骨架屏
const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};

// 受保护的路由包装器
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* 受保护路由 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* 根路由重定向到仪表盘 */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 所有用户可访问 */}
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="my-leaves"
          element={
            <Suspense fallback={<PageLoader />}>
              <MyLeavesPage />
            </Suspense>
          }
        />
        <Route
          path="leave/request"
          element={
            <Suspense fallback={<PageLoader />}>
              <LeaveRequestPage />
            </Suspense>
          }
        />
        <Route
          path="leave/policies"
          element={
            <Suspense fallback={<PageLoader />}>
              <LeavePoliciesPage />
            </Suspense>
          }
        />
        <Route
          path="leave/balance"
          element={
            <Suspense fallback={<PageLoader />}>
              <LeaveBalancePage />
            </Suspense>
          }
        />
        <Route
          path="paystubs"
          element={
            <Suspense fallback={<PageLoader />}>
              <PayStubsPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
          }
        />

        {/* 经理专属路由 */}
        <Route
          path="manager"
          element={
            <ProtectedRoute allowedRoles={['manager', 'hr']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <TeamDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="team"
            element={
              <Suspense fallback={<PageLoader />}>
                <TeamMembersPage />
              </Suspense>
            }
          />
          <Route
            path="approvals"
            element={
              <Suspense fallback={<PageLoader />}>
                <LeaveApprovalPage />
              </Suspense>
            }
          />
          <Route
            path="calendar"
            element={
              <Suspense fallback={<PageLoader />}>
                <TeamCalendarPage />
              </Suspense>
            }
          />
        </Route>

        {/* HR 专属路由 */}
        <Route
          path="hr"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route
            path="employees"
            element={
              <Suspense fallback={<PageLoader />}>
                <HREmployeesPage />
              </Suspense>
            }
          />
          <Route
            path="employees/new"
            element={
              <Suspense fallback={<PageLoader />}>
                <HREmployeeFormPage />
              </Suspense>
            }
          />
          <Route
            path="employees/:id/edit"
            element={
              <Suspense fallback={<PageLoader />}>
                <HREmployeeFormPage />
              </Suspense>
            }
          />
          <Route
            path="departments"
            element={
              <Suspense fallback={<PageLoader />}>
                <HRDepartmentsPage />
              </Suspense>
            }
          />
          <Route
            path="org-chart"
            element={
              <Suspense fallback={<PageLoader />}>
                <OrgChartPage />
              </Suspense>
            }
          />
          <Route
            path="audit-logs"
            element={
              <Suspense fallback={<PageLoader />}>
                <HRAuditLogsPage />
              </Suspense>
            }
          />
          <Route
            path="reports"
            element={
              <Suspense fallback={<PageLoader />}>
                <HRReportsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <Suspense fallback={<PageLoader />}>
            <Navigate to="/dashboard" replace />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default App;
