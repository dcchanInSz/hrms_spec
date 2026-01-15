import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * 认证 Hook
 * 提供认证相关的状态和方法
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;
