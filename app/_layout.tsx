import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    // 1. AuthProvider manages User Login State
    <AuthProvider>
      {/* 2. ThemeProvider manages Dark Mode State */}
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Define your screens here */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="modal" 
            options={{ presentation: 'modal', title: 'Modal' }} 
          />
        </Stack>
        {/* StatusBar adapts to the theme automatically */}
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}