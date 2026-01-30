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
        background: '#09090b',
        foreground: '#e4e4e7',
        primary: '#06b6d4',
        secondary: '#8b5cf6',
        card: '#18181b',
        border: '#27272a',
        input: '#27272a',
      },
    },
  },
  plugins: [],
};
