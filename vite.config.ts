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
    nodePolyfills(),
  ],
  optimizeDeps: {
    force: true, // one-time: first boot after this will rebuild deps
    include: [
      'aurelia',
      '@aurelia/runtime-html',
      // 'aurelia-fast-adapter',
      '@fluentui/web-components', // or '@microsoft/fast-components' if you use fast-*
    ],
  }
});
