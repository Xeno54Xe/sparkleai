import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Gauge from '../../components/Gauge';
import StockChart from '../../components/StockChart';
import SegmentedGauge from '../../components/technical/SegmentedGauge';
import TechnicalIndicatorHeatmap from '../../components/technical/TechnicalIndicatorHeatmap';
import SentimentBar from '../../components/technical/SentimentBar';
import CandlestickCard from '../../components/technical/CandlestickCard';
import { calculateVerdict } from '../../components/technical/verdictCalculator';
import { useTheme } from '../../context/ThemeContext';

// ─── API CONFIG ─────────────────────────────────────────────
// Update this to your FastAPI server IP
const TECHNICAL_API = 'http://127.0.0.1:8000';

export default function AnalysisScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const stockName = (params.stock as string) || 'RELIANCE';

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'fundamental' | 'technical'>('fundamental');
  const [techTab, setTechTab] = useState<'overview' | 'sentiment' | 'indicators' | 'charts' | 'events'>('overview');
  const [techData, setTechData] = useState<any>(null);
  const [techLoading, setTechLoading] = useState(false);

  // ─── COLORS ───────────────────────────────────────────────
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
    activePill: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
    activePillBorder: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.3)',
    activePillText: '#818CF8',
    inactivePill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    inactivePillBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  };

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: '#000' as const,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  // ─── MOCK FUNDAMENTAL DATA ────────────────────────────────
  const mockData = {
    price: '₹2,847.50',
    change: '+2.3%',
    changeAmount: '+₹64.00',
    recommendation: 'BUY',
    confidence: 85,
    sentiment: 72,
    esg: { environmental: 75, social: 82, governance: 88 },
    dcf: { fairValue: '₹2,950', upside: '+3.6%' },
    prediction: 'BULLISH',
  };

  // ─── MOCK TECHNICAL DATA ──────────────────────────────────
  // In production, this would come from your /technical/{ticker} and /signal/{ticker} APIs
  const mockTechData = {
    price: 2847.5, prevClose: 2783.5,
    RSI: 62.4, SMA50: 2780.5, SMA200: 2650.3,
    MACD: 15.8, MACDSignal: 12.3, MACDHist: 3.5,
    bollingerUpper: 2920.0, bollingerMiddle: 2847.5, bollingerLower: 2775.0,
    ADX: 28.5, ATR: 45.2, OBV: 12500000, VWAP: 2835.0,
    stochK: 71.2, stochD: 68.5, EMA20: 2830.1, EMA9: 2842.3,
    CCI: 85.3, WilliamsR: -28.7, MFI: 58.2, ROC: 3.2,
    ichimokuTenkan: 2840, ichimokuKijun: 2810,
    pivotPoint: 2830,
    support: { S1: 2790, S2: 2745, S3: 2700 },
    resistance: { R1: 2880, R2: 2920, R3: 2960 },
    crossovers: {
      shortTerm: { name: '5 & 20 SMA', status: 'Bullish', daysAgo: 3 },
      longTerm: { name: '20 & 50 SMA', status: 'Bearish', daysAgo: 8 },
      golden: { name: '50 & 200 SMA', status: 'Bullish', daysAgo: 45 },
    },
    candle: {
      latest: 'Bullish Engulfing',
      type: 'bullish' as const,
      reliability: 'High',
      description: 'A large green candle completely engulfs the previous red candle — signals strong buying pressure and potential reversal.',
    },
    events: [
      { event: 'Bullish RSI Divergence', time: '16 Mar 2026 15:15', type: 'bullish' },
      { event: 'Bullish Engulfing', time: '16 Mar 2026 14:15', type: 'bullish' },
      { event: 'Bullish CCI Crossover', time: '16 Mar 2026 13:15', type: 'bullish' },
      { event: 'Volatility Expansion', time: '16 Mar 2026 09:15', type: 'neutral' },
      { event: 'Doji', time: '13 Mar 2026 13:15', type: 'neutral' },
      { event: 'Bearish SMA Cross (5,20)', time: '12 Mar 2026 10:30', type: 'bearish' },
      { event: 'Volume Spike (+180%)', time: '11 Mar 2026 14:00', type: 'neutral' },
    ],
  };

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API calls
    // fetchTechnicalData();
    setTechData(mockTechData);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [stockName]);

  // ─── FETCH TECHNICAL DATA (for when backend is ready) ─────
  // const fetchTechnicalData = async () => {
  //   setTechLoading(true);
  //   try {
  //     const ticker = `${stockName}.NS`;
  //     const [techRes, signalRes] = await Promise.all([
  //       fetch(`${TECHNICAL_API}/technical/${ticker}`),
  //       fetch(`${TECHNICAL_API}/signal/${ticker}`),
  //     ]);
  //     const techJson = await techRes.json();
  //     const signalJson = await signalRes.json();
  //     // Merge with mock data for missing fields
  //     setTechData({ ...mockTechData, ...techJson, signal: signalJson.signal });
  //   } catch (e) {
  //     console.error('Technical API Error:', e);
  //     setTechData(mockTechData);
  //   } finally {
  //     setTechLoading(false);
  //   }
  // };

  const verdict = techData ? calculateVerdict(techData) : null;

  // ─── LOADING STATE ────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ width: 80, height: 80, backgroundColor: colors.header, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <ActivityIndicator size="large" color="white" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Analyzing {stockName}</Text>
        <Text style={{ fontSize: 14, color: colors.subText, textAlign: 'center', paddingHorizontal: 40 }}>
          AI is processing sentiment, DCF valuation, technical indicators, and price predictions...
        </Text>
      </View>
    );
  }

  // ─── HELPER: Section Pill Button ──────────────────────────
  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: active ? colors.activePill : colors.inactivePill,
        borderWidth: 1,
        borderColor: active ? colors.activePillBorder : colors.inactivePillBorder,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? colors.activePillText : colors.subText }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // ─── HELPER: Card wrapper ─────────────────────────────────
  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: object }) => (
    <View style={{ ...cardStyle, ...style }}>{children}</View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" />

      {/* ═══════ HEADER ═══════ */}
      <View style={{ backgroundColor: colors.header, paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>{stockName}</Text>
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>{mockData.price}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#34D399', fontWeight: '600' }}>{mockData.change}</Text>
          <Text style={{ fontSize: 16, color: '#DDD6FE', marginLeft: 8 }}>{mockData.changeAmount} Today</Text>
        </View>
      </View>

      {/* ═══════ SECTION SWITCHER ═══════ */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Pill label="📊 Fundamental" active={activeSection === 'fundamental'} onPress={() => setActiveSection('fundamental')} />
        <Pill label="📈 Technical" active={activeSection === 'technical'} onPress={() => setActiveSection('technical')} />
      </View>

      <View style={{ padding: 20 }}>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ═══════ FUNDAMENTAL ANALYSIS SECTION ═══════════════ */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeSection === 'fundamental' && (
          <>
            {/* Gauge Card */}
            <Card style={{ alignItems: 'center', padding: 24, borderRadius: 24, marginBottom: 20, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.subText, letterSpacing: 1, marginBottom: 20 }}>HEADLINE VERDICT</Text>
              <Gauge score={mockData.confidence} size={250} />
              <View style={{
                marginTop: 10, flexDirection: 'row', alignItems: 'center',
                backgroundColor: mockData.recommendation === 'BUY' ? colors.successBg : colors.dangerBg,
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
              }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>{mockData.recommendation === 'BUY' ? '🚀' : '⚠️'}</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: mockData.recommendation === 'BUY' ? colors.successText : colors.dangerText }}>{mockData.recommendation}</Text>
              </View>
              <Text style={{ marginTop: 16, textAlign: 'center', color: colors.subText, fontSize: 14 }}>
                Based on {mockData.confidence}% agreement between Sentinel AI, DCF Models, and Technical Indicators.
              </Text>
            </Card>

            {/* Prediction */}
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>📈 Stock Price Prediction</Text>
                <View style={{ backgroundColor: colors.predictionBox, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: colors.predictionText, fontSize: 12, fontWeight: '600' }}>55% Accuracy</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 28, marginRight: 8 }}>{mockData.prediction === 'BULLISH' ? '📊' : '📉'}</Text>
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>{mockData.prediction} Signal</Text>
              </View>
              <Text style={{ color: colors.subText, fontSize: 14, lineHeight: 20 }}>
                Our LSTM model suggests {mockData.prediction === 'BULLISH' ? 'upward' : 'downward'} movement in the next 5 days
              </Text>
            </Card>

            {/* Chart */}
            <Card style={{ padding: 16, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Price Action (1D)</Text>
                <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Live ●</Text>
              </View>
              <StockChart />
            </Card>

            {/* Sentiment */}
            <Card>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>😊 Sentiment Meter</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.subText, fontSize: 14 }}>Overall Sentiment</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.text }}>{mockData.sentiment}%</Text>
              </View>
              <View style={{ width: '100%', height: 12, backgroundColor: colors.barBg, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                <View style={{ width: `${mockData.sentiment}%`, height: '100%', backgroundColor: '#10B981', borderRadius: 6 }} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { label: 'Reddit', sentiment: 'Positive', bg: isDark ? 'rgba(209,250,229,0.2)' : '#D1FAE5', col: '#059669' },
                  { label: 'News', sentiment: 'Neutral', bg: isDark ? 'rgba(219,234,254,0.2)' : '#DBEAFE', col: '#2563EB' },
                  { label: 'Filings', sentiment: 'Mixed', bg: isDark ? 'rgba(254,243,199,0.2)' : '#FEF3C7', col: '#D97706' },
                ].map(s => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: isDark ? '#D1D5DB' : '#6B7280', marginBottom: 4 }}>{s.label}</Text>
                    <Text style={{ fontWeight: 'bold', color: s.col, fontSize: 13 }}>{s.sentiment}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* ESG */}
            <Card>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>🌱 ESG Rating</Text>
              {[
                { label: 'Environmental', grade: 'B+', pct: 75, col: '#10B981' },
                { label: 'Social', grade: 'A-', pct: 82, col: '#3B82F6' },
                { label: 'Governance', grade: 'A', pct: 88, col: '#8B5CF6' },
              ].map(e => (
                <View key={e.label} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, color: colors.subText }}>{e.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{e.grade}</Text>
                  </View>
                  <View style={{ width: '100%', height: 8, backgroundColor: colors.barBg, borderRadius: 4 }}>
                    <View style={{ width: `${e.pct}%`, height: '100%', backgroundColor: e.col, borderRadius: 4 }} />
                  </View>
                </View>
              ))}
            </Card>

            {/* DCF */}
            <Card>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>💰 DCF Valuation</Text>
              {[
                { label: 'Fair Value', value: mockData.dcf.fairValue, col: '#10B981' },
                { label: 'Current Price', value: mockData.price, col: colors.text },
              ].map(r => (
                <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: colors.subText, fontSize: 14 }}>{r.label}</Text>
                  <Text style={{ fontWeight: 'bold', color: r.col, fontSize: 16 }}>{r.value}</Text>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.subText, fontSize: 14 }}>Upside Potential</Text>
                <Text style={{ fontWeight: 'bold', color: '#10B981', fontSize: 16 }}>{mockData.dcf.upside}</Text>
              </View>
            </Card>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ═══════ TECHNICAL ANALYSIS SECTION ═════════════════ */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeSection === 'technical' && techData && verdict && (
          <>
            {/* Tech Sub-tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14, marginHorizontal: -20, paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {([
                  ['overview', 'Overview'],
                  ['sentiment', 'Sentiment'],
                  ['indicators', 'Indicators'],
                  ['events', 'Events'],
                ] as const).map(([id, label]) => (
                  <Pill key={id} label={label} active={techTab === id} onPress={() => setTechTab(id)} />
                ))}
              </View>
            </ScrollView>

            {/* ══════ OVERVIEW ══════ */}
            {techTab === 'overview' && (
              <>
                {/* Technical Verdict */}
                <Card style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.subText, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>
                    TECHNICAL VERDICT
                  </Text>
                  <SegmentedGauge
                    value={verdict.overallScore}
                    size={220}
                    label={verdict.overallScore >= 60 ? 'Bullish' : verdict.overallScore <= 40 ? 'Bearish' : 'Neutral'}
                  />
                  {/* Signal badge */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
                    backgroundColor: verdict.signal === 'BUY' ? colors.successBg : verdict.signal === 'SELL' ? colors.dangerBg : (isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7'),
                    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
                  }}>
                    <Text style={{ fontSize: 20 }}>{verdict.signal === 'BUY' ? '🚀' : verdict.signal === 'SELL' ? '📉' : '⏸️'}</Text>
                    <Text style={{
                      fontSize: 20, fontWeight: '800',
                      color: verdict.signal === 'BUY' ? colors.successText : verdict.signal === 'SELL' ? colors.dangerText : '#D97706',
                    }}>{verdict.signal}</Text>
                  </View>
                  {/* Buy/Sell/Neutral counts */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                    {[
                      { c: '#10B981', v: verdict.buys, l: 'Buy' },
                      { c: '#EF4444', v: verdict.sells, l: 'Sell' },
                      { c: '#F59E0B', v: verdict.neutrals, l: 'Neutral' },
                    ].map(i => (
                      <View key={i.l} style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: i.c }}>{i.v}</Text>
                        <Text style={{ fontSize: 9, color: colors.subText }}>{i.l}</Text>
                      </View>
                    ))}
                  </View>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>🧮 How the verdict is calculated</Text>
                  {[
                    { name: 'Trend (25%)', score: verdict.trendScore, factors: 'SMA50, SMA200, EMA20, EMA9, Ichimoku' },
                    { name: 'Momentum (25%)', score: verdict.momentumScore, factors: 'MACD, MACD Histogram, ROC, ADX' },
                    { name: 'Oscillators (20%)', score: verdict.oscillatorScore, factors: 'RSI, Stochastic, CCI, Williams %R, MFI' },
                    { name: 'Volume (15%)', score: verdict.volumeScore, factors: 'VWAP position, OBV direction' },
                    { name: 'Patterns (15%)', score: verdict.patternScore, factors: 'Candlestick pattern, SMA crossovers' },
                  ].map((cat, i) => {
                    const col = cat.score < 35 ? '#EF4444' : cat.score < 55 ? '#F59E0B' : '#10B981';
                    return (
                      <View key={i} style={{ marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{cat.name}</Text>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: col }}>{cat.score}</Text>
                        </View>
                        <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.barBg, overflow: 'hidden', marginBottom: 3 }}>
                          <View style={{ height: '100%', width: `${cat.score}%`, borderRadius: 3, backgroundColor: col }} />
                        </View>
                        <Text style={{ fontSize: 9, color: colors.subText }}>{cat.factors}</Text>
                      </View>
                    );
                  })}
                </Card>

                {/* Candlestick Pattern */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>🕯️ Latest Candlestick Pattern</Text>
                  <CandlestickCard candle={techData.candle} />
                </Card>

                {/* Support & Resistance */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>🎯 Support & Resistance Levels</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 }}>SUPPORT</Text>
                      {Object.entries(techData.support).map(([k, v]: [string, any]) => (
                        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                          <Text style={{ fontSize: 12, color: colors.subText }}>{k}</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#10B981' }}>₹{v}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 }}>RESISTANCE</Text>
                      {Object.entries(techData.resistance).map(([k, v]: [string, any]) => (
                        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                          <Text style={{ fontSize: 12, color: colors.subText }}>{k}</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>₹{v}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Card>

                {/* SMA Crossovers */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>✂️ Moving Average Crossovers</Text>
                  {Object.values(techData.crossovers).map((c: any, i: number) => {
                    const bull = c.status === 'Bullish';
                    return (
                      <View key={i} style={{
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                        paddingVertical: 12, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: colors.border,
                      }}>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{c.name} Crossover</Text>
                          <Text style={{ fontSize: 10, color: colors.subText, marginTop: 2 }}>{c.daysAgo} days ago</Text>
                        </View>
                        <View style={{
                          backgroundColor: bull ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          borderWidth: 1, borderColor: bull ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: bull ? '#10B981' : '#EF4444' }}>{c.status}</Text>
                        </View>
                      </View>
                    );
                  })}
                </Card>

                {/* Explainer */}
                <Card style={{
                  backgroundColor: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.04)',
                  borderColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.15)',
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#818CF8', marginBottom: 8 }}>💡 What does this all mean?</Text>
                  <Text style={{ fontSize: 12, color: colors.subText, lineHeight: 20 }}>
                    In simple words: {verdict.buys} out of 11 indicators suggest buying. The stock recently formed a{' '}
                    <Text style={{ color: techData.candle.type === 'bullish' ? '#10B981' : '#EF4444', fontWeight: '600' }}>{techData.candle.latest}</Text> pattern.
                    It's trading {techData.price > techData.SMA50 ? 'above' : 'below'} its 50-day average and{' '}
                    {techData.price > techData.SMA200 ? 'above' : 'below'} the 200-day average.
                    The price is between support at ₹{techData.support.S1} and resistance at ₹{techData.resistance.R1}.
                  </Text>
                </Card>
              </>
            )}

            {/* ══════ SENTIMENT ══════ */}
            {techTab === 'sentiment' && (
              <>
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>🧠 Overall Sentiment Score</Text>
                  <SentimentBar value={verdict.overallScore} />
                </Card>

                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>Sentiment Breakdown</Text>
                  {[
                    { name: 'Trend Signals', val: verdict.trendScore, desc: 'SMA50, SMA200, EMA20, EMA9, Ichimoku' },
                    { name: 'Momentum', val: verdict.momentumScore, desc: 'MACD, MACD Histogram, ROC, ADX' },
                    { name: 'Oscillators', val: verdict.oscillatorScore, desc: 'RSI, Stochastic, CCI, Williams %R, MFI' },
                    { name: 'Volume', val: verdict.volumeScore, desc: 'VWAP position, OBV direction' },
                    { name: 'Patterns', val: verdict.patternScore, desc: 'Candlestick patterns, SMA crossovers' },
                  ].map((s, i) => {
                    const col = s.val < 40 ? '#EF4444' : s.val < 55 ? '#F59E0B' : '#10B981';
                    return (
                      <View key={i} style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <View>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{s.name}</Text>
                            <Text style={{ fontSize: 9, color: colors.subText, marginTop: 2 }}>{s.desc}</Text>
                          </View>
                          <Text style={{ fontSize: 15, fontWeight: '800', color: col }}>{s.val}</Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.barBg, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${s.val}%`, borderRadius: 3, backgroundColor: col }} />
                        </View>
                      </View>
                    );
                  })}
                </Card>

                {/* Signal Consensus Bar */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>📊 Signal Consensus</Text>
                  <View style={{ flexDirection: 'row', height: 36, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <View style={{ width: `${(verdict.sells / 11) * 100}%`, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: 'white' }}>{verdict.sells}</Text>
                    </View>
                    <View style={{ width: `${(verdict.neutrals / 11) * 100}%`, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: 'white' }}>{verdict.neutrals}</Text>
                    </View>
                    <View style={{ width: `${(verdict.buys / 11) * 100}%`, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: 'white' }}>{verdict.buys}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: '#EF4444', fontWeight: '700' }}>Bearish {verdict.sells}</Text>
                    <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '700' }}>Neutral {verdict.neutrals}</Text>
                    <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '700' }}>Bullish {verdict.buys}</Text>
                  </View>
                </Card>
              </>
            )}

            {/* ══════ INDICATORS ══════ */}
            {techTab === 'indicators' && (
              <>
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>🔥 Technical Indicator Heatmap</Text>
                  <Text style={{ fontSize: 10, color: colors.subText, marginBottom: 14 }}>12 indicators analyzed — green=bullish, red=bearish</Text>
                  <TechnicalIndicatorHeatmap data={techData} />
                </Card>

                {/* RSI Deep Dive */}
                <Card style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>📊 RSI — Relative Strength Index</Text>
                  <Text style={{ fontSize: 10, color: colors.subText, marginBottom: 14, textAlign: 'center' }}>
                    Below 30 = oversold (buy zone), Above 70 = overbought (sell zone)
                  </Text>
                  <SegmentedGauge
                    value={techData.RSI}
                    size={190}
                    label={techData.RSI < 30 ? 'Oversold' : techData.RSI > 70 ? 'Overbought' : 'Neutral Zone'}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, width: '100%', paddingHorizontal: 8 }}>
                    {[
                      { l: 'OVERSOLD', d: 'Below 30', c: '#10B981' },
                      { l: 'NEUTRAL', d: '30 — 70', c: '#F59E0B' },
                      { l: 'OVERBOUGHT', d: 'Above 70', c: '#EF4444' },
                    ].map(z => (
                      <View key={z.l} style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 8, color: z.c, fontWeight: '700', letterSpacing: 0.5 }}>{z.l}</Text>
                        <Text style={{ fontSize: 9, color: colors.subText }}>{z.d}</Text>
                      </View>
                    ))}
                  </View>
                </Card>

                {/* Key Price Levels */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 }}>🎯 Key Price Levels</Text>
                  {[
                    { n: 'SMA 50', v: techData.SMA50, above: techData.price > techData.SMA50, d: 'Medium-term' },
                    { n: 'SMA 200', v: techData.SMA200, above: techData.price > techData.SMA200, d: 'Long-term' },
                    { n: 'EMA 20', v: techData.EMA20, above: techData.price > techData.EMA20, d: 'Short-term' },
                    { n: 'EMA 9', v: techData.EMA9, above: techData.price > techData.EMA9, d: 'Ultra short-term' },
                    { n: 'VWAP', v: techData.VWAP, above: techData.price > techData.VWAP, d: 'Volume weighted' },
                    { n: 'Ichimoku Tenkan', v: techData.ichimokuTenkan, above: techData.price > techData.ichimokuTenkan, d: 'Conversion line' },
                    { n: 'Ichimoku Kijun', v: techData.ichimokuKijun, above: techData.price > techData.ichimokuKijun, d: 'Base line' },
                  ].map((lvl, i) => (
                    <View key={i} style={{
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      paddingVertical: 10, borderBottomWidth: i < 6 ? 1 : 0, borderBottomColor: colors.border,
                    }}>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{lvl.n}</Text>
                        <Text style={{ fontSize: 9, color: colors.subText, marginTop: 2 }}>{lvl.d}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>₹{lvl.v}</Text>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: lvl.above ? '#10B981' : '#EF4444' }}>
                          Price {lvl.above ? 'above ↑' : 'below ↓'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* ══════ EVENTS ══════ */}
            {techTab === 'events' && (
              <>
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>⚡ Recent Technical Events</Text>
                  <Text style={{ fontSize: 10, color: colors.subText, marginBottom: 14 }}>Pattern detections, crossovers, and signal triggers</Text>
                  {techData.events.map((ev: any, i: number) => {
                    const evCol = ev.type === 'bullish' ? '#10B981' : ev.type === 'bearish' ? '#EF4444' : '#F59E0B';
                    const icon = ev.type === 'bullish' ? '🟢' : ev.type === 'bearish' ? '🔴' : '🟡';
                    return (
                      <View key={i} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12,
                        borderBottomWidth: i < techData.events.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                      }}>
                        <Text style={{ fontSize: 14 }}>{icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{ev.event}</Text>
                          <Text style={{ fontSize: 10, color: colors.subText, marginTop: 2 }}>{ev.time}</Text>
                        </View>
                        <View style={{ backgroundColor: evCol + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: evCol, textTransform: 'capitalize' }}>{ev.type}</Text>
                        </View>
                      </View>
                    );
                  })}
                </Card>

                {/* Candle Pattern */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>🕯️ Latest Candle Pattern</Text>
                  <CandlestickCard candle={techData.candle} />
                </Card>

                {/* Active Crossovers */}
                <Card>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>✂️ Active Crossovers</Text>
                  {Object.values(techData.crossovers).map((c: any, i: number) => {
                    const bull = c.status === 'Bullish';
                    return (
                      <View key={i} style={{
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                        paddingVertical: 12, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: colors.border,
                      }}>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{c.name}</Text>
                          <Text style={{ fontSize: 10, color: colors.subText }}>{c.daysAgo} days ago</Text>
                        </View>
                        <View style={{
                          backgroundColor: bull ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
                        }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: bull ? '#10B981' : '#EF4444' }}>{c.status}</Text>
                        </View>
                      </View>
                    );
                  })}
                </Card>
              </>
            )}

            {/* Disclaimer */}
            <View style={{
              padding: 14, borderRadius: 12, marginBottom: 20,
              backgroundColor: isDark ? 'rgba(245,158,11,0.04)' : 'rgba(245,158,11,0.06)',
              borderWidth: 1, borderColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.12)',
            }}>
              <Text style={{ fontSize: 9, color: '#F59E0B', fontWeight: '700', marginBottom: 4 }}>⚠️ DISCLAIMER</Text>
              <Text style={{ fontSize: 9, color: colors.subText, lineHeight: 14 }}>
                Technical analysis is based on historical data and does not guarantee future results. For educational purposes only — not financial advice.
              </Text>
            </View>
          </>
        )}

        {/* Generate Report Button */}
        <TouchableOpacity style={{
          backgroundColor: colors.header, paddingVertical: 18, borderRadius: 16,
          alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 40,
        }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>📄</Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Generate Full AI Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
