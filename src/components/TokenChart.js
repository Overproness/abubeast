"use client";

import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateFibonacciLevels,
} from "@/lib/utils/technicalIndicators";

export default function TokenChart({ tokenAddress }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const indicatorSeriesRefs = useRef({});
  const socketRef = useRef(null);
  const [period, setPeriod] = useState("1h");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_MOBULA_API_KEY || "";

  // Add state for technical indicators
  const [activeIndicators, setActiveIndicators] = useState({
    rsi: false,
    macd: false,
    bollinger: false,
    fibonacci: false,
  });

  useEffect(() => {
    // Initialize chart
    if (chartContainerRef.current && !chartRef.current) {
      const chartOptions = {
        layout: {
          textColor: "rgba(255, 255, 255, 0.9)",
          background: { type: "solid", color: "rgba(19, 23, 34, 0.0)" },
        },
        grid: {
          vertLines: { color: "rgba(42, 46, 57, 0.6)" },
          horzLines: { color: "rgba(42, 46, 57, 0.6)" },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1,
        },
        localization: {
          timeFormatter: (time) => {
            const date = new Date(time * 1000);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString();
          },
        },
        handleScale: {
          mouseWheel: true,
          pinch: true,
        },
        rightPriceScale: {
          borderVisible: false,
        },
      };

      // Create chart
      chartRef.current = createChart(chartContainerRef.current, chartOptions);
      chartRef.current.applyOptions({
        watermark: {
          visible: true,
          fontSize: 24,
          horzAlign: "center",
          vertAlign: "center",
          color: "rgba(171, 71, 188, 0.3)",
          text: "AbuBeast",
        },
      });

      // Add series
      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // Add volume series
      volumeSeriesRef.current = chartRef.current.addHistogramSeries({
        color: "#26a69a",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Apply the OHLC data on first render
      fetchHistoricalData();
    }

    return () => {
      // Clean up and disconnect
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (err) {
          console.error("Error closing WebSocket:", err);
        }
      }

      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [tokenAddress]); // Re-initialize when token changes

  // Update chart when period changes
  useEffect(() => {
    fetchHistoricalData();
  }, [period]);

  // Update chart when indicators change
  useEffect(() => {
    if (chartData.length > 0) {
      updateIndicators();
    }
  }, [activeIndicators, chartData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchHistoricalData = async () => {
    setLoading(true);

    try {
      // Fetch historical OHLCV data from your API that interfaces with Mobula
      const response = await fetch(
        `/api/tokens/${tokenAddress}/ohlcv?period=${period}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch OHLCV data");
      }

      const data = await response.json();

      if (data && data.ohlcv && data.ohlcv.length > 0) {
        // Format data for the chart
        const formattedData = data.ohlcv.map((candle) => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        // Format volume data
        const volumeData = data.ohlcv.map((candle) => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? "#26a69a" : "#ef5350",
        }));

        setChartData(formattedData);

        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedData);
        }

        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(volumeData);
        }

        // Update technical indicators
        updateIndicators(formattedData);

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

        // Setup real-time updates via WebSocket
        setupWebsocket();
      }
    } catch (error) {
      console.error("Error fetching OHLCV data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateIndicators = (data = chartData) => {
    if (!chartRef.current || data.length === 0) return;

    // Clear previous indicators
    Object.keys(indicatorSeriesRefs.current).forEach((key) => {
      if (indicatorSeriesRefs.current[key]) {
        chartRef.current.removeSeries(indicatorSeriesRefs.current[key]);
        delete indicatorSeriesRefs.current[key];
      }
    });

    // Add RSI if active
    if (activeIndicators.rsi) {
      const rsiData = calculateRSI(data, 14);
      const rsiSeries = chartRef.current.addLineSeries({
        color: "#9B59B6",
        lineWidth: 1,
        priceScaleId: "rsi",
        priceFormat: {
          type: "price",
          precision: 2,
        },
        scaleMargins: {
          top: 0.7,
          bottom: 0.05,
        },
        title: "RSI (14)",
      });

      rsiSeries.setData(rsiData);
      indicatorSeriesRefs.current.rsi = rsiSeries;

      // Add overbought/oversold lines
      const overBoughtLine = chartRef.current.addLineSeries({
        color: "#F39C12",
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: "rsi",
        scaleMargins: {
          top: 0.7,
          bottom: 0.05,
        },
      });

      const overSoldLine = chartRef.current.addLineSeries({
        color: "#F39C12",
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: "rsi",
        scaleMargins: {
          top: 0.7,
          bottom: 0.05,
        },
      });

      const overboughtData = rsiData.map((item) => ({
        time: item.time,
        value: 70,
      }));
      const oversoldData = rsiData.map((item) => ({
        time: item.time,
        value: 30,
      }));

      overBoughtLine.setData(overboughtData);
      overSoldLine.setData(oversoldData);

      indicatorSeriesRefs.current.overbought = overBoughtLine;
      indicatorSeriesRefs.current.oversold = overSoldLine;
    }

    // Add MACD if active
    if (activeIndicators.macd) {
      const { macdLine, signalLine, histogram } = calculateMACD(
        data,
        12,
        26,
        9
      );

      // MACD line
      const macdSeries = chartRef.current.addLineSeries({
        color: "#3498DB",
        lineWidth: 1.5,
        priceScaleId: "macd",
        priceFormat: {
          type: "price",
          precision: 6,
        },
        scaleMargins: {
          top: 0.8,
          bottom: 0.05,
        },
        title: "MACD",
      });

      // Signal line
      const signalSeries = chartRef.current.addLineSeries({
        color: "#E74C3C",
        lineWidth: 1.5,
        priceScaleId: "macd",
        scaleMargins: {
          top: 0.8,
          bottom: 0.05,
        },
      });

      // Histogram
      const histogramSeries = chartRef.current.addHistogramSeries({
        priceScaleId: "macd",
        scaleMargins: {
          top: 0.8,
          bottom: 0.05,
        },
      });

      macdSeries.setData(macdLine);
      signalSeries.setData(signalLine);
      histogramSeries.setData(histogram);

      indicatorSeriesRefs.current.macdLine = macdSeries;
      indicatorSeriesRefs.current.signalLine = signalSeries;
      indicatorSeriesRefs.current.histogram = histogramSeries;
    }

    // Add Bollinger Bands if active
    if (activeIndicators.bollinger) {
      const { upper, middle, lower } = calculateBollingerBands(data, 20, 2);

      // Upper band
      const upperSeries = chartRef.current.addLineSeries({
        color: "#2ECC71",
        lineWidth: 1,
        lineStyle: 2,
      });

      // Middle band (SMA)
      const middleSeries = chartRef.current.addLineSeries({
        color: "#F1C40F",
        lineWidth: 1,
      });

      // Lower band
      const lowerSeries = chartRef.current.addLineSeries({
        color: "#2ECC71",
        lineWidth: 1,
        lineStyle: 2,
      });

      upperSeries.setData(upper);
      middleSeries.setData(middle);
      lowerSeries.setData(lower);

      indicatorSeriesRefs.current.upperBand = upperSeries;
      indicatorSeriesRefs.current.middleBand = middleSeries;
      indicatorSeriesRefs.current.lowerBand = lowerSeries;
    }

    // Add Fibonacci levels if active
    if (activeIndicators.fibonacci) {
      if (data.length > 0) {
        const fibLevels = calculateFibonacciLevels(data);

        // Add each fibonacci level
        const fibColors = [
          "#e74c3c",
          "#f39c12",
          "#f1c40f",
          "#2ecc71",
          "#3498db",
          "#9b59b6",
        ];
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

        levels.forEach((level, index) => {
          const color = fibColors[index % fibColors.length];
          const fibSeries = chartRef.current.addLineSeries({
            color: color,
            lineWidth: 1,
            lineStyle: 2,
            title: `Fib ${level}`,
          });

          const levelValue =
            fibLevels.min + (fibLevels.max - fibLevels.min) * level;
          const fibData = data.map((item) => ({
            time: item.time,
            value: levelValue,
          }));

          fibSeries.setData(fibData);
          indicatorSeriesRefs.current[`fib-${level}`] = fibSeries;
        });
      }
    }
  };

  const setupWebsocket = () => {
    // Close any existing connections
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create new WebSocket connection
    socketRef.current = new WebSocket("wss://production-api.mobula.io");

    socketRef.current.addEventListener("open", () => {
      // Send subscription message
      socketRef.current.send(
        JSON.stringify({
          type: "ohlcv",
          payload: {
            apiKey: apiKey,
            address: tokenAddress,
            chainId: "evm:1", // Default to Ethereum, adjust based on token
            period: period,
          },
        })
      );
    });

    socketRef.current.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data && data.o !== undefined) {
          // Format the real-time update for candlestick
          const update = {
            time: data.t / 1000, // Convert to seconds if needed
            open: data.o,
            high: data.h,
            low: data.l,
            close: data.c,
          };

          // Format volume update
          const volumeUpdate = {
            time: data.t / 1000,
            value: data.v,
            color: data.c >= data.o ? "#26a69a" : "#ef5350",
          };

          // Update the series
          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.update(update);
          }

          if (volumeSeriesRef.current) {
            volumeSeriesRef.current.update(volumeUpdate);
          }

          // Update the local state too
          setChartData((prevData) => {
            const lastIndex = prevData.findIndex(
              (candle) => candle.time === update.time
            );

            if (lastIndex >= 0) {
              // Update existing candle
              const newData = [...prevData];
              newData[lastIndex] = update;
              return newData;
            } else {
              // Add new candle
              return [...prevData, update];
            }
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    socketRef.current.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });

    socketRef.current.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const toggleIndicator = (indicatorName) => {
    setActiveIndicators((prev) => ({
      ...prev,
      [indicatorName]: !prev[indicatorName],
    }));
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Price Chart
        </h2>
        <div className="flex space-x-2">
          {["1min", "5min", "15min", "1h", "4h", "1d", "1w"].map((p) => (
            <button
              key={p}
              className={`px-3 py-1 text-xs rounded ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handlePeriodChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => toggleIndicator("rsi")}
          className={`px-3 py-1 text-xs rounded ${
            activeIndicators.rsi
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          RSI
        </button>

        <button
          onClick={() => toggleIndicator("macd")}
          className={`px-3 py-1 text-xs rounded ${
            activeIndicators.macd
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          MACD
        </button>

        <button
          onClick={() => toggleIndicator("bollinger")}
          className={`px-3 py-1 text-xs rounded ${
            activeIndicators.bollinger
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Bollinger
        </button>

        <button
          onClick={() => toggleIndicator("fibonacci")}
          className={`px-3 py-1 text-xs rounded ${
            activeIndicators.fibonacci
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Fibonacci
        </button>
      </div>

      <div className="w-full h-96 relative" ref={chartContainerRef}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
