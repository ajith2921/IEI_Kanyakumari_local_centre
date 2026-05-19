import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunk
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('axios')) {
              return 'vendor-api';
            }
            return 'vendor-other';
          }
          // Split admin routes into separate chunk
          if (id.includes('/admin/')) {
            return 'admin';
          }
        },
      },
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console logs in production
        drop_debugger: true,
      },
    },
    // Large asset warning threshold
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Enable source maps for debugging (optional, disable for smaller build)
    sourcemap: false,
  },
});
