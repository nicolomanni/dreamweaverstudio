/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../libs/client/**/*.{js,ts,jsx,tsx}',
    '../../libs/shared/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--dw-bg)',
        foreground: 'var(--dw-fg)',
        primary: 'var(--dw-primary)',
        secondary: 'var(--dw-secondary)',
        card: 'var(--dw-card)',
        border: 'var(--dw-border)',
        input: 'var(--dw-input)',
      },
    },
  },
  plugins: [],
};
