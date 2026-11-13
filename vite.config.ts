
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const apiProxy = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
};
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
  host: '0.0.0.0',
  port: 3000,
  proxy: apiProxy,
  // keep your existing hmr and watch settings
},

preview: {
  host: '0.0.0.0',
  port: 4173,
  proxy: apiProxy,
},
  };
});
