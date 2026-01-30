import { useState, useEffect } from 'react';
import { Theme } from '../styles/theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('dw-theme');
    const nextTheme = stored === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.localStorage.setItem('dw-theme', nextTheme);
    setTheme(nextTheme);
  };

  return { theme, toggleTheme };
};
