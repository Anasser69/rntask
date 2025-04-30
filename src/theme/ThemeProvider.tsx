import React, { createContext, useContext, ReactNode } from 'react';
import useThemeStore, { ThemeType } from '../store/useThemeStore';
import colors from './colors';

type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, toggleTheme } = useThemeStore();
  
  const themeColors = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};