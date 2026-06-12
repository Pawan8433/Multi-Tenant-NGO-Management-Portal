import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  // `vite preview` (used when hosting on Render as a web service) blocks unknown
  // hosts by default. Allow the deployment domain(s).
  preview: {
    allowedHosts: true,
  },
});
