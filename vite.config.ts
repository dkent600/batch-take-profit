import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import aurelia from '@aurelia/vite-plugin';
// @ts-expect-error - TypeScript has issues with .d.mts files from @tailwindcss/vite
import tailwindcss from '@tailwindcss/vite';

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
    tailwindcss()
  ],
});
