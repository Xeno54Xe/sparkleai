import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';

// Import your local master list
import ALL_STOCKS_DATA from '../../assets/stocks.json';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [pieData, setPieData] = useState<any[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    text: isDark ? '#F9FAFB' : '#1F2937',
    subText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    pill: isDark ? 'rgba(139, 92, 246, 0.2)' : '#EDE9FE',
    pillText: isDark ? '#DDD6FE' : '#5B21B6',
    chartColors: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']
  };

  // --- FULLY DYNAMIC LOGIC: Uses 'SERIES' for all 5000+ stocks ---
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
        // Map NSE Series codes to human-readable names
        const rawSeries = stock ? stock["SERIES"] : "EQ";
        let label = "Equity (EQ)";
        
        if (rawSeries === 'BE') label = 'Trade-to-Trade (BE)';
        else if (rawSeries === 'SM') label = 'SME Equity';
        else if (rawSeries === 'BZ') label = 'Non-Compliant (BZ)';
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

  const handleSearch = (stock: string) => {
    setSearchQuery(stock);
    setShowDropdown(false);
    router.push(`/explore?stock=${stock}`);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#5B21B6', '#4C1D95']} style={styles.headerGradient}>
          <Text style={styles.hindiGreeting}>स्वागत है!</Text>
          <Text style={styles.englishGreeting}>Welcome to Sparkle AI</Text>
          <Text style={styles.subGreeting}>stock advisor made by bitsians</Text>
          
          <View style={styles.glassSearchContainer}>
            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.blurWrapper}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>🔍</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Search 5000+ stocks..."
                  placeholderTextColor={colors.subText}
                  value={searchQuery}
                  onChangeText={(t) => { setSearchQuery(t.toUpperCase()); setShowDropdown(t.length > 0); }}
                />
              </View>
            </BlurView>
          </View>
        </LinearGradient>

        <View style={{ padding: 20 }}>
          {/* Watchlist Analytics Card */}
          {pieData.length > 0 && (
            <View style={styles.sectionGlassWrapper}>
                <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={styles.sectionPadding}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Your Watchlist Asset Distribution</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        <PieChart
                            data={pieData}
                            donut
                            radius={70}
                            innerRadius={45}
                            focusOnPress
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                            innerCircleColor={isDark ? "#1E293B" : "#FFFFFF"}
                            centerLabelComponent={() => (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, color: colors.text, fontWeight: 'bold' }}>{watchlistCount}</Text>
                                    <Text style={{ fontSize: 9, color: colors.subText }}>Stocks</Text>
                                </View>
                            )}
                        />
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            {pieData.map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 8 }} />
                                    <Text style={{ fontSize: 11, color: colors.text }} numberOfLines={1}>{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </BlurView>
            </View>
          )}

          {/* Sparkle Intelligence Steps */}
          <View style={styles.sectionGlassWrapper}>
            <BlurView intensity={isDark ? 15 : 30} tint={isDark ? "dark" : "light"} style={styles.sectionPadding}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20 }}>Intelligence 🧠</Text>
              {[
                { n: 1, t: "Real-Time Data", d: "Tracking 5000+ NSE stocks instantly." },
                { n: 2, t: "Pattern Recognition", d: "AI identifying overbought/oversold levels." },
                { n: 3, t: "Simple Advice", d: "Converting data into clear Buy/Sell signals." }
              ].map(step => (
                <View key={step.n} style={styles.stepContainer}>
                  <View style={styles.stepCircle}><Text style={styles.stepNumber}>{step.n}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.t}</Text>
                    <Text style={[styles.stepDesc, { color: colors.subText }]}>{step.d}</Text>
                  </View>
                </View>
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
  headerGradient: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, padding: 32, paddingTop: 60, paddingBottom: 40 },
  hindiGreeting: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  englishGreeting: { fontSize: 22, fontWeight: '600', color: 'white', marginBottom: 8 },
  subGreeting: { fontSize: 14, color: '#E9D5FF', marginBottom: 24 },
  glassSearchContainer: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  blurWrapper: { flex: 1 },
  textInput: { flex: 1, fontSize: 18, fontWeight: '500' },
  sectionGlassWrapper: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  sectionPadding: { padding: 20 },
  stepContainer: { flexDirection: 'row', marginBottom: 20 },
  stepCircle: { width: 28, height: 28, backgroundColor: '#5B21B6', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  stepNumber: { color: 'white', fontWeight: 'bold' },
  stepTitle: { fontSize: 16, fontWeight: 'bold' },
  stepDesc: { fontSize: 13 }
});