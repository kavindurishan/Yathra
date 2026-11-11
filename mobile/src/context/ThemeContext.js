import React, { createContext, useContext, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const lightColors = {
  isDark: false,
  background: '#f8fafc',
  card: '#ffffff',
  surface: '#f1f5f9',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  textSubtle: '#94a3b8',
  primary: '#0284c7', // Sky 600
  primaryLight: '#e0f2fe',
  primaryDark: '#0369a1',
  secondary: '#0f766e',
  accent: '#10b981', // Emerald 500
  warning: '#f59e0b',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  femaleSeat: '#ec4899',
  femaleSeatLight: '#fce7f3',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
};

export const darkColors = {
  isDark: true,
  background: '#0b1120',
  card: '#1e293b',
  surface: '#0f172a',
  border: '#334155',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
  primary: '#38bdf8', // Sky 400
  primaryLight: '#082f49',
  primaryDark: '#0284c7',
  secondary: '#14b8a6',
  accent: '#10b981',
  warning: '#fbbf24',
  danger: '#f87171',
  dangerLight: '#450a0a',
  femaleSeat: '#f472b6',
  femaleSeatLight: '#500724',
  tabBar: '#0f172a',
  tabBarBorder: '#1e293b',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
