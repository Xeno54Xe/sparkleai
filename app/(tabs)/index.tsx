import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';

// Import your local master list
import ALL_STOCKS_DATA from '../../assets/stocks.json';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [pieData, setPieData] = useState<any[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);

  const colors = {
    bg: isDark ? '#020617' : '#F0F4F8',
    text: isDark ? '#F8FAFC' : '#1E293B',
    subText: isDark ? '#94A3B8' : '#64748B',
    glassBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', 
    glassBg: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    accent: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    chartColors: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']
  };

  const calculateDiversity = async () => {
    try {
      const saved = await AsyncStorage.getItem('user_watchlist');
      if (!saved) {
        setPieData([]);
        setWatchlistCount(0);
        return;
      }
      const symbols: string[] = JSON.parse(saved);
      setWatchlistCount(symbols.length);

      const seriesCounts: { [key: string]: number } = {};
      
      symbols.forEach(sym => {
        const stock = ALL_STOCKS_DATA.find(s => s["SYMBOL"] === sym);
        const rawSeries = stock ? stock["SERIES"] : "EQ";
        let label = "Equity";
        if (rawSeries === 'BE') label = 'Trade-to-Trade';
        else if (rawSeries === 'SM') label = 'SME';
        else if (rawSeries !== 'EQ') label = `Other (${rawSeries})`;

        seriesCounts[label] = (seriesCounts[label] || 0) + 1;
      });

      const formattedData = Object.keys(seriesCounts).map((label, index) => ({
        value: seriesCounts[label],
        color: colors.chartColors[index % colors.chartColors.length],
        label: label,
        text: `${Math.round((seriesCounts[label] / symbols.length) * 100)}%`
      }));
      setPieData(formattedData);
    } catch (e) {
      console.error("Diversity Calculation Error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      calculateDiversity();
    }, [])
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Decorative Background Glows */}
      <View style={[styles.glowOrb, { top: -50, right: -100, backgroundColor: colors.accent, opacity: isDark ? 0.15 : 0.1 }]} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <LinearGradient 
          colors={isDark ? ['#4F46E5', '#312E81'] : ['#6366F1', '#818CF8']} 
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.hindiGreeting}>स्वागत है!</Text>
          <Text style={styles.englishGreeting}>Welcome to Sparkle AI</Text>
          <Text style={styles.subGreeting}>Your financial command center</Text>
        </LinearGradient>

        <View style={{ padding: 20 }}>
          {/* 1. WATCHLIST ANALYTICS */}
          {pieData.length > 0 ? (
            <View style={[styles.glassCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}>
                <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.cardPadding}>
                    <View style={styles.cardHeader}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>📊</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Portfolio Diversity</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <PieChart
                            data={pieData}
                            donut
                            radius={65}
                            innerRadius={40}
                            focusOnPress
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                            innerCircleColor={isDark ? "#1E293B" : "#FFFFFF"}
                            centerLabelComponent={() => (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{watchlistCount}</Text>
                                </View>
                            )}
                        />
                        <View style={{ flex: 1, paddingLeft: 20 }}>
                            {pieData.slice(0, 4).map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 10 }} />
                                    <Text style={{ fontSize: 12, color: colors.text }}>{item.value} {item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </BlurView>
            </View>
          ) : (
             <View style={[styles.glassCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg, padding: 20, alignItems: 'center' }]}>
                <Text style={{ color: colors.subText }}>Your portfolio is empty. Start by searching stocks!</Text>
             </View>
          )}

          {/* 2. BITS CAMPUS PULSE */}
          <View style={[styles.glassCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}>
            <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.cardPadding}>
              <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>🎓</Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>BITS Campus Pulse</Text>
                </View>
                <View style={[styles.liveBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <View style={[styles.liveDot, { backgroundColor: colors.danger }]} />
                  <Text style={[styles.liveText, { color: colors.danger }]}>LIVE</Text>
                </View>
              </View>
              {[
                { symbol: 'ZOMATO', activity: 'High 🔥', sentiment: 'Bullish', rank: 1, sentColor: colors.success, bg: 'rgba(16, 185, 129, 0.1)' },
                { symbol: 'SUZLON', activity: 'Volatile ⚡', sentiment: 'Caution', rank: 2, sentColor: colors.warning, bg: 'rgba(245, 158, 11, 0.1)' },
                { symbol: 'TATAMOTORS', activity: 'Steady ⚖️', sentiment: 'Hold', rank: 3, sentColor: colors.text, bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
              ].map((item, index) => (
                <TouchableOpacity 
                  key={item.symbol} 
                  onPress={() => router.push(`/(tabs)/explore?stock=${item.symbol}`)}
                  style={[styles.trendingRow, { borderBottomColor: colors.glassBorder, borderBottomWidth: index < 2 ? 1 : 0 }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.rankText, { color: colors.accent }]}>#{item.rank}</Text>
                    <View>
                      <Text style={[styles.trendingSymbol, { color: colors.text }]}>{item.symbol}</Text>
                      <Text style={{ fontSize: 11, color: colors.subText }}>Activity: {item.activity}</Text>
                    </View>
                  </View>
                  <View style={[styles.sentimentBadge, { backgroundColor: item.bg, borderColor: item.bg }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: item.sentColor }}>{item.sentiment}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </BlurView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  headerGradient: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36, padding: 24, paddingTop: 60, paddingBottom: 40 },
  glowOrb: { position: 'absolute', width: 250, height: 250, borderRadius: 125 },
  hindiGreeting: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 2 },
  englishGreeting: { fontSize: 22, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  subGreeting: { fontSize: 13, color: 'rgba(224, 231, 255, 0.8)' },
  glassCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, marginBottom: 20 },
  cardPadding: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  trendingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rankText: { fontSize: 14, fontWeight: '900', marginRight: 12, opacity: 0.8 },
  trendingSymbol: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '800' },
  sentimentBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
});