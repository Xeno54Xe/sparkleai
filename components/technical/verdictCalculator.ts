// Technical Verdict Calculator
// Computes a weighted overall score (0-100) from 5 categories:
//   Trend (25%), Momentum (25%), Oscillators (20%), Volume (15%), Patterns (15%)

export interface TechnicalData {
  price: number;
  RSI: number;
  SMA50: number;
  SMA200: number;
  EMA20: number;
  EMA9: number;
  MACD: number;
  MACDSignal: number;
  MACDHist: number;
  ADX: number;
  stochK: number;
  stochD: number;
  CCI: number;
  WilliamsR: number;
  MFI: number;
  ROC: number;
  VWAP: number;
  OBV: number;
  ATR: number;
  ichimokuTenkan: number;
  ichimokuKijun: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  candle: { type: string };
  crossovers: { [key: string]: { status: string } };
}

export interface VerdictResult {
  overallScore: number;
  trendScore: number;
  momentumScore: number;
  oscillatorScore: number;
  volumeScore: number;
  patternScore: number;
  buys: number;
  sells: number;
  neutrals: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
}

export function calculateVerdict(d: TechnicalData): VerdictResult {
  // Category 1: Trend Indicators (weight: 25%)
  const trendBuys = [
    d.price > d.SMA50,
    d.price > d.SMA200,
    d.price > d.EMA20,
    d.price > d.EMA9,
    d.price > d.ichimokuTenkan,
    d.price > d.ichimokuKijun,
  ].filter(Boolean).length;
  const trendScore = (trendBuys / 6) * 100;

  // Category 2: Momentum Indicators (weight: 25%)
  const macdBull = d.MACD > d.MACDSignal;
  const macdHistPositive = d.MACDHist > 0;
  const rocPositive = d.ROC > 0;
  const adxStrong = d.ADX > 25;
  const momentumBuys = [macdBull, macdHistPositive, rocPositive, adxStrong].filter(Boolean).length;
  const momentumScore = (momentumBuys / 4) * 100;

  // Category 3: Oscillators (weight: 20%)
  const rsiBuy = d.RSI < 30 ? 1 : d.RSI > 70 ? 0 : 0.5;
  const stochBuy = d.stochK < 20 ? 1 : d.stochK > 80 ? 0 : 0.5;
  const cciBuy = d.CCI < -100 ? 1 : d.CCI > 100 ? 0 : 0.5;
  const willBuy = d.WilliamsR < -80 ? 1 : d.WilliamsR > -20 ? 0 : 0.5;
  const mfiBuy = d.MFI < 20 ? 1 : d.MFI > 80 ? 0 : 0.5;
  const oscillatorScore = ((rsiBuy + stochBuy + cciBuy + willBuy + mfiBuy) / 5) * 100;

  // Category 4: Volume (weight: 15%)
  const vwapAbove = d.price > d.VWAP;
  const obvPositive = d.OBV > 0;
  const volumeScore = ([vwapAbove, obvPositive].filter(Boolean).length / 2) * 100;

  // Category 5: Pattern & Crossover signals (weight: 15%)
  const candleBull = d.candle.type === 'bullish' ? 1 : d.candle.type === 'bearish' ? 0 : 0.5;
  const crossoverValues = Object.values(d.crossovers);
  const crossBulls = crossoverValues.filter(c => c.status === 'Bullish').length;
  const crossScore = crossoverValues.length > 0 ? crossBulls / crossoverValues.length : 0.5;
  const patternScore = ((candleBull + crossScore) / 2) * 100;

  // Weighted Overall Score (0-100)
  const overallScore = Math.round(
    trendScore * 0.25 +
    momentumScore * 0.25 +
    oscillatorScore * 0.20 +
    volumeScore * 0.15 +
    patternScore * 0.15
  );

  // Count individual buy/sell signals
  const buys = [
    d.price > d.SMA50, d.price > d.SMA200, d.price > d.EMA20, d.price > d.VWAP,
    macdBull, rocPositive, d.RSI < 30, d.stochK < 20, d.CCI < -100, d.WilliamsR < -80, d.MFI < 20
  ].filter(Boolean).length;

  const sells = [
    d.price < d.SMA50, d.price < d.SMA200, d.price < d.EMA20, d.price < d.VWAP,
    !macdBull, !rocPositive, d.RSI > 70, d.stochK > 80, d.CCI > 100, d.WilliamsR > -20, d.MFI > 80
  ].filter(Boolean).length;

  const neutrals = 11 - buys - sells;

  // Determine signal
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  if (overallScore >= 60) signal = 'BUY';
  else if (overallScore <= 40) signal = 'SELL';

  return {
    overallScore,
    trendScore: Math.round(trendScore),
    momentumScore: Math.round(momentumScore),
    oscillatorScore: Math.round(oscillatorScore),
    volumeScore: Math.round(volumeScore),
    patternScore: Math.round(patternScore),
    buys,
    sells,
    neutrals,
    signal,
  };
}
