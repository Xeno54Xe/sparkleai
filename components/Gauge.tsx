import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface GaugeProps {
  score: number;
  size?: number;
}

export default function Gauge({ score, size = 200 }: GaugeProps) {
  const { isDark } = useTheme();

  // Dynamic Colors
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const strokeColor = isDark ? '#374151' : '#E5E7EB'; 

  // Measurements
  const center = size / 2;
  const strokeWidth = size * 0.1; 
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const arcLength = circumference / 2; 
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  let color = '#10B981'; 
  if (score < 50) color = '#EF4444'; 
  else if (score < 70) color = '#F59E0B'; 

  return (
    <View style={{ 
      width: size, 
      height: size / 1.6, 
      alignItems: 'center', 
      justifyContent: 'flex-start',
      marginTop: 20, 
      marginBottom: 10,
      overflow: 'hidden' 
    }}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        
        <G rotation={180} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
        
        {/* SCORE TEXT - MOVED LEFT */}
        <SvgText
          x={center - size * 0.05} // <--- Shifting 5% to the left
          y={center - size * 0.1}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={textColor}
          fontSize={size * 0.20}
          fontWeight="bold"
        >
          {score}%
        </SvgText>
        
        {/* LABEL TEXT - Kept Centered */}
        <SvgText
          x={center} 
          y={center + size * 0.08}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={isDark ? '#9CA3AF' : '#6B7280'}
          fontSize={size * 0.07}
        >
          Confidence
        </SvgText>
      </Svg>
    </View>
  );
}