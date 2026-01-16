import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证 token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response: any) => {
    // 对于 POST/PUT/DELETE 请求，返回完整响应以便获取 data
    if (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'delete') {
      return response;
    }
    return response.data;
  },
  (error: any) => {
    if (error.response) {
      const { status, data, config } = error.response;

      // 处理 401 未授权 - 排除登录请求
      if (status === 401 && !config.url?.includes('/auth/login')) {
        // 检查是否还有有效的 token（可能是有其他标签页刷新了）
        const currentToken = localStorage.getItem('token');
        const currentUser = localStorage.getItem('user');

        // 如果没有 token 或用户信息，才认为是真正未登录
        if (!currentToken || !currentUser) {
          // 清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // 如果不是登录页面，重定向到登录
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        // 如果有 token 和用户信息，说明可能是并发请求问题，不要清除
      }

      // 返回标准化错误格式
      return Promise.reject({
        status,
        message: data.message || data.error || '请求失败',
        code: data.code,
        errors: data.errors,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: '网络连接失败，请检查网络',
        code: 'NETWORK_ERROR',
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || '请求配置错误',
      code: 'CONFIG_ERROR',
    });
  }
);

// 认证 API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data: any) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// 员工 API
export const employeeAPI = {
  getProfile: () =>
    api.get('/employees/me'),

  updateProfile: (data: any) =>
    api.put('/employees/me', data),

  getTeamMembers: (managerId?: number) =>
    api.get(`/teams/members${managerId ? `?managerId=${managerId}` : ''}`),

  getEmployees: (params?: any) =>
    api.get('/admin/employees', { params }),

  getEmployee: (id: number) =>
    api.get(`/admin/employees/${id}`),

  createEmployee: (data: any) =>
    api.post('/admin/employees', data),

  updateEmployee: (id: number, data: any) =>
    api.put(`/admin/employees/${id}`, data),

  deleteEmployee: (id: number) =>
    api.delete(`/admin/employees/${id}`),
};

// 请假 API
export const leaveAPI = {
  getMyLeaves: (params?: any) =>
    api.get('/leaves', { params }),

  getLeaveTypes: () =>
    api.get('/leaves/types'),

  getBalance: () =>
    api.get('/leaves/balances'),

  getPolicies: () =>
    api.get('/leaves/policies'),

  createRequest: (data: any) =>
    api.post('/leaves', data),

  cancelRequest: (id: number) =>
    api.put(`/leaves/${id}/cancel`),

  // 年度结转 (HR 专用)
  yearEndRollover: (data: any) =>
    api.post('/leaves/year-end-rollover', data),

  yearEndRolloverBulk: (data: any) =>
    api.post('/leaves/year-end-rollover/bulk', data),

  // 经理审批
  getPendingApprovals: () =>
    api.get('/leaves/pending'),

  approve: (id: number, data: any) =>
    api.put(`/leaves/${id}/approve`, data),

  reject: (id: number, reason: string) =>
    api.put(`/leaves/${id}/reject`, { reason }),

  // HR 管理
  getAllLeaves: (params?: any) =>
    api.get('/admin/leaves', { params }),

  getTeamLeaves: (params?: any) =>
    api.get('/leaves/team', { params }),
};

// 工资单 API
export const paystubAPI = {
  getMyPaystubs: (params?: any) =>
    api.get('/paystubs', { params }),

  getPaystub: (id: number) =>
    api.get(`/paystubs/${id}`),

  // HR 管理
  getAllPaystubs: (params?: any) =>
    api.get('/admin/paystubs', { params }),

  createPaystub: (data: any) =>
    api.post('/admin/paystubs', data),

  deletePaystub: (id: number) =>
    api.delete(`/admin/paystubs/${id}`),
};

// 通知 API
export const notificationAPI = {
  getNotifications: (params?: any) =>
    api.get('/notifications', { params }),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  markAsRead: (id: number) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all'),
};

// 部门 API
export const departmentAPI = {
  getDepartments: () =>
    api.get('/admin/departments'),

  getDepartment: (id: number) =>
    api.get(`/admin/departments/${id}`),

  createDepartment: (data: any) =>
    api.post('/admin/departments', data),

  updateDepartment: (id: number, data: any) =>
    api.put(`/admin/departments/${id}`, data),

  deleteDepartment: (id: number) =>
    api.delete(`/admin/departments/${id}`),
};

// 职位 API
export const positionAPI = {
  getAllPositions: (params?: any) =>
    api.get('/admin/positions', { params }),

  getPosition: (id: number) =>
    api.get(`/admin/positions/${id}`),

  createPosition: (data: any) =>
    api.post('/admin/positions', data),

  updatePosition: (id: number, data: any) =>
    api.put(`/admin/positions/${id}`, data),

  deletePosition: (id: number) =>
    api.delete(`/admin/positions/${id}`),
};

// 报表 API
export const reportAPI = {
  getHRDashboard: () =>
    api.get('/reports/hr-dashboard'),

  getTeamAnalytics: () =>
    api.get('/reports/team-analytics'),

  getHeadcount: (params?: any) =>
    api.get('/reports/headcount', { params }),

  getLeaveUtilization: (params?: any) =>
    api.get('/reports/leave-utilization', { params }),

  exportReport: (type: string, format: string, params?: any) =>
    api.get(`/reports/export/${type}`, {
      params: { ...params, format },
      responseType: 'blob',
    }),
};

// 审计日志 API
export const auditAPI = {
  getAuditLogs: (params?: any) =>
    api.get('/admin/audit-logs', { params }),
};

// 团队 API (经理功能)
export const teamAPI = {
  getDashboard: (params?: any) =>
    api.get('/teams/dashboard', { params }),

  getMembers: (params?: any) =>
    api.get('/teams/members', { params }),

  getLeaveRequests: (params?: any) =>
    api.get('/teams/leave-requests', { params }),

  getCalendar: (params?: any) =>
    api.get('/teams/calendar', { params }),

  getPendingApprovals: () =>
    api.get('/teams/pending-approvals'),
};

// 组织架构 API
export const orgAPI = {
  getOrgChart: (params?: any) =>
    api.get('/org/chart', { params }),

  getDepartmentSubtree: (departmentId: number, params?: any) =>
    api.get(`/org/chart/${departmentId}`, { params }),

  getReportingChain: (employeeId: number) =>
    api.get(`/org/reporting-chain/${employeeId}`),

  reassignManager: (data: any) =>
    api.put('/org/reassign-manager', data),

  moveDepartment: (data: any) =>
    api.put('/org/move-department', data),

  getDepartmentEmployees: (departmentId: number, params?: any) =>
    api.get(`/org/employees/${departmentId}`, { params }),

  getStatistics: () =>
    api.get('/org/statistics'),

  searchEmployees: (params?: any) =>
    api.get('/org/search', { params }),

  getChanges: (params?: any) =>
    api.get('/org/changes', { params }),

  exportOrgChart: (format: string, params?: any) =>
    api.get('/org/export', {
      params: { ...params, format },
      responseType: format === 'csv' ? 'blob' : 'json',
    }),
};

export default api;
