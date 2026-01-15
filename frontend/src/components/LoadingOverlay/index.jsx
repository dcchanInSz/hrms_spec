import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext({
  isLoading: false,
  loadingText: '',
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async (fn, text) => {},
});

export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    loadingText: '',
    count: 0,
  });

  const showLoading = useCallback((text = '加载中...') => {
    setLoadingState((prev) => ({
      ...prev,
      isLoading: true,
      loadingText: text,
      count: prev.count + 1,
    }));
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({
      ...prev,
      count: Math.max(0, prev.count - 1),
      isLoading: prev.count <= 1,
      loadingText: prev.count <= 1 ? '' : prev.loadingText,
    }));
  }, []);

  const withLoading = useCallback(
    async (fn, text = '加载中...') => {
      showLoading(text);
      try {
        return await fn();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider value={{ ...loadingState, showLoading, hideLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// 全局加载覆盖层组件
export function LoadingOverlay() {
  const { isLoading, loadingText } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4 min-w-[200px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">{loadingText}</p>
      </div>
    </div>
  );
}

export default LoadingContext;