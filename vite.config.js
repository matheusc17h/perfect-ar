import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5174, open: true },
  preview: { port: 4173, open: true },
  build: { target: 'es2019' }
});
