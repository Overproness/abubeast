/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - OHLC data array
 * @param {number} period - RSI period (default: 14)
 * @returns {Array} RSI data
 */
export function calculateRSI(data, period = 14) {
  if (!data || data.length < period + 1) {
    return [];
  }

  const closes = data.map((candle) => candle.close);
  const rsiData = [];

  // Calculate price changes
  const changes = closes.slice(1).map((price, i) => price - closes[i]);

  // Calculate initial averages
  let avgGain = 0;
  let avgLoss = 0;

  // First RSI value needs to sum initial gains/losses
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Calculate RSI for first period
  let rs = avgGain / (avgLoss || 1); // Avoid division by zero
  let rsi = 100 - 100 / (1 + rs);

  // Add first RSI value
  rsiData.push({
    time: data[period].time,
    value: rsi,
  });

  // Calculate remaining RSI values
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    // Use Wilder's smoothing method: multiply previous average by (period - 1), add current value, divide by period
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgGain / (avgLoss || 1); // Avoid division by zero
    rsi = 100 - 100 / (1 + rs);

    rsiData.push({
      time: data[i + 1].time,
      value: rsi,
    });
  }

  return rsiData;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param {Array} data - OHLC data array
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal EMA period (default: 9)
 * @returns {Object} MACD, Signal and Histogram data
 */
export function calculateMACD(
  data,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  if (!data || data.length < slowPeriod + signalPeriod) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  const closes = data.map((candle) => candle.close);

  // Calculate EMAs
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // Calculate MACD Line (Fast EMA - Slow EMA)
  const macdValues = [];
  for (let i = 0; i < data.length; i++) {
    if (i >= slowPeriod - 1) {
      const macd =
        fastEMA[i - (slowPeriod - fastPeriod)] -
        slowEMA[i - (slowPeriod - slowPeriod)];
      macdValues.push(macd);
    }
  }

  // Calculate Signal Line (EMA of MACD Line)
  const signalValues = calculateEMA(macdValues, signalPeriod);

  // Format MACD data
  const macdLine = [];
  const signalLine = [];
  const histogram = [];

  for (let i = 0; i < macdValues.length; i++) {
    if (i >= signalPeriod - 1) {
      const time = data[i + slowPeriod - 1].time;
      const macdValue = macdValues[i];
      const signalValue = signalValues[i - (signalPeriod - 1)];
      const histogramValue = macdValue - signalValue;

      macdLine.push({ time, value: macdValue });
      signalLine.push({ time, value: signalValue });

      // Add color to histogram based on value
      histogram.push({
        time,
        value: histogramValue,
        color: histogramValue >= 0 ? "#26A69A" : "#EF5350",
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculate Bollinger Bands
 * @param {Array} data - OHLC data array
 * @param {number} period - SMA period (default: 20)
 * @param {number} stdDev - Number of standard deviations (default: 2)
 * @returns {Object} Upper, middle and lower band data
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (!data || data.length < period) {
    return { upper: [], middle: [], lower: [] };
  }

  const upper = [];
  const middle = [];
  const lower = [];

  for (let i = period - 1; i < data.length; i++) {
    const windowData = data.slice(i - period + 1, i + 1);
    const closes = windowData.map((candle) => candle.close);

    // Calculate SMA (middle band)
    const sma = closes.reduce((sum, close) => sum + close, 0) / period;

    // Calculate standard deviation
    const variance =
      closes.reduce((sum, close) => sum + Math.pow(close - sma, 2), 0) / period;
    const sd = Math.sqrt(variance);

    // Calculate bands
    const upperBand = sma + stdDev * sd;
    const lowerBand = sma - stdDev * sd;

    const time = data[i].time;
    upper.push({ time, value: upperBand });
    middle.push({ time, value: sma });
    lower.push({ time, value: lowerBand });
  }

  return { upper, middle, lower };
}

/**
 * Calculate Fibonacci Retracement Levels
 * @param {Array} data - OHLC data array
 * @returns {Object} Min and max values for Fibonacci levels
 */
export function calculateFibonacciLevels(data) {
  if (!data || data.length === 0) {
    return { min: 0, max: 0 };
  }

  // Find highest high and lowest low in the data
  let highestHigh = data[0].high;
  let lowestLow = data[0].low;

  for (let i = 1; i < data.length; i++) {
    if (data[i].high > highestHigh) {
      highestHigh = data[i].high;
    }

    if (data[i].low < lowestLow) {
      lowestLow = data[i].low;
    }
  }

  return {
    min: lowestLow,
    max: highestHigh,
  };
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price values
 * @param {number} period - EMA period
 * @returns {Array} EMA values
 */
function calculateEMA(data, period) {
  if (!data || data.length < period) {
    return [];
  }

  const k = 2 / (period + 1);
  const emaData = [];

  // Calculate SMA for first EMA value
  let sma = 0;
  for (let i = 0; i < period; i++) {
    sma += data[i];
  }
  sma /= period;

  // First EMA is SMA
  emaData.push(sma);

  // Calculate subsequent EMA values: EMA = Price * k + Previous EMA * (1 - k)
  for (let i = period; i < data.length; i++) {
    const ema = data[i] * k + emaData[emaData.length - 1] * (1 - k);
    emaData.push(ema);
  }

  return emaData;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price values
 * @param {number} period - SMA period
 * @returns {Array} SMA values
 */
export function calculateSMA(data, period) {
  if (!data || data.length < period) {
    return [];
  }

  const smaData = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    const sma = sum / period;
    smaData.push(sma);
  }

  return smaData;
}
