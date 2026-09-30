import { defineConfig } from 'vite';

export default defineConfig({
  // Cloudflare Pages/Workers autoconfig injects @cloudflare/vite-plugin here.
  // The codemod fails unless this array already exists.
  plugins: [],
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
