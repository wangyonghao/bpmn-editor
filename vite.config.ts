import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Cloudflare Pages/Workers autoconfig injects @cloudflare/vite-plugin here.
  // The codemod fails unless this array already exists.
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        editor: resolve(import.meta.dirname, 'editor.html')
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  }
});
