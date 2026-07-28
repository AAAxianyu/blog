'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? '切换到浅色模式' : '切换到深色模式'}
      title={dark ? '浅色模式' : '深色模式'}
      className="relative grid h-9 w-9 place-items-center rounded-[5px] text-current hover:bg-bg-tertiary"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
