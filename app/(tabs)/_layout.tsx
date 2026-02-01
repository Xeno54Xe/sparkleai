import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Hook

export default function TabLayout() {
  const { isDark } = useTheme(); // Check theme status

  // --- DYNAMIC THEME COLORS ---
  const barBg = isDark ? '#111827' : '#FFFFFF';        // Dark Gray vs White
  const border = isDark ? '#1F2937' : '#E5E7EB';       // Border color
  const activeTint = isDark ? '#A78BFA' : '#5B21B6';   // Neon Purple vs Dark Purple
  const inactiveTint = isDark ? '#6B7280' : '#9CA3AF'; // Gray for inactive

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: barBg,
          borderTopWidth: 1,
          borderTopColor: border,
          height: Platform.OS === 'android' ? 70 : 90,
          paddingBottom: Platform.OS === 'android' ? 12 : 30,
          paddingTop: 12,
          elevation: 0,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      
      {/* 1. HOME TAB */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color: color }}>🏠</Text>
          ),
        }}
      />

      {/* 2. TRADE TAB (New Real-time Graph) */}
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Trade',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color: color }}>📈</Text>
          ),
        }}
      />

      {/* 3. ANALYZE TAB (Explore) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color: color }}>🤖</Text>
          ),
        }}
      />

      {/* 4. PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color: color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}