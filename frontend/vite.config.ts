import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: true,
    },
    fs: {
      strict: true,
    },
    // Development server performance monitoring
    open: false,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: {
      runtime: true,
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    sourcemap: true,
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    esbuildOptions: {
      target: 'es2020',
      sourcemap: true,
    },
  },
  define: {
    __VITE_DEV_SERVER__: true,
  },
  plugins: [
    react(),
    // Build performance monitoring plugin
    {
      name: 'build-performance-monitor',
      buildStart() {
        console.log('🚀 Starting build with performance monitoring...');
        this.startTime = Date.now();
      },
      writeBundle() {
        const duration = Date.now() - this.startTime;
        console.log(`✅ Build completed in ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
        if (duration > 60000) {
          console.warn('⚠️ Build time exceeds 60s target');
        } else {
          console.log('✅ Build time within target (<60s)');
        }
      },
    },
  ],
});
