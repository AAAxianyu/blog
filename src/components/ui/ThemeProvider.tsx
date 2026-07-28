'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => undefined,
});

const listeners = new Set<() => void>();

function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemTheme = () => {
    if (localStorage.getItem('theme')) return;
    document.documentElement.classList.toggle('dark', media.matches);
    listeners.forEach((notify) => notify());
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== 'theme') return;
    document.documentElement.classList.toggle('dark', event.newValue === 'dark');
    listeners.forEach((notify) => notify());
  };

  media.addEventListener('change', handleSystemTheme);
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', handleSystemTheme);
    window.removeEventListener('storage', handleStorage);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, (): Theme => 'light');
  const toggleTheme = useCallback(() => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
    listeners.forEach((notify) => notify());
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
