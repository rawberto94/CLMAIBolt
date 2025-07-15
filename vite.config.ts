import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
          dest: 'assets',
          rename: 'pdf.worker.min.js'
        }
      ]
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',  // Your backend URL
        changeOrigin: true,  // Changes the origin header to match target
        secure: false,  // For local dev (non-HTTPS)
        rewrite: (path) => path.replace(/^\/api/, '/api')  // Preserve /api prefix
      }
    }
  }
});
