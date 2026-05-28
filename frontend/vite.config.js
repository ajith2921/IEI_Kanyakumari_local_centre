import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Target modern browsers for smaller bundles
    target: "esnext",
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Normalize path separators for cross-platform compatibility
          const normalizedId = id.replace(/\\/g, "/");
          // Avoid circular: only bucket by exact vendor identity
          if (normalizedId.includes("/node_modules/react/") || normalizedId.includes("/node_modules/react-dom/")) {
            return "vendor-react";
          }
          if (normalizedId.includes("/node_modules/react-router") || normalizedId.includes("/node_modules/react-helmet")) {
            return "vendor-router";
          }
          if (normalizedId.includes("/node_modules/axios")) {
            return "vendor-api";
          }
          // Split admin chunk
          if (normalizedId.includes("/src/admin/")) {
            return "admin";
          }
        },
      },
    },
    // Minification options
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console logs in production
        drop_debugger: true,
        passes: 2,
      },
    },
    // Large asset warning threshold
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Inline small assets (< 4KB) as base64 to save requests
    assetsInlineLimit: 4096,
    // No source maps in production
    sourcemap: false,
  },
});
