import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  // --- REFINED COLOR PALETTE FOR GLASSMORPHISM ---
  const colors = {
    bg: isDark ? '#020617' : '#F0F4F8', // Deep Slate vs Soft Alice Blue
    text: isDark ? '#F8FAFC' : '#1E293B', // White vs Dark Slate
    subText: isDark ? '#94A3B8' : '#64748B', // Light Gray vs Cool Gray
    
    // Glass Borders & Backgrounds
    glassBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', 
    glassBg: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    
    // Functional Colors (Works on both modes)
    accent: '#6366F1',     // Indigo
    success: '#10B981',    // Emerald
    warning: '#F59E0B',    // Amber
    danger: '#EF4444',     // Rose
    
    // Search Bar Specific
    inputBg: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
    
    chartColors: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']
  };

  // --- 1. SEARCH LOGIC ---
  const filteredStocks = searchQuery.length > 0 
    ? ALL_STOCKS_DATA.filter(s => 
        s["SYMBOL"].toUpperCase().includes(searchQuery.toUpperCase()) || 
        s["NAME OF COMPANY"].toUpperCase().includes(searchQuery.toUpperCase())
      ).slice(0, 50)
    : [];

  // --- 2. DIVERSITY LOGIC ---
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
        else if (rawSeries === 'BZ') label = 'Non-Compliant';
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
    setSearchQuery(''); 
    setShowDropdown(false);
    router.push(`/(tabs)/explore?stock=${stock}`);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Decorative Background Glows */}
      <View style={[styles.glowOrb, { top: -50, right: -100, backgroundColor: colors.accent, opacity: isDark ? 0.15 : 0.1 }]} />
      <View style={[styles.glowOrb, { bottom: 100, left: -100, width: 300, height: 300, backgroundColor: '#EC4899', opacity: isDark ? 0.1 : 0.08 }]} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Header Section */}
        <LinearGradient 
          colors={isDark ? ['#4F46E5', '#312E81'] : ['#6366F1', '#818CF8']} 
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.hindiGreeting}>स्वागत है!</Text>
          <Text style={styles.englishGreeting}>Welcome to Sparkle AI</Text>
          <Text style={styles.subGreeting}>Financial intelligence for BITSians</Text>
          
          <View style={{ position: 'relative', zIndex: 1000, marginTop: 20 }}>
            {/* GLASS SEARCH BAR */}
            <View style={[styles.glassSearchContainer, { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 10, opacity: 0.8 }}>🔍</Text>
                  <TextInput
                    style={[styles.textInput, { color: '#FFF' }]} 
                    placeholder="Search 5000+ stocks..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={searchQuery}
                    onChangeText={(t) => { 
                      setSearchQuery(t); 
                      setShowDropdown(t.length > 0); 
                    }}
                    autoCapitalize="characters"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setShowDropdown(false); }}>
                       <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
            </View>

            {/* DROPDOWN */}
            {showDropdown && filteredStocks.length > 0 && (
               <View style={[styles.dropdownContainer, { backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)', borderColor: colors.glassBorder }]}>
                   <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                     {filteredStocks.map((stock, index) => (
                       <TouchableOpacity 
                          key={`${stock["SYMBOL"]}-${index}`} 
                          style={[styles.dropdownItem, { borderBottomColor: colors.glassBorder }]}
                          onPress={() => handleSearch(stock["SYMBOL"])}
                       >
                          <View>
                            <Text style={[styles.dropdownSymbol, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>{stock["SYMBOL"]}</Text>
                            <Text style={{ fontSize: 11, color: colors.subText }} numberOfLines={1}>{stock["NAME OF COMPANY"]}</Text>
                          </View>
                          <Text style={{ fontSize: 16, color: colors.subText }}>→</Text>
                       </TouchableOpacity>
                     ))}
                   </ScrollView>
               </View>
            )}
          </View>
        </LinearGradient>

        <View style={{ padding: 20 }}>

          {/* 1. POPULAR SEARCHES */}
          <View style={[styles.glassCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}>
             <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.cardPadding}>
              <View style={styles.cardHeader}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>🔥</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Trending Now</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['RELIANCE', 'ZOMATO', 'TATASTEEL', 'HDFCBANK', 'VBL', 'BHEL'].map((stock) => (
                  <TouchableOpacity 
                    key={stock} 
                    onPress={() => handleSearch(stock)} 
                    style={[styles.pill, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }]}
                  >
                    <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>{stock}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </View>
          
          {/* 2. WATCHLIST ASSET DISTRIBUTION */}
          {pieData.length > 0 && (
            <View style={[styles.glassCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}>
                <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.cardPadding}>
                    <View style={styles.cardHeader}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>📊</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Portfolio Diversity</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <PieChart
                              data={pieData}
                              donut
                              radius={65}
                              innerRadius={40}
                              focusOnPress
                              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                              innerCircleColor={isDark ? "#1E293B" : "#FFFFFF"} // Matches inner hole to theme
                              centerLabelComponent={() => (
                                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                      <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{watchlistCount}</Text>
                                  </View>
                              )}
                          />
                        </View>
                        <View style={{ flex: 1, paddingLeft: 20 }}>
                            {pieData.slice(0, 4).map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 10 }} />
                                    <View>
                                      <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600' }}>{item.value} {item.label}</Text>
                                      <Text style={{ fontSize: 10, color: colors.subText }}>{item.text} of portfolio</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </BlurView>
            </View>
          )}

          {/* 3. BITS CAMPUS PULSE */}
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
              
              <Text style={{ fontSize: 12, color: colors.subText, marginBottom: 15 }}>
                 Most tracked stocks on campus today
              </Text>

              {[
                { symbol: 'ZOMATO', activity: 'High 🔥', sentiment: 'Bullish', rank: 1, sentColor: colors.success, bg: 'rgba(16, 185, 129, 0.1)' },
                { symbol: 'SUZLON', activity: 'Volatile ⚡', sentiment: 'Caution', rank: 2, sentColor: colors.warning, bg: 'rgba(245, 158, 11, 0.1)' },
                { symbol: 'TATAMOTORS', activity: 'Steady ⚖️', sentiment: 'Hold', rank: 3, sentColor: colors.text, bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
              ].map((item, index) => (
                <TouchableOpacity 
                  key={item.symbol} 
                  onPress={() => handleSearch(item.symbol)}
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

          {/* 4. INTELLIGENCE STEPS */}
          <View style={[styles.glassCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}>
            <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.cardPadding}>
              <View style={styles.cardHeader}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>🧠</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>How It Works</Text>
              </View>
              {[
                { n: 1, t: "Real-Time Data", d: "Tracking 5000+ NSE stocks instantly." },
                { n: 2, t: "Pattern Recognition", d: "AI identifying overbought/oversold levels." },
                { n: 3, t: "Simple Advice", d: "Converting data into clear Buy/Sell signals." }
              ].map((step, i) => (
                <View key={step.n} style={[styles.stepContainer, { marginBottom: i === 2 ? 0 : 20 }]}>
                  <View style={[styles.stepCircle, { backgroundColor: colors.accent }]}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{step.n}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.t}</Text>
                    <Text style={{ fontSize: 12, color: colors.subText, lineHeight: 18 }}>{step.d}</Text>
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
  headerGradient: { 
    borderBottomLeftRadius: 36, 
    borderBottomRightRadius: 36, 
    padding: 24, 
    paddingTop: 60, 
    paddingBottom: 40,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  glowOrb: { position: 'absolute', width: 250, height: 250, borderRadius: 125, filter: 'blur(40px)' }, // Note: filter blur works on web, usually requires image/blurview on native. Keeping opacity logic.
  
  hindiGreeting: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 2, letterSpacing: 1 },
  englishGreeting: { fontSize: 22, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  subGreeting: { fontSize: 13, color: 'rgba(224, 231, 255, 0.8)', marginBottom: 0, letterSpacing: 0.5 },
  
  // Search
  glassSearchContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  textInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  
  // Dropdown
  dropdownContainer: { 
    position: 'absolute', 
    top: 70, 
    left: 0, 
    right: 0, 
    borderRadius: 16, 
    borderWidth: 1, 
    maxHeight: 220, // Approx 4 items
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden'
  },
  dropdownItem: { 
    padding: 14, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1 
  },
  dropdownSymbol: { fontSize: 15, fontWeight: '700', marginBottom: 2 },

  // Cards
  glassCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, marginBottom: 20 },
  cardPadding: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  
  // Pills
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  
  // BITS Pulse
  trendingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rankText: { fontSize: 14, fontWeight: '900', marginRight: 12, opacity: 0.8 },
  trendingSymbol: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '800' },
  sentimentBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },

  // Intelligence
  stepContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2 },
  stepTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
});