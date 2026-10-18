import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => ({
  plugins: [react()],
  // Review is deliberately a dev-only mode. Every production build uses real dates.
  define: { __REVIEW__: JSON.stringify(command === 'serve' && mode === 'review') },
  build: { sourcemap: false },
}));
