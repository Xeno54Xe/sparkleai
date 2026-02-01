import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  // 1. Load saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    };
    loadTheme();
  }, []);

  // 2. Function to toggle and save
  const toggleTheme = async () => {
    const newThemeStatus = !isDark;
    setIsDark(newThemeStatus);
    await AsyncStorage.setItem('appTheme', newThemeStatus ? 'dark' : 'light');
  };

  // 3. Provide the theme to the rest of the app
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* This tells Expo Router/Navigation to switch its colors */}
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}