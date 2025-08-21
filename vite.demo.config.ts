import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// App-mode config for building/previewing the demo (index.html)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'demo-dist',
  },
});

