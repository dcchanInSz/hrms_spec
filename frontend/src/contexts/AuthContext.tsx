import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI, employeeAPI } from '../services/api';
import type { AuthContextType } from '../types/context';

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * 认证上下文提供者 Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证上下文提供者
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 从本地存储恢复认证状态
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');

      if (token && savedUserStr) {
        try {
          // 直接从本地存储恢复用户，登录后立即可用
          setUser(JSON.parse(savedUserStr));
        } catch (e) {
          // 解析失败，清除存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    restoreAuth();
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    // 后端返回 { success: true, data: { token, user }, message: '...' }
    // POST 请求返回 axios 响应对象，结构是 { data: {...}, status: 200, ... }
    // response.data 是后端返回的 JSON: { success, data: { token, user }, message }
    const responseData = response.data as any;
    const authData = responseData.data;  // authData = { token, user }
    const { token, user: userData } = authData;
    if (!token) {
      console.error('Login response:', response);
      throw new Error('登录失败：未收到认证令牌');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 即使 API 调用失败也清除本地状态
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // 更新用户信息
  const updateUser = useCallback(async (data: any) => {
    const response = await employeeAPI.updateProfile(data) as any;
    // PUT 请求返回完整响应，需要访问 response.data
    const updatedUser = { ...(user as any), ...(response.data as any) };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    return updatedUser;
  }, [user]);

  // 检查是否有特定权限
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    // HR 拥有所有权限
    if (user.role === 'hr') return true;

    const rolePermissions: Record<string, string[]> = {
      employee: [
        'profile:read',
        'profile:write',
        'leave:create',
        'leave:read:own',
        'paystub:read:own',
        'notification:read:own',
      ],
      manager: [
        'profile:read',
        'profile:write',
        'leave:create',
        'leave:read:own',
        'leave:approve',
        'leave:read:team',
        'paystub:read:own',
        'team:read',
      ],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  }, [user]);

  // 检查是否有特定角色
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
