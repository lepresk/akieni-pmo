import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Server-only modules are inert in the test runner.
      'server-only': path.resolve(__dirname, './test/mocks/empty-module.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    // Component tests opt into a DOM; everything else runs in node.
    environmentMatchGlobs: [['test/component/**', 'jsdom']],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**'],
      exclude: ['src/lib/db/schema/**', '**/*.d.ts'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
