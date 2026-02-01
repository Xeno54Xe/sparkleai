import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Ensure the path to your stocks.json is correct
import ALL_STOCKS from '../../assets/stocks.json';

export default function WatchlistScreen() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    text: isDark ? '#F9FAFB' : '#1F2937',
    subText: isDark ? '#9CA3AF' : '#6B7280',
    accent: '#5B21B6',
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
    // 1. Trigger Haptic Feedback on interaction
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

  // 2. Local Search Logic: Uses SYMBOL and NAME OF COMPANY from your JSON
  const displayData = searchQuery.length > 0 
    ? ALL_STOCKS.filter(s => 
        s["SYMBOL"].toUpperCase().includes(searchQuery.toUpperCase()) || 
        s["NAME OF COMPANY"].toUpperCase().includes(searchQuery.toUpperCase())
      ).slice(0, 30) 
    : ALL_STOCKS.filter(s => watchlistSymbols.includes(s["SYMBOL"]));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.circleBlue} />
      
      <Text style={[styles.title, { color: colors.text }]}>
        {searchQuery.length > 0 ? 'Add Stocks' : 'My Watchlist'}
      </Text>

      <View style={styles.glassInputWrapper}>
        <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.glassInput}>
          <TextInput 
            placeholder="Search NSE Stocks..."
            placeholderTextColor={colors.subText}
            style={[styles.input, { color: colors.text }]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              // Light haptic tap while typing
              if (text.length % 2 === 0) Haptics.selectionAsync();
            }}
            autoCapitalize="characters"
          />
        </BlurView>
      </View>

      <FlatList
        data={displayData}
        keyExtractor={(item) => item["SYMBOL"]}
        renderItem={({ item }) => {
          const isAdded = watchlistSymbols.includes(item["SYMBOL"]);
          return (
            <View style={styles.stockRow}>
              <BlurView intensity={15} tint={isDark ? "dark" : "light"} style={styles.rowBlur}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.symbolText, { color: colors.text }]}>{item["SYMBOL"]}</Text>
                  <Text style={{ color: colors.subText, fontSize: 12 }} numberOfLines={1}>
                    {item["NAME OF COMPANY"]}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => toggleStock(item["SYMBOL"])} 
                  style={[
                    styles.actionButton, 
                    { backgroundColor: isAdded ? '#10B981' : colors.accent }
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    {isAdded ? '✓' : '+'}
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.subText, textAlign: 'center' }}>
              {searchQuery.length > 0 ? "No results found." : "Watchlist is empty.\nSearch above to get started."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, paddingHorizontal: 20 },
  circleBlue: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#3B82F6', opacity: 0.1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  glassInputWrapper: { borderRadius: 18, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  glassInput: { paddingHorizontal: 15 },
  input: { height: 55, fontSize: 16, fontWeight: '500' },
  stockRow: { borderRadius: 20, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  rowBlur: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  symbolText: { fontSize: 18, fontWeight: 'bold' },
  actionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  emptyContainer: { marginTop: 50, alignItems: 'center' }
});