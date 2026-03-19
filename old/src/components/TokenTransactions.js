"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { formatCurrency } from "@/lib/utils/tokenEnrichment";
import { useEffect, useRef, useState } from "react";

export default function TokenTransactions({ tokenAddress }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState(true);
  const socketRef = useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_MOBULA_API_KEY || "";

  useEffect(() => {
    // Fetch initial transactions
    fetchTransactions();

    // Setup WebSocket for real-time transactions
    if (liveUpdates) {
      setupWebSocket();
    }

    return () => {
      // Clean up WebSocket connection on unmount
      if (socketRef.current) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: "unsubscribe",
              payload: {},
            })
          );

          socketRef.current.close();
        } catch (err) {
          console.error("Error closing WebSocket:", err);
        }
      }
    };
  }, [tokenAddress, liveUpdates]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tokens/${tokenAddress}/transactions`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Close existing connection if any
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (err) {
        console.error("Error closing existing WebSocket:", err);
      }
    }

    // Create new WebSocket connection
    socketRef.current = new WebSocket("wss://api.mobula.io");

    socketRef.current.addEventListener("open", () => {
      console.log("WebSocket connection opened");

      // Subscribe to pair transactions
      socketRef.current.send(
        JSON.stringify({
          type: "pair",
          authorization: apiKey,
          payload: {
            address: tokenAddress,
            blockchain: "1", // Ethereum by default, should be adapted based on the token
          },
        })
      );
    });

    socketRef.current.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (
          data &&
          data.type &&
          (data.type === "buy" || data.type === "sell")
        ) {
          // New transaction received, add it to the list
          setTransactions((prev) => {
            // Add new transaction at the beginning and limit to 50 transactions
            const newTx = {
              hash: data.hash,
              timestamp: data.date,
              type: data.type,
              amount: data.token_amount,
              amountUsd: data.token_amount_usd,
              price: data.token_price,
              sender: data.sender,
            };

            return [newTx, ...prev].slice(0, 50);
          });
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    });

    socketRef.current.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });

    socketRef.current.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });
  };

  const toggleLiveUpdates = () => {
    setLiveUpdates(!liveUpdates);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-3">Loading transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
            Live updates
          </span>
          <button
            onClick={toggleLiveUpdates}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              liveUpdates ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
            role="switch"
            aria-checked={liveUpdates}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                liveUpdates ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {liveUpdates && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded flex items-center">
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Live updates are enabled. New transactions will appear automatically.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr
                  key={tx.hash}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === "buy"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {tx.type === "buy" ? "Buy" : "Sell"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {tx.amount.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(tx.amountUsd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(tx.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {`${tx.hash.substring(0, 6)}...${tx.hash.substring(
                        tx.hash.length - 4
                      )}`}
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
