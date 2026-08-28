import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Must stay in the backend's CLIENT_ORIGINS allowlist.
    strictPort: true
  },
  build: {
    // Keep the CRA output directory so existing deploy steps still work.
    outDir: 'build'
  }
});
