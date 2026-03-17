import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ALL_STOCKS_DATA from '../../assets/stocks.json';
import { useTheme } from '../../context/ThemeContext';

// Define Categories
const CATEGORIES = [
  { id: 'ALL', label: 'All Stocks' },
  { id: 'EQ', label: 'Equity' },
  { id: 'SM', label: 'SME (Small/Med)' },
  { id: 'BE', label: 'Trade-to-Trade' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // New: Price Filter State (Simulated since stocks.json lacks price)
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: '', max: '' });

  const colors = {
    bg: isDark ? '#020617' : '#F0F4F8',
    text: isDark ? '#F8FAFC' : '#1E293B',
    subText: isDark ? '#94A3B8' : '#64748B',
    glassBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    glassBg: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    accent: '#6366F1',
    inputBg: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 1)',
  };

  // --- FILTERING LOGIC ---
  const filteredStocks = useMemo(() => {
    let result = ALL_STOCKS_DATA;

    // 1. Text Search
    if (searchQuery) {
      const q = searchQuery.toUpperCase();
      result = result.filter(s => s["SYMBOL"].includes(q) || s["NAME OF COMPANY"].includes(q));
    }

    // 2. Category Filter (Using NSE SERIES codes)
    if (activeCategory !== 'ALL') {
      result = result.filter(s => s["SERIES"] === activeCategory);
    }

    // 3. Price Filter (Simulated using 'PAID UP VALUE' as a placeholder for Price since JSON lacks it)
    // In a real app with price data, you would compare current_price here.
    if (priceRange.min && priceRange.max) {
      const min = parseFloat(priceRange.min);
      const max = parseFloat(priceRange.max);
      // NOTE: Using PAID UP VALUE as a demo field. Replace with 'price' if available.
      result = result.filter(s => {
        const val = parseFloat(s["PAID UP VALUE"] || "0");
        return val >= min && val <= max;
      });
    }

    return result.slice(0, 50); // Limit renders for performance
  }, [searchQuery, activeCategory, priceRange]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 15 }}>Discover</Text>
        
        {/* SEARCH BAR */}
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.glassBorder }]}>
          <Ionicons name="search" size={20} color={colors.subText} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search symbols, companies..."
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {/* Filter Toggle Button */}
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={{ padding: 4 }}>
             <Ionicons name="options" size={24} color={showFilters ? colors.accent : colors.subText} />
          </TouchableOpacity>
        </View>

        {/* CATEGORY CHIPS */}
        <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
           {CATEGORIES.map(cat => (
             <TouchableOpacity
               key={cat.id}
               onPress={() => {
                 setActiveCategory(cat.id);
                 Haptics.selectionAsync();
               }}
               style={[
                 styles.chip,
                 { 
                   backgroundColor: activeCategory === cat.id ? colors.accent : 'transparent',
                   borderColor: activeCategory === cat.id ? colors.accent : colors.glassBorder,
                   borderWidth: 1
                 }
               ]}
             >
               <Text style={{ 
                 color: activeCategory === cat.id ? 'white' : colors.subText, 
                 fontWeight: '600', fontSize: 12 
               }}>
                 {cat.label}
               </Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* EXPANDABLE FILTERS */}
        {showFilters && (
          <View style={[styles.filterPanel, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>Price Range (₹)</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput 
                placeholder="Min" 
                placeholderTextColor={colors.subText}
                keyboardType="numeric"
                value={priceRange.min}
                onChangeText={t => setPriceRange(prev => ({ ...prev, min: t }))}
                style={[styles.rangeInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.glassBorder }]} 
              />
              <TextInput 
                placeholder="Max" 
                placeholderTextColor={colors.subText}
                keyboardType="numeric"
                value={priceRange.max}
                onChangeText={t => setPriceRange(prev => ({ ...prev, max: t }))}
                style={[styles.rangeInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.glassBorder }]} 
              />
            </View>
            <Text style={{ fontSize: 10, color: colors.subText, marginTop: 8 }}>
              *Filtering based on Paid Up Value (Demo Mode)
            </Text>
          </View>
        )}
      </View>

      {/* RESULTS LIST */}
      <FlatList
        data={filteredStocks}
        keyExtractor={item => item["SYMBOL"]}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push(`/(tabs)/explore?stock=${item["SYMBOL"]}`)}
            style={[styles.stockItem, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
          >
             <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={styles.itemBlur}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{item["SYMBOL"]}</Text>
                  <Text style={{ fontSize: 12, color: colors.subText }} numberOfLines={1}>{item["NAME OF COMPANY"]}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                   <Text style={{ fontSize: 10, color: colors.accent, fontWeight: 'bold' }}>{item["SERIES"]}</Text>
                   <Ionicons name="chevron-forward" size={16} color={colors.subText} />
                </View>
             </BlurView>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 50, borderWidth: 1 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '500' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterPanel: { marginTop: 15, padding: 15, borderRadius: 16, borderWidth: 1 },
  rangeInput: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, textAlign: 'center' },
  stockItem: { borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1 },
  itemBlur: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});