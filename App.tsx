import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';
import useThemeStore from './src/store/useThemeStore';

export default function App() {
  const { theme } = useThemeStore();
  
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'auto'} />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
