import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  value: number;
}

export default function SentimentBar({ value }: Props) {
  const { isDark } = useTheme();
  const pct = Math.max(0, Math.min(100, value));

  let col = '#F59E0B';
  let label = 'Neutral';
  if (pct < 30) { col = '#EF4444'; label = 'Strong Bearish'; }
  else if (pct < 45) { col = '#F97316'; label = 'Bearish'; }
  else if (pct < 55) { col = '#F59E0B'; label = 'Neutral'; }
  else if (pct < 70) { col = '#84CC16'; label = 'Bullish'; }
  else { col = '#10B981'; label = 'Strong Bullish'; }

  return (
    <View>
      {/* Track */}
      <View style={{
        height: 16,
        borderRadius: 8,
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Segment markers */}
        {[20, 40, 50, 60, 80].map(p => (
          <View key={p} style={{
            position: 'absolute', left: `${p}%`, top: 0, bottom: 0,
            width: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
          }} />
        ))}
        {/* Marker dot */}
        <View style={{
          position: 'absolute',
          left: `${pct}%`,
          top: '50%',
          marginTop: -10,
          marginLeft: -10,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: col,
          borderWidth: 2,
          borderColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
          shadowColor: col,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 4,
        }} />
      </View>
      {/* Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '700', letterSpacing: 0.5 }}>BEARISH</Text>
        <Text style={{ fontSize: 10, color: col, fontWeight: '700' }}>{label} ({pct})</Text>
        <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '700', letterSpacing: 0.5 }}>BULLISH</Text>
      </View>
    </View>
  );
}
