import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-brand-bg-2 border border-brand-secondary/30 p-1 transition-colors flex items-center"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-brand-surface shadow-sm flex items-center justify-center z-10"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-brand-secondary" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-brand-accent" />
        )}
      </motion.div>
      <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
        <Moon className="w-3.5 h-3.5 text-brand-text-muted opacity-50" />
        <Sun className="w-3.5 h-3.5 text-brand-text-muted opacity-50" />
      </div>
    </button>
  );
};
