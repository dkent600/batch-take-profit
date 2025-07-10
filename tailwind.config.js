// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{ts,html}',
    './src/**/*.html' // <— redundant but ensures coverage of Aurelia views
  ],
  safelist: ['btn-primary'] // add this temporarily
};
