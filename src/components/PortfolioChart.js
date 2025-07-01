"use client";

import { createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

export default function PortfolioChart({ data = [] }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    if (chartContainerRef.current && !chartRef.current) {
      const chartOptions = {
        layout: {
          textColor: "rgba(255, 255, 255, 0.9)",
          background: { type: "solid", color: "transparent" },
        },
        grid: {
          vertLines: { color: "rgba(42, 46, 57, 0.3)" },
          horzLines: { color: "rgba(42, 46, 57, 0.3)" },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "rgba(42, 46, 57, 0.5)",
        },
        rightPriceScale: {
          borderColor: "rgba(42, 46, 57, 0.5)",
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: "rgba(42, 46, 57, 0.5)",
            width: 1,
            style: 2,
          },
          horzLine: {
            color: "rgba(42, 46, 57, 0.5)",
            width: 1,
            style: 2,
          },
        },
        handleScale: {
          mouseWheel: true,
          pinch: true,
        },
      };

      chartRef.current = createChart(chartContainerRef.current, chartOptions);

      lineSeriesRef.current = chartRef.current.addLineSeries({
        color: "#3B82F6",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
      });

      // Set watermark
      chartRef.current.applyOptions({
        watermark: {
          visible: true,
          fontSize: 18,
          horzAlign: "center",
          vertAlign: "center",
          color: "rgba(171, 71, 188, 0.2)",
          text: "AbuBeast Portfolio",
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (lineSeriesRef.current && data.length > 0) {
      // Filter data based on selected period
      const now = Math.floor(Date.now() / 1000);
      let filteredData = data;

      switch (period) {
        case "1d":
          filteredData = data.filter((item) => item.time > now - 24 * 60 * 60);
          break;
        case "7d":
          filteredData = data.filter(
            (item) => item.time > now - 7 * 24 * 60 * 60
          );
          break;
        case "30d":
          filteredData = data.filter(
            (item) => item.time > now - 30 * 24 * 60 * 60
          );
          break;
        case "90d":
          filteredData = data.filter(
            (item) => item.time > now - 90 * 24 * 60 * 60
          );
          break;
        case "1y":
          filteredData = data.filter(
            (item) => item.time > now - 365 * 24 * 60 * 60
          );
          break;
        default:
          filteredData = data;
      }

      lineSeriesRef.current.setData(filteredData);

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data, period]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Portfolio Value Over Time
        </h3>
        <div className="flex space-x-2">
          {["1d", "7d", "30d", "90d", "1y", "all"].map((p) => (
            <button
              key={p}
              className={`px-3 py-1 text-xs rounded ${period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              onClick={() => handlePeriodChange(p)}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-80" ref={chartContainerRef}>
        {data.length === 0 && (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No chart data available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
