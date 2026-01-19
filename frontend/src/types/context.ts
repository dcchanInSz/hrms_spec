/**
 * Context Types for HRMS Frontend
 */

export interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: any) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: any | null;
  loading: boolean;
  token: string | null;
}

export interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (params?: any) => Promise<any>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: any) => void;
  removeNotification: (id: number) => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}
