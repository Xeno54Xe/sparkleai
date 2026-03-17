import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TechnicalData {
  RSI: number;
  MACD: number;
  MACDSignal: number;
  SMA50: number;
  SMA200: number;
  ADX: number;
  stochK: number;
  CCI: number;
  WilliamsR: number;
  MFI: number;
  ROC: number;
  EMA20: number;
  VWAP: number;
  price: number;
}

interface Props {
  data: TechnicalData;
}

export default function TechnicalIndicatorHeatmap({ data }: Props) {
  const { isDark } = useTheme();

  const indicators = [
    { name: 'RSI (14)', val: data.RSI.toFixed(1), sig: data.RSI < 30 ? 'BUY' : data.RSI > 70 ? 'SELL' : 'NEUTRAL', desc: data.RSI < 30 ? 'Oversold — could bounce' : data.RSI > 70 ? 'Overbought — might dip' : 'No extreme signal' },
    { name: 'MACD', val: data.MACD.toFixed(2), sig: data.MACD > data.MACDSignal ? 'BUY' : 'SELL', desc: data.MACD > data.MACDSignal ? 'Bullish momentum' : 'Bearish pressure' },
    { name: 'SMA 50', val: `₹${data.SMA50}`, sig: data.price > data.SMA50 ? 'BUY' : 'SELL', desc: data.price > data.SMA50 ? 'Price above 50-day avg' : 'Price below 50-day avg' },
    { name: 'SMA 200', val: `₹${data.SMA200}`, sig: data.price > data.SMA200 ? 'BUY' : 'SELL', desc: data.price > data.SMA200 ? 'Long-term uptrend' : 'Long-term downtrend' },
    { name: 'ADX', val: data.ADX.toFixed(1), sig: data.ADX > 25 ? 'STRONG' : 'WEAK', desc: data.ADX > 25 ? 'Strong trend' : 'Weak/no trend' },
    { name: 'Stochastic', val: data.stochK.toFixed(1), sig: data.stochK < 20 ? 'BUY' : data.stochK > 80 ? 'SELL' : 'NEUTRAL', desc: data.stochK < 20 ? 'Oversold' : data.stochK > 80 ? 'Overbought' : 'Mid range' },
    { name: 'CCI', val: data.CCI.toFixed(1), sig: data.CCI > 100 ? 'SELL' : data.CCI < -100 ? 'BUY' : 'NEUTRAL', desc: data.CCI > 100 ? 'Overbought zone' : data.CCI < -100 ? 'Oversold zone' : 'Normal range' },
    { name: 'Williams %R', val: data.WilliamsR.toFixed(1), sig: data.WilliamsR > -20 ? 'SELL' : data.WilliamsR < -80 ? 'BUY' : 'NEUTRAL', desc: data.WilliamsR > -20 ? 'Overbought' : data.WilliamsR < -80 ? 'Oversold' : 'Normal' },
    { name: 'MFI', val: data.MFI.toFixed(1), sig: data.MFI > 80 ? 'SELL' : data.MFI < 20 ? 'BUY' : 'NEUTRAL', desc: 'Money Flow Index' },
    { name: 'ROC', val: `${data.ROC.toFixed(1)}%`, sig: data.ROC > 0 ? 'BUY' : 'SELL', desc: data.ROC > 0 ? 'Positive momentum' : 'Negative momentum' },
    { name: 'EMA 20', val: `₹${data.EMA20}`, sig: data.price > data.EMA20 ? 'BUY' : 'SELL', desc: data.price > data.EMA20 ? 'Short-term up' : 'Short-term down' },
    { name: 'VWAP', val: `₹${data.VWAP}`, sig: data.price > data.VWAP ? 'BUY' : 'SELL', desc: data.price > data.VWAP ? 'Above vol. avg price' : 'Below vol. avg price' },
  ];

  const getColors = (sig: string) => {
    if (sig === 'BUY' || sig === 'STRONG') return {
      bg: isDark ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.08)',
      text: '#10B981',
      border: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.2)',
    };
    if (sig === 'SELL') return {
      bg: isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.08)',
      text: '#EF4444',
      border: isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.2)',
    };
    if (sig === 'WEAK') return {
      bg: isDark ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.08)',
      text: '#F59E0B',
      border: isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.2)',
    };
    return {
      bg: isDark ? 'rgba(156,163,175,0.06)' : 'rgba(156,163,175,0.08)',
      text: '#9CA3AF',
      border: isDark ? 'rgba(156,163,175,0.12)' : 'rgba(156,163,175,0.15)',
    };
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {indicators.map((ind) => {
        const c = getColors(ind.sig);
        return (
          <View key={ind.name} style={{
            width: '48%',
            backgroundColor: c.bg,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>{ind.name}</Text>
              <View style={{ backgroundColor: c.text + '18', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontSize: 8, fontWeight: '800', color: c.text, letterSpacing: 0.5 }}>{ind.sig}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#F9FAFB' : '#1F2937', marginBottom: 2 }}>{ind.val}</Text>
            <Text style={{ fontSize: 9, color: isDark ? '#6B7280' : '#9CA3AF' }}>{ind.desc}</Text>
          </View>
        );
      })}
    </View>
  );
}
