import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Порт 5173 дар CORS-и API иҷозат дода шудааст, барои ҳамин strictPort истифода мебарем
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
