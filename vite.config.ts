import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path'; // ADD THIS LINE to import the 'path' module

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
  // ADD THE 'resolve' BLOCK BELOW
  resolve: {
    alias: {
      // This sets '@' as an alias for your '/src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
});
