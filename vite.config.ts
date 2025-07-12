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
    proxy: {
      // Specific proxy for Telegram API
      '^/proxy/api\\.telegram\\.org': {
        target: 'https://api.telegram.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/proxy\/api\.telegram\.org/, '');
          console.log(`Telegram proxy rewrite: ${path} -> ${newPath}`);
          return newPath;
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`Telegram proxy configure for: ${req.method} ${req.url}`);
            console.log(`Telegram proxy target: ${options.target}`);
          });
        }
      },
      // Generic proxy for other APIs (MEXC, etc.)
      '^/proxy/.*': {
        target: 'https://api.mexc.com', // Default target, will be overridden
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // Parse URL: /proxy/{domain}/{path}
          const match = path.match(/^\/proxy\/([^\/]+)(\/.*)?$/);
          if (match) {
            const domain = match[1];
            const apiPath = match[2] || '';

            console.log(`Proxy rewrite: ${path} -> domain: ${domain}, path: ${apiPath}`);

            // Return just the path part
            return apiPath;
          }
          return path;
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`Proxy configure triggered for: ${req.method} ${req.url}`);

            // Parse URL: /proxy/{domain}/{path}
            const match = req.url?.match(/^\/proxy\/([^\/]+)(\/.*)?$/);
            if (match) {
              const domain = match[1];
              const path = match[2] || '';

              console.log(`Proxy configure: domain=${domain}, path=${path}`);

              // Dynamically change the target for this request
              const newTarget = `https://${domain}`;
              (options as any).target = newTarget;

              // Update the proxy request
              proxyReq.path = path;
              proxyReq.setHeader('host', domain);

              console.log(`Final proxy request: ${newTarget}${path}`);
            }
          });
        }
      }
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
