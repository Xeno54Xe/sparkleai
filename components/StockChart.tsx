import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function StockChart() {
  const { isDark } = useTheme();

  // 1. Theme Colors
  const textColor = isDark ? '#9CA3AF' : '#6B7280';
  const lineColor = isDark ? '#A78BFA' : '#7C3AED'; // Light Purple vs Dark Purple
  const pointerColor = isDark ? 'white' : 'black';
  const gridColor = isDark ? '#374151' : '#E5E7EB';

  // 2. Mock Data (Simulating a day of trading)
  // In real app, you fetch this from API
  const lineData = [
    { value: 2400, label: '9:15' },
    { value: 2420, label: '10:00' },
    { value: 2410, label: '10:30' },
    { value: 2440, label: '11:00' },
    { value: 2435, label: '11:30' },
    { value: 2460, label: '12:00' },
    { value: 2480, label: '12:30' },
    { value: 2475, label: '1:00' },
    { value: 2490, label: '1:30' },
    { value: 2510, label: '2:00' },
    { value: 2500, label: '2:30' },
    { value: 2525, label: '3:00' },
    { value: 2530, label: '3:30' },
  ];

  return (
    <View style={{ 
      backgroundColor: 'transparent', 
      paddingVertical: 20,
      marginLeft: -20 // Pull chart slightly left to align axes 
    }}>
      <LineChart
        areaChart
        data={lineData}
        width={width - 60} // Responsive width
        height={250}
        
        // --- AXES CONFIGURATION ---
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={gridColor}
        yAxisTextStyle={{ color: textColor, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: textColor, fontSize: 10 }}
        hideRules
        
        // --- LINE STYLE ---
        color={lineColor}
        thickness={2}
        startFillColor={lineColor}
        endFillColor={lineColor}
        startOpacity={0.2}
        endOpacity={0.0}
        
        // --- INTERACTION (TradingView Style) ---
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: pointerColor,
          pointerStripWidth: 2,
          pointerColor: pointerColor,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: false, // Activate on simple touch
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: any) => {
            return (
              <View
                style={{
                  height: 90,
                  width: 100,
                  justifyContent: 'center',
                  marginTop: -30,
                  marginLeft: -40,
                }}>
                <View style={{ 
                  paddingHorizontal: 14, 
                  paddingVertical: 6, 
                  borderRadius: 16, 
                  backgroundColor: isDark ? '#374151' : 'white',
                  borderWidth: 1,
                  borderColor: gridColor,
                }}>
                  <Text style={{ fontWeight: 'bold', textAlign: 'center', color: isDark ? 'white' : 'black' }}>
                    {'₹' + items[0].value + '.00'}
                  </Text>
                  <Text style={{ fontSize: 10, textAlign: 'center', color: textColor, marginTop: 4 }}>
                    {items[0].label}
                  </Text>
                </View>
              </View>
            );
          },
        }}
      />
    </View>
  );
}