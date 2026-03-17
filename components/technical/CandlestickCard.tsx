import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface CandleData {
  latest: string;
  type: 'bullish' | 'bearish' | 'neutral';
  reliability: string;
  description: string;
}

interface Props {
  candle: CandleData;
}

export default function CandlestickCard({ candle }: Props) {
  const { isDark } = useTheme();
  const isBull = candle.type === 'bullish';
  const col = isBull ? '#10B981' : candle.type === 'bearish' ? '#EF4444' : '#F59E0B';
  const bgCol = isBull ? 'rgba(16,185,129,0.08)' : candle.type === 'bearish' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)';

  const CandleSVG = () => (
    <Svg width={48} height={64} viewBox="0 0 48 64">
      {candle.latest === 'Bullish Engulfing' ? (
        <>
          <Line x1={14} y1={8} x2={14} y2={56} stroke="#EF4444" strokeWidth={1.5} />
          <Rect x={8} y={20} width={12} height={22} rx={2} fill="#EF4444" opacity={0.6} />
          <Line x1={34} y1={4} x2={34} y2={60} stroke={col} strokeWidth={1.5} />
          <Rect x={25} y={14} width={18} height={32} rx={2} fill={col} opacity={0.8} stroke={col} strokeWidth={1} />
        </>
      ) : candle.latest === 'Doji' ? (
        <>
          <Line x1={24} y1={6} x2={24} y2={58} stroke="#F59E0B" strokeWidth={1.5} />
          <Rect x={12} y={30} width={24} height={3} rx={1} fill="#F59E0B" />
        </>
      ) : candle.latest === 'Hammer' ? (
        <>
          <Line x1={24} y1={10} x2={24} y2={58} stroke={col} strokeWidth={1.5} />
          <Rect x={16} y={10} width={16} height={12} rx={2} fill={col} opacity={0.8} />
        </>
      ) : (
        <>
          <Line x1={24} y1={6} x2={24} y2={58} stroke={col} strokeWidth={1.5} />
          <Rect x={14} y={16} width={20} height={28} rx={2} fill={col} opacity={0.8} />
        </>
      )}
    </Svg>
  );

  return (
    <View style={{
      backgroundColor: bgCol,
      borderWidth: 1,
      borderColor: col + '20',
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    }}>
      <View style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: 4,
      }}>
        <CandleSVG />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#F9FAFB' : '#1F2937' }}>
            {candle.latest}
          </Text>
          <View style={{ backgroundColor: col + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: col, textTransform: 'uppercase' }}>{candle.type}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', lineHeight: 16, marginBottom: 4 }}>
          {candle.description}
        </Text>
        <Text style={{ fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF' }}>
          Reliability: <Text style={{ color: candle.reliability === 'High' ? '#10B981' : '#F59E0B', fontWeight: '700' }}>{candle.reliability}</Text>
        </Text>
      </View>
    </View>
  );
}
