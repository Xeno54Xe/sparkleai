import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Gauge from '../../components/Gauge';
import StockChart from '../../components/StockChart'; // <--- Import the new Chart
import { useTheme } from '../../context/ThemeContext';

export default function AnalysisScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme(); 
  const stockName = (params.stock as string) || 'RELIANCE';
  
  const [loading, setLoading] = useState(true);

  // --- DYNAMIC COLORS ---
  const colors = {
    bg: isDark ? '#111827' : '#F9FAFB',
    card: isDark ? '#1F2937' : 'white',
    text: isDark ? '#F9FAFB' : '#1F2937',
    subText: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    header: '#5B21B6',
    
    successBg: isDark ? 'rgba(6, 95, 70, 0.5)' : '#ECFDF5',
    successText: isDark ? '#34D399' : '#059669',
    dangerBg: isDark ? 'rgba(127, 29, 29, 0.5)' : '#FEF2F2',
    dangerText: isDark ? '#F87171' : '#DC2626',
    
    barBg: isDark ? '#374151' : '#E5E7EB',
    predictionBox: isDark ? '#5B21B6' : '#EDE9FE',
    predictionText: isDark ? '#FFFFFF' : '#5B21B6',
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [stockName]);

  const mockData = {
    price: '₹2,847.50',
    change: '+2.3%',
    changeAmount: '+₹64.00',
    recommendation: 'BUY',
    confidence: 85,
    sentiment: 72,
    esg: { environmental: 75, social: 82, governance: 88 },
    dcf: { fairValue: '₹2,950', upside: '+3.6%' },
    prediction: 'BULLISH'
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
        <StatusBar barStyle="light-content" />
        <View style={{
          width: 80, height: 80, backgroundColor: colors.header,
          borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24
        }}>
          <ActivityIndicator size="large" color="white" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
          Analyzing {stockName}
        </Text>
        <Text style={{ fontSize: 14, color: colors.subText, textAlign: 'center', paddingHorizontal: 40 }}>
          AI is processing sentiment, DCF valuation, and price predictions...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 20
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
          {stockName}
        </Text>
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
          {mockData.price}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#34D399', fontWeight: '600' }}>
            {mockData.change}
          </Text>
          <Text style={{ fontSize: 16, color: '#DDD6FE', marginLeft: 8 }}>
            {mockData.changeAmount} Today
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ padding: 20 }}>
        
        {/* Gauge Card */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          marginBottom: 20
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.subText, letterSpacing: 1, marginBottom: 20 }}>
            HEADLINE VERDICT
          </Text>
          
          <Gauge score={mockData.confidence} size={250} />

          <View style={{ 
            marginTop: 10, 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: mockData.recommendation === 'BUY' ? colors.successBg : colors.dangerBg, 
            paddingHorizontal: 16, 
            paddingVertical: 8, 
            borderRadius: 20 
          }}>
             <Text style={{ fontSize: 24, marginRight: 8 }}>
              {mockData.recommendation === 'BUY' ? '🚀' : '⚠️'}
            </Text>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold',
              color: mockData.recommendation === 'BUY' ? colors.successText : colors.dangerText
            }}>
              {mockData.recommendation}
            </Text>
          </View>

          <Text style={{ marginTop: 16, textAlign: 'center', color: colors.subText, fontSize: 14 }}>
            Based on {mockData.confidence}% agreement between Sentinel AI, DCF Models, and Technical Indicators.
          </Text>
        </View>

        {/* Prediction Card */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
              📈 Stock Price Prediction
            </Text>
            <View style={{
              backgroundColor: colors.predictionBox,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8
            }}>
              <Text style={{ color: colors.predictionText, fontSize: 12, fontWeight: '600' }}>
                55% Accuracy
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 28, marginRight: 8 }}>
              {mockData.prediction === 'BULLISH' ? '📊' : '📉'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
              {mockData.prediction} Signal
            </Text>
          </View>
          <Text style={{ color: colors.subText, fontSize: 14, lineHeight: 20 }}>
            Our LSTM model suggests {mockData.prediction === 'BULLISH' ? 'upward' : 'downward'} movement in the next 5 days
          </Text>
        </View>

        {/* --- REAL-TIME CHART SECTION --- */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          overflow: 'hidden'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
              Price Action (1D)
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Live ●</Text>
            </View>
          </View>
          
          <StockChart />
          
        </View>

        {/* Sentiment Meter */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            😊 Sentiment Meter
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.subText, fontSize: 14 }}>Overall Sentiment</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.text }}>
              {mockData.sentiment}%
            </Text>
          </View>
          <View style={{
            width: '100%',
            height: 12,
            backgroundColor: colors.barBg,
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 16
          }}>
            <View style={{
              width: `${mockData.sentiment}%`,
              height: '100%',
              backgroundColor: '#10B981',
              borderRadius: 6
            }} />
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(209, 250, 229, 0.2)' : '#D1FAE5', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: isDark ? '#D1D5DB' : '#6B7280', marginBottom: 4 }}>Reddit</Text>
              <Text style={{ fontWeight: 'bold', color: '#059669', fontSize: 13 }}>Positive</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(219, 234, 254, 0.2)' : '#DBEAFE', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: isDark ? '#D1D5DB' : '#6B7280', marginBottom: 4 }}>News</Text>
              <Text style={{ fontWeight: 'bold', color: '#2563EB', fontSize: 13 }}>Neutral</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(254, 243, 199, 0.2)' : '#FEF3C7', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: isDark ? '#D1D5DB' : '#6B7280', marginBottom: 4 }}>Filings</Text>
              <Text style={{ fontWeight: 'bold', color: '#D97706', fontSize: 13 }}>Mixed</Text>
            </View>
          </View>
        </View>

        {/* ESG Rating */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            🌱 ESG Rating
          </Text>
          
          <View style={{ gap: 16 }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: colors.subText }}>Environmental</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>B+</Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: colors.barBg, borderRadius: 4 }}>
                <View style={{ width: '75%', height: '100%', backgroundColor: '#10B981', borderRadius: 4 }} />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: colors.subText }}>Social</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>A-</Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: colors.barBg, borderRadius: 4 }}>
                <View style={{ width: '82%', height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 }} />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: colors.subText }}>Governance</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>A</Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: colors.barBg, borderRadius: 4 }}>
                <View style={{ width: '88%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 }} />
              </View>
            </View>
          </View>
        </View>

        {/* DCF Valuation */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            💰 DCF Valuation
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.subText, fontSize: 14 }}>Fair Value</Text>
              <Text style={{ fontWeight: 'bold', color: '#10B981', fontSize: 16 }}>
                {mockData.dcf.fairValue}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.subText, fontSize: 14 }}>Current Price</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{mockData.price}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.subText, fontSize: 14 }}>Upside Potential</Text>
              <Text style={{ fontWeight: 'bold', color: '#10B981', fontSize: 16 }}>
                {mockData.dcf.upside}
              </Text>
            </View>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity style={{
          backgroundColor: colors.header,
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 40
        }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>📄</Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Generate Full AI Report
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}