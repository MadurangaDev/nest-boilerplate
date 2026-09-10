import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    hookTimeout: 30000,
  },
  plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })],
});
