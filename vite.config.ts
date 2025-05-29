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
          dest: ''  // Copy directly to the root of the output directory
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    },
    assetsDir: 'assets',
    crossOrigin: 'use-credentials'
  },
  server: {
    host: true,
    strictPort: true,
    port: 5173
  }
});