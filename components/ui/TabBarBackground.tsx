import { View } from 'react-native';

// This is a simple background component to fix the missing file error
// Since we are not using expo-blur, we just return a solid background
export default function TabBarBackground() {
  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: 'white', 
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB' 
      }} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}