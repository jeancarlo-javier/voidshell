import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VoidShell',
      formats: ['es', 'cjs'],
      fileName: (format) => `voidshell.${format}.js`,
    },
    rollupOptions: {
      // Ensure React and the JSX runtime are not bundled to avoid
      // multiple React copies and runtime mismatches in consumers.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
