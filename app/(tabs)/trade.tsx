import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';

// IMPORT LOCAL JSON DATA
import ALL_STOCKS from '../../assets/stocks.json';

const { width } = Dimensions.get('window');
const API_URL = 'http://172.17.107.124:5000'; 

export default function TradeScreen() {
  const { isDark } = useTheme();
  
  // Data State
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [userWatchlist, setUserWatchlist] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState('1D');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Real Data State
  const [price, setPrice] = useState('...');
  const [change, setChange] = useState('');
  const [stats, setStats] = useState<any[]>([]);
  const [isPositive, setIsPositive] = useState(true);
  const [marketStatus, setMarketStatus] = useState({ text: 'Checking...', color: '#9CA3AF' });

  // Scale States
  const [yAxisOffset, setYAxisOffset] = useState(0); 
  const [maxValue, setMaxValue] = useState(100);     
  const [paddingFactor, setPaddingFactor] = useState(0.05); 
  const [stockModeKey, setStockModeKey] = useState(0); 
  const dataStats = useRef({ min: 0, max: 100, range: 100 });

  // Theme Colors
  const bg = isDark ? '#111827' : '#FFFFFF';
  const text = isDark ? '#F9FAFB' : '#1F2937';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#1F2937' : '#F3F4F6';
  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const dropdownBg = isDark ? '#374151' : '#FFFFFF';
  const activeTabBg = isDark ? '#374151' : '#E5E7EB';
  const btnBg = isDark ? '#374151' : '#E5E7EB';

  // --- SYNC WATCHLIST ---
  useFocusEffect(
    useCallback(() => {
      const loadWatchlist = async () => {
        const saved = await AsyncStorage.getItem('user_watchlist');
        if (saved) {
          const symbols = JSON.parse(saved);
          const fullList = symbols.map((sym: string) => {
            const found = ALL_STOCKS.find(s => s["SYMBOL"] === sym);
            return {
              symbol: sym,
              name: found ? found["NAME OF COMPANY"] : ''
            };
          });
          setUserWatchlist(fullList);
          if (!selectedStock && fullList.length > 0) {
            setSelectedStock(fullList[0]);
          }
        } else {
          setUserWatchlist([]);
        }
      };
      loadWatchlist();
    }, [selectedStock])
  );

  // --- MARKET STATUS LOGIC ---
  const updateMarketStatus = () => {
    const now = new Date();
    const day = now.getDay(); 
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const OPEN_MINS = 9 * 60 + 15;  
    const CLOSE_MINS = 15 * 60 + 30; 
    const isWeekday = day >= 1 && day <= 5;
    const isOpen = isWeekday && totalMinutes >= OPEN_MINS && totalMinutes < CLOSE_MINS;

    if (isOpen) {
        setMarketStatus({ text: '● Market Open (Closes 3:30 PM)', color: '#10B981' });
    } else {
        let nextOpen = new Date(now);
        nextOpen.setHours(9, 15, 0, 0);
        if (totalMinutes >= CLOSE_MINS) nextOpen.setDate(nextOpen.getDate() + 1);
        if (nextOpen.getDay() === 6) nextOpen.setDate(nextOpen.getDate() + 2); 
        if (nextOpen.getDay() === 0) nextOpen.setDate(nextOpen.getDate() + 1); 
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', hour: 'numeric', minute: '2-digit' };
        setMarketStatus({ text: `● Market Closed (Opens ${nextOpen.toLocaleDateString('en-US', options)})`, color: '#EF4444' });
    }
  };

  const cleanLabels = (data: any[], range: string) => {
    if (!data || data.length === 0) return [];
    let step = 1;
    if (data.length > 10) step = 5;
    if (data.length > 30) step = 10;
    if (data.length > 50) step = 15;

    return data.map((item, index) => {
      const originalLabel = item.label || "";
      let showAxisLabel = false;
      if (index === 0 || index === data.length - 1) showAxisLabel = true;
      else if (range === '1D') {
        const parts = originalLabel.split(':');
        if (parts.length === 2 && parseInt(parts[1], 10) % 5 === 0) showAxisLabel = true;
      } else {
        if (index % step === 0) showAxisLabel = true;
      }

      return { 
          ...item, 
          label: showAxisLabel ? originalLabel : '', 
          timeLabel: originalLabel, 
          showVerticalLine: showAxisLabel,
          verticalLineColor: gridColor,
          verticalLineThickness: 1,
          verticalLineStrokeDashArray: [4, 4],
          dataPointColor: item.value >= (data[index-1]?.value || 0) ? '#10B981' : '#EF4444',
          showDataPoint: showAxisLabel, 
      };
    });
  };

  const fetchStockData = async () => {
    if (!selectedStock) return;
    setLoading(true);
    updateMarketStatus();
    try {
      const response = await fetch(`${API_URL}/stock?symbol=${selectedStock.symbol}&range=${selectedRange}`);
      const data = await response.json();
      if (data.error) { return; }

      setPrice(data.price);
      setChange(data.change_percent);
      setIsPositive(data.is_up);
      setStats(data.stats);
      
      if (data.graph_data && data.graph_data.length > 0) {
        const values = data.graph_data.map((d: any) => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        let rangeDiff = max - min || min * 0.01; 

        dataStats.current = { min, max, range: rangeDiff };
        const padding = rangeDiff * 0.05; 
        setYAxisOffset(Math.max(0, min - padding));
        setMaxValue(rangeDiff + (padding * 2));
        setPaddingFactor(0.05); 
        setCurrentData(cleanLabels(data.graph_data, selectedRange));
        setStockModeKey(prev => prev + 1); 
      }
    } catch (error) { console.error("Fetch Error:", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStockData(); }, [selectedStock, selectedRange]);

  const applyZoom = (newFactor: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Haptic for Zoom
    if (newFactor < 0.001 || newFactor > 5.0) return;
    setPaddingFactor(newFactor);
    const center = yAxisOffset + (maxValue / 2);
    const newHeight = dataStats.current.range + (dataStats.current.range * newFactor * 2); 
    setYAxisOffset(Math.max(0, center - (newHeight / 2)));
    setMaxValue(newHeight);
  };

  const autoFit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Haptic for Fit
    const { min, range } = dataStats.current;
    const padding = range * 0.05; 
    setYAxisOffset(Math.max(0, min - padding));
    setMaxValue(range + (padding * 2));
    setPaddingFactor(0.05);
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }} nestedScrollEnabled={true}>
        
        {/* 1. HEADER */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10, zIndex: 100 }}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.selectionAsync(); // Haptic for dropdown
              setShowDropdown(!showDropdown);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, alignSelf: 'flex-start' }}
          >
            <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: text, letterSpacing: 1, marginRight: 6 }}>
                {selectedStock ? selectedStock.symbol : "SELECT STOCK"} ▼
                </Text>
                <Text style={{ fontSize: 12, color: subText }} numberOfLines={1}>
                {selectedStock ? selectedStock.name : "Choose from watchlist"}
                </Text>
            </View>
          </TouchableOpacity>

          {showDropdown && (
            <View style={{ position: 'absolute', top: 110, left: 20, width: 280, maxHeight: 250, backgroundColor: dropdownBg, borderRadius: 12, borderWidth: 1, borderColor: gridColor, elevation: 10, zIndex: 9999 }}>
              <ScrollView nestedScrollEnabled={true}>
                {userWatchlist.length > 0 ? userWatchlist.map((stock) => (
                  <TouchableOpacity 
                    key={stock.symbol} 
                    style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: gridColor }} 
                    onPress={() => { 
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Haptic for selection
                      setSelectedStock(stock); 
                      setShowDropdown(false); 
                    }}
                  >
                    <Text style={{ color: text, fontWeight: 'bold', fontSize: 14 }}>{stock.symbol}</Text>
                    <Text style={{ color: subText, fontSize: 11 }} numberOfLines={1}>{stock.name}</Text>
                  </TouchableOpacity>
                )) : (
                  <View style={{ padding: 20 }}><Text style={{ color: subText }}>Add stocks in Watchlist first!</Text></View>
                )}
              </ScrollView>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: text, marginRight: 10 }}>{price}</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: isPositive ? '#10B981' : '#EF4444', marginBottom: 6 }}>{change}</Text>
          </View>
          <Text style={{ color: marketStatus.color, fontSize: 13, fontWeight: '600', marginTop: 4 }}>{marketStatus.text}</Text>
        </View>

        {/* 2. TIMEFRAME */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10, zIndex: -1 }}>
          {['1D', '1W', '1M', '1Y'].map((range) => (
            <TouchableOpacity 
              key={range} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Haptic for timeframe
                setSelectedRange(range);
              }} 
              style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: selectedRange === range ? activeTabBg : 'transparent', borderWidth: 1, borderColor: selectedRange === range ? gridColor : 'transparent' }}
            >
              <Text style={{ color: selectedRange === range ? text : subText, fontWeight: '600', fontSize: 13 }}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. CHART AREA */}
        <View style={{ flexDirection: 'row', height: 380, width: width, paddingRight: 10, zIndex: -1 }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {loading && currentData.length === 0 ? (
               <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}><ActivityIndicator size="large" color="#10B981" /></View>
            ) : selectedStock ? (
              <View style={{ height: 380 }}> 
                  <LineChart
                      key={`chart-${stockModeKey}`} 
                      areaChart data={currentData} height={300} width={width - 80} scrollable spacing={selectedRange === '1D' ? 40 : 30} initialSpacing={10} scrollToEnd
                      animationDuration={0} animateOnDataChange={false} yAxisOffset={yAxisOffset} maxValue={maxValue}
                      color={isPositive ? '#10B981' : '#EF4444'} thickness={2} startFillColor={isPositive ? '#10B981' : '#EF4444'} endFillColor={isPositive ? '#10B981' : '#EF4444'} startOpacity={0.2} endOpacity={0.0}
                      showVerticalLines={false} xAxisThickness={0} hideYAxisText={false} yAxisLabelWidth={45} 
                      yAxisTextStyle={{ color: subText, fontSize: 10 }} yAxisColor={'transparent'} yAxisThickness={0} noOfSections={4}
                      xAxisLabelTextStyle={{ color: subText, fontSize: 10, width: 60, textAlign: 'center', marginTop: 4 }}
                      pointerConfig={{
                          activatePointersOnLongPress: true, pointerStripHeight: 300, pointerStripColor: subText, radius: 6, pointerLabelWidth: 100, pointerLabelHeight: 60, autoAdjustPointerLabelPosition: true,
                          pointerLabelComponent: (items: any) => (
                              <View style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: isDark ? '#374151' : 'black', borderRadius: 8 }}>
                                  <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>{items[0].value}</Text>
                                  <Text style={{ color: '#D1D5DB', fontSize: 11, marginTop: 2, textAlign: 'center' }}>{items[0].timeLabel}</Text>
                              </View>
                          ),
                      }}
                  />
                  <View style={{ position: 'absolute', bottom: 58, left: 45, right: 0, height: 1, backgroundColor: gridColor }} />
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: subText }}>No stock selected</Text></View>
            )}
          </View>
          <View style={{ width: 40, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
             <TouchableOpacity onPress={() => applyZoom(paddingFactor / 1.5)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: btnBg, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20, color: text, fontWeight: 'bold' }}>+</Text></TouchableOpacity>
             <TouchableOpacity onPress={autoFit} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: btnBg, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 12, color: subText, fontWeight: 'bold' }}>FIT</Text></TouchableOpacity>
             <TouchableOpacity onPress={() => applyZoom(paddingFactor * 1.5)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: btnBg, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20, color: text, fontWeight: 'bold' }}>-</Text></TouchableOpacity>
          </View>
        </View>

        {/* 4. REAL STATS */}
        <View style={{ paddingHorizontal: 20, marginTop: 10, paddingBottom: 40, zIndex: -1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: text, marginBottom: 16 }}>Market Stats ({selectedRange})</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            {stats.map((stat, index) => (
              <View key={index} style={{ width: '48%', backgroundColor: cardBg, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: gridColor }}>
                <Text style={{ color: subText, fontSize: 12, marginBottom: 4 }}>{stat.label}</Text>
                <Text style={{ color: text, fontSize: 16, fontWeight: 'bold' }}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}