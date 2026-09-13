import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Rebuild Vite's dependency bundle on dev-server startup. This prevents an
  // old @react-three/drei bundle from returning "504 Outdated Optimize Dep"
  // and being incorrectly treated as a WebGL failure by the app.
  optimizeDeps: { force: true },
  build: { chunkSizeWarningLimit: 1100 },
});
