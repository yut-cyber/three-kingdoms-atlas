import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/three-kingdoms-atlas/' : '/',
  build: {
    target: 'es2022',
    assetsInlineLimit: 8192,
  },
});
