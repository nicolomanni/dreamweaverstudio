export const colors = {
  dark: {
    background: '#0b0f1a',
    foreground: '#e9eef7',
    card: '#111827',
    border: '#1f2a44',
    primary: '#7c5cff',
    secondary: '#22d3ee',
  },
  light: {
    background: '#f5f7fb',
    foreground: '#111827',
    card: '#ffffff',
    border: '#e2e8f0',
    primary: '#6d5bff',
    secondary: '#22b8ff',
  },
} as const;

export type Theme = 'dark' | 'light';
