import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Solid tab bar background that follows the app's light/dark setting
export default function TabBarBackground() {
  const { isDark } = useTheme();
  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: isDark ? '#111827' : 'white', 
        borderTopWidth: 1,
        borderTopColor: isDark ? '#1F2937' : '#E5E7EB' 
      }} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}