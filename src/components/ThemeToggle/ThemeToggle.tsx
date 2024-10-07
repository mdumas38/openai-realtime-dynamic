import React from 'react';
import { Moon, Sun } from 'react-feather';
import './ThemeToggle.scss';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function ThemeToggle({ isDarkMode, toggleTheme }: ThemeToggleProps) {
  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
