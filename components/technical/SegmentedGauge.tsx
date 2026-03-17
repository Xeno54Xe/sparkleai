import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface SegmentedGaugeProps {
  value: number;
  size?: number;
  label?: string;
}

export default function SegmentedGauge({ value, size = 200, label }: SegmentedGaugeProps) {
  const { isDark } = useTheme();

  // Determine color and label
  let col = '#F59E0B';
  let defaultLabel = 'Neutral';
  if (value < 30) { col = '#EF4444'; defaultLabel = 'Bearish'; }
  else if (value < 45) { col = '#F97316'; defaultLabel = 'Slightly Bearish'; }
  else if (value <= 55) { col = '#F59E0B'; defaultLabel = 'Neutral'; }
  else if (value <= 70) { col = '#84CC16'; defaultLabel = 'Slightly Bullish'; }
  else { col = '#10B981'; defaultLabel = 'Bullish'; }

  const displayLabel = label || defaultLabel;
  const textColor = isDark ? '#F9FAFB' : '#1F2937';

  const R = size * 0.36;
  const pivotY = size * 0.46;
  const cx = size / 2;
  const sw = size * 0.05;

  // Helper: SVG arc path from angle1 to angle2 (degrees, -90=left, 90=right)
  const arcPath = (a1: number, a2: number) => {
    const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
    const x1 = cx + R * Math.cos(toRad(a1));
    const y1 = pivotY + R * Math.sin(toRad(a1));
    const x2 = cx + R * Math.cos(toRad(a2));
    const y2 = pivotY + R * Math.sin(toRad(a2));
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };

  const segments = [
    { from: -90, to: -54, color: '#EF4444' },
    { from: -50, to: -18, color: '#F97316' },
    { from: -14, to: 14,  color: '#F59E0B' },
    { from: 18,  to: 50,  color: '#84CC16' },
    { from: 54,  to: 90,  color: '#10B981' },
  ];

  // Needle angle: value 0 → -90deg, value 100 → +90deg
  const needleAngle = -90 + (value / 100) * 180;
  const needleLen = R - size * 0.08;
  const needleRad = (needleAngle - 90) * Math.PI / 180;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = pivotY + needleLen * Math.sin(needleRad);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg
        width={size}
        height={size * 0.52}
        viewBox={`0 0 ${size} ${size * 0.52}`}
      >
        {/* Arc segments */}
        {segments.map((seg, i) => (
          <Path
            key={i}
            d={arcPath(seg.from, seg.to)}
            fill="none"
            stroke={seg.color}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={0.75}
          />
        ))}
        {/* Needle */}
        <Line
          x1={cx} y1={pivotY} x2={nx} y2={ny}
          stroke={isDark ? 'white' : '#1F2937'}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Pivot dot */}
        <Circle
          cx={cx} cy={pivotY} r={size * 0.03}
          fill={isDark ? 'white' : '#1F2937'}
        />
      </Svg>

      {/* Score below */}
      <View style={{ alignItems: 'center', marginTop: 2 }}>
        <Text style={{
          fontSize: size * 0.17,
          fontWeight: '800',
          color: textColor,
          lineHeight: size * 0.2,
        }}>
          {Math.round(value)}
        </Text>
        <Text style={{
          fontSize: size * 0.065,
          fontWeight: '700',
          color: col,
          marginTop: 4,
        }}>
          {displayLabel}
        </Text>
      </View>
    </View>
  );
}
