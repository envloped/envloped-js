import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  target: 'es2020',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: true,
});
