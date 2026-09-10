import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Nest relies on emitDecoratorMetadata for its DI container to read constructor
// parameter types at runtime. Vite's default esbuild transform drops that
// metadata, so tests use the real SWC decorator transform instead -- same
// engine `nest build` uses under the hood.
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
