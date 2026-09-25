import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    // Diagram PNGs are emitted byte-for-byte; never inline or transform them here.
    assetsInlineLimit: 0,
  },
});
