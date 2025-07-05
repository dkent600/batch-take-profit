/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
};
