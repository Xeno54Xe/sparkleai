import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AnalysisScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const stockName = params.stock as string || 'RELIANCE';
  
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [stockName]);

  // Mock data - will be replaced by your backend
  const mockData = {
    price: '₹2,847.50',
    change: '+2.3%',
    changeAmount: '+₹64.00',
    recommendation: 'BUY',
    confidence: 78,
    sentiment: 72,
    esg: { environmental: 75, social: 82, governance: 88 },
    dcf: { fairValue: '₹2,950', upside: '+3.6%' },
    prediction: 'BULLISH'
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: '#5B21B6',
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <ActivityIndicator size="large" color="white" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
          Analyzing {stockName}
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40 }}>
          AI is processing sentiment, DCF valuation, and price predictions...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#5B21B6',
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

      {/* AI Recommendation - THE MAIN CARD */}
      <View style={{ padding: 20 }}>
        <View style={{
          backgroundColor: mockData.recommendation === 'BUY' ? '#D1FAE5' : 
                         mockData.recommendation === 'SELL' ? '#FEE2E2' : '#FEF3C7',
          borderRadius: 24,
          padding: 24,
          borderWidth: 3,
          borderColor: mockData.recommendation === 'BUY' ? '#10B981' : 
                       mockData.recommendation === 'SELL' ? '#EF4444' : '#F59E0B',
          marginBottom: 20
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280' }}>
              AI RECOMMENDATION
            </Text>
            <View style={{
              backgroundColor: '#5B21B6',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {mockData.confidence}% Confidence
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 48, marginRight: 12 }}>
              {mockData.recommendation === 'BUY' ? '✅' : 
               mockData.recommendation === 'SELL' ? '❌' : '⏸️'}
            </Text>
            <Text style={{ 
              fontSize: 36, 
              fontWeight: 'bold',
              color: mockData.recommendation === 'BUY' ? '#059669' : 
                     mockData.recommendation === 'SELL' ? '#DC2626' : '#D97706'
            }}>
              {mockData.recommendation}
            </Text>
          </View>
          
          {/* Confidence Meter */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                Accuracy Meter
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1F2937' }}>
                {mockData.confidence}/100
              </Text>
            </View>
            <View style={{
              width: '100%',
              height: 12,
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 6,
              overflow: 'hidden'
            }}>
              <View style={{
                width: `${mockData.confidence}%`,
                height: '100%',
                backgroundColor: mockData.recommendation === 'BUY' ? '#10B981' : 
                                 mockData.recommendation === 'SELL' ? '#EF4444' : '#F59E0B',
                borderRadius: 6
              }} />
            </View>
          </View>
        </View>

        {/* AI Prediction */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
              📈 Stock Price Prediction
            </Text>
            <View style={{
              backgroundColor: '#EDE9FE',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8
            }}>
              <Text style={{ color: '#5B21B6', fontSize: 12, fontWeight: '600' }}>
                55% Accuracy
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 28, marginRight: 8 }}>
              {mockData.prediction === 'BULLISH' ? '📊' : '📉'}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937' }}>
              {mockData.prediction} Signal
            </Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 20 }}>
            Our LSTM model suggests {mockData.prediction === 'BULLISH' ? 'upward' : 'downward'} movement in the next 5 days
          </Text>
        </View>

        {/* Sentiment Analysis */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
            😊 Sentiment Meter
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Overall Sentiment</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#1F2937' }}>
              {mockData.sentiment}%
            </Text>
          </View>
          <View style={{
            width: '100%',
            height: 12,
            backgroundColor: '#E5E7EB',
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
            <View style={{ flex: 1, backgroundColor: '#D1FAE5', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 4 }}>Reddit</Text>
              <Text style={{ fontWeight: 'bold', color: '#059669', fontSize: 13 }}>Positive</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#DBEAFE', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 4 }}>News</Text>
              <Text style={{ fontWeight: 'bold', color: '#2563EB', fontSize: 13 }}>Neutral</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 4 }}>Filings</Text>
              <Text style={{ fontWeight: 'bold', color: '#D97706', fontSize: 13 }}>Mixed</Text>
            </View>
          </View>
        </View>

        {/* ESG Score */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
            🌱 ESG Rating
          </Text>
          
          <View style={{ gap: 16 }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Environmental</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>B+</Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                <View style={{ width: '75%', height: '100%', backgroundColor: '#10B981', borderRadius: 4 }} />
              </View>
            </View>
            
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Social</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>A-</Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                <View style={{ width: '82%', height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 }} />
              </View>
            </View>
            
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Governance</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>A</Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                <View style={{ width: '88%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 }} />
              </View>
            </View>
          </View>
        </View>

        {/* DCF Valuation */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
            💰 DCF Valuation
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Fair Value</Text>
              <Text style={{ fontWeight: 'bold', color: '#10B981', fontSize: 16 }}>
                {mockData.dcf.fairValue}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Current Price</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{mockData.price}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Upside Potential</Text>
              <Text style={{ fontWeight: 'bold', color: '#10B981', fontSize: 16 }}>
                {mockData.dcf.upside}
              </Text>
            </View>
          </View>
        </View>

        {/* Generate Full Report Button */}
        <TouchableOpacity style={{
          backgroundColor: '#5B21B6',
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