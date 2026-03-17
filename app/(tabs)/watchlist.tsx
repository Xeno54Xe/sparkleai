import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Import local master list
import ALL_STOCKS from '../../assets/stocks.json';

export default function WatchlistScreen() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);

  // --- REFINED COLOR PALETTE (Matching Home Tab) ---
  const colors = {
    bg: isDark ? '#020617' : '#F0F4F8', // Deep Slate vs Soft Alice Blue
    text: isDark ? '#F8FAFC' : '#1E293B', // White vs Dark Slate
    subText: isDark ? '#94A3B8' : '#64748B', // Light Gray vs Cool Gray
    
    // Glass Borders & Backgrounds
    glassBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', 
    glassBg: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)',
    
    // Functional Colors
    accent: '#6366F1',     // Indigo (for "Add" button)
    success: '#10B981',    // Emerald (for "Added" checkmark)
    
    // Search Bar
    inputBg: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    placeholder: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
  };

  // Load watchlist on mount
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const saved = await AsyncStorage.getItem('user_watchlist');
        if (saved) setWatchlistSymbols(JSON.parse(saved));
      } catch (e) {
        console.error("AsyncStorage Load Error:", e);
      }
    };
    loadWatchlist();
  }, []);

  const toggleStock = async (symbol: string) => {
    // Trigger Haptic Feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let updated = [...watchlistSymbols];
    if (updated.includes(symbol)) {
      updated = updated.filter(s => s !== symbol);
    } else {
      updated.push(symbol);
    }
    
    setWatchlistSymbols(updated);
    
    try {
      await AsyncStorage.setItem('user_watchlist', JSON.stringify(updated));
    } catch (e) {
      console.error("AsyncStorage Save Error:", e);
    }
  };

  // Local Search Logic
  const displayData = searchQuery.length > 0 
    ? ALL_STOCKS.filter(s => 
        s["SYMBOL"].toUpperCase().includes(searchQuery.toUpperCase()) || 
        s["NAME OF COMPANY"].toUpperCase().includes(searchQuery.toUpperCase())
      ).slice(0, 30) 
    : ALL_STOCKS.filter(s => watchlistSymbols.includes(s["SYMBOL"]));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Decorative Glow Orbs */}
      <View style={[styles.glowOrb, { top: -60, right: -60, backgroundColor: colors.accent, opacity: isDark ? 0.15 : 0.1 }]} />
      <View style={[styles.glowOrb, { top: 100, left: -100, backgroundColor: '#EC4899', opacity: isDark ? 0.1 : 0.08 }]} />
      
      <Text style={[styles.title, { color: colors.text }]}>
        {searchQuery.length > 0 ? 'Add Stocks' : 'My Watchlist'}
      </Text>

      {/* SEARCH BAR */}
      <View style={[styles.glassInputWrapper, { borderColor: colors.glassBorder, backgroundColor: colors.inputBg }]}>
        <BlurView intensity={isDark ? 30 : 70} tint={isDark ? "dark" : "light"} style={styles.glassInput}>
          <Text style={{ fontSize: 18, marginRight: 10, opacity: 0.7, color: colors.text }}>🔍</Text>
          <TextInput 
            placeholder="Search NSE Stocks..."
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { color: colors.text }]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length % 2 === 0) Haptics.selectionAsync(); // Subtle haptic feedback
            }}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
               <Text style={{ color: colors.subText, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {/* STOCK LIST */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item["SYMBOL"]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const isAdded = watchlistSymbols.includes(item["SYMBOL"]);
          return (
            <View style={[styles.stockRow, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}>
              <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.rowBlur}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.symbolText, { color: colors.text }]}>{item["SYMBOL"]}</Text>
                  <Text style={{ color: colors.subText, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {item["NAME OF COMPANY"]}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => toggleStock(item["SYMBOL"])} 
                  style={[
                    styles.actionButton, 
                    { 
                      backgroundColor: isAdded ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)', // Transparent pill bg
                      borderColor: isAdded ? colors.success : colors.accent,
                      borderWidth: 1
                    }
                  ]}
                >
                  <Text style={{ 
                    color: isAdded ? colors.success : colors.accent, 
                    fontSize: 18, 
                    fontWeight: 'bold' 
                  }}>
                    {isAdded ? '✓' : '+'}
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📝</Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              No stocks found
            </Text>
            <Text style={{ color: colors.subText, textAlign: 'center', maxWidth: 250 }}>
              {searchQuery.length > 0 
                ? `We couldn't find "${searchQuery}" in the NSE database.` 
                : "Your watchlist is looking empty. Search above to start tracking!"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20 },
  glowOrb: { position: 'absolute', width: 250, height: 250, borderRadius: 125, filter: 'blur(40px)' }, // Note: 'filter' for web, opacity handles native feel
  
  title: { fontSize: 30, fontWeight: '800', marginBottom: 20, letterSpacing: 0.5 },
  
  // Search
  glassInputWrapper: { borderRadius: 18, overflow: 'hidden', marginBottom: 20, borderWidth: 1 },
  glassInput: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', height: 56 },
  input: { flex: 1, fontSize: 16, fontWeight: '600' },
  
  // Stock Row
  stockRow: { borderRadius: 20, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  rowBlur: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  symbolText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  
  // Action Button
  actionButton: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  emptyContainer: { marginTop: 80, alignItems: 'center', justifyContent: 'center' }
});