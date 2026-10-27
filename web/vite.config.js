import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Порт 5173 дар CORS-и API иҷозат дода шудааст, барои ҳамин strictPort истифода мебарем.
// Режими «нишон додан ба дӯст»: VITE_API_URL холӣ мемонад ва ҳамаи /api дархостҳо
// аз сервери Vite ба API-и маҳаллӣ (VITE_PROXY_TARGET) мегузаранд, бинобар ин танҳо як порт (5173) кофист.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      allowedHosts: true, // барои суроғаҳои tunnel (trycloudflare.com, ngrok ва ғайра)
      proxy: {
        '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5124', changeOrigin: true },
      },
    },
  };
});
