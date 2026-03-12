import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Proxy /api → backend. Use 127.0.0.1 to avoid Windows resolving localhost to IPv6 first.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') || '/',
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('[vite proxy]', err.message));
          proxy.on('proxyReq', (_, req) => {
            // Optional: see forwarded path in terminal
            // console.log('[vite proxy]', req.method, req.url);
          });
        },
      },
    },
  },
})
