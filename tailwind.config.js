/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,html}",
    "./test-tailwind.html"
  ],
  prefix: 'tw-',
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflicts with Fluent UI
  },
  theme: {
    extend: {
      // Extend with Fluent UI design tokens for consistency
      colors: {
        'fluent-accent': 'var(--accent-fill-rest)',
        'fluent-neutral': 'var(--neutral-foreground-rest)',
        'fluent-layer': 'var(--neutral-layer-1)',
      },
      fontFamily: {
        'fluent': ['var(--body-font)', 'Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
