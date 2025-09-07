'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  const themes = [
    { id: 'light', icon: Sun, name: 'Light', gradient: 'from-yellow-400 to-orange-400' },
    { id: 'dark', icon: Moon, name: 'Dark', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'system', icon: Monitor, name: 'System', gradient: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.id;
        
        return (
          <Button
            key={themeOption.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => handleThemeChange(themeOption.id as Theme)}
            className={`transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-r ${themeOption.gradient} text-white shadow-elegant hover:opacity-90 border-0`
                : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
            title={`Switch to ${themeOption.name} theme`}
          >
            <Icon className="w-4 h-4" />
          </Button>
        );
      })}
    </div>
  );
};
