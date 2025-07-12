import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import aurelia from '@aurelia/vite-plugin';
// @ts-expect-error - TypeScript has issues with .d.mts files from @tailwindcss/vite
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    open: false, // !process.env.CI,
    port: 5173,    // Generic proxy for external APIs to avoid CORS issues
    // Usage: /proxy/{full.domain.com}/{api/path}
    // Add new domains here as needed
    proxy: {
      // MEXC API
      '^/proxy/api\\.mexc\\.com/(.*)': {
        target: 'https://api.mexc.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/api\.mexc\.com/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`MEXC proxy: ${req.method} ${req.url} -> https://api.mexc.com`);
          });
        }
      },
      // Telegram API
      '^/proxy/api\\.telegram\\.org/(.*)': {
        target: 'https://api.telegram.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/api\.telegram\.org/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`Telegram proxy: ${req.method} ${req.url} -> https://api.telegram.org`);
          });
        }
      },
      // Add more APIs here as needed - just copy the pattern above
      // '^/proxy/api\\.coinex\\.com/(.*)': {
      //   target: 'https://api.coinex.com',
      //   changeOrigin: true,
      //   secure: true,
      //   rewrite: (path) => path.replace(/^\/proxy\/api\.coinex\.com/, ''),
      // },
    }
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
