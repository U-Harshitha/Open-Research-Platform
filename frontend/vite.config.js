import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The app is served under a sub-path so the portfolio can proxy it, the same
// way /hangman is proxied to the Phoenix app (see the portfolio's vercel.json).
// Change VITE_BASE_PATH to mount it somewhere else.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const raw = env.VITE_BASE_PATH || '/research/';
  const base = `/${raw.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');

  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
    },
    build: {
      // Output lands in dist/<base>/ so Firebase Hosting serves files at the
      // exact same paths the portfolio proxies to.
      outDir: `dist${base}`.replace(/\/$/, ''),
      emptyOutDir: true,
      assetsDir: 'assets',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          },
        },
      },
    },
  };
});
