import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    open: false, // !process.env.CI,
    port: 5173
  },
  esbuild: {
    target: 'es2022'
  },
  plugins: [
    aurelia({
      useDev: true,
    }),
    nodePolyfills()
  ],
  define: {
    // Ensure FAST components work in production builds
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  optimizeDeps: {
    include: [
      '@microsoft/fast-components',
      '@microsoft/fast-element',
      '@microsoft/fast-foundation'
    ]
  }
});
