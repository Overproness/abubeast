"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { formatCurrency, formatLargeNumber } from "@/lib/utils/tokenEnrichment";
import { useEffect, useState } from "react";

export default function TokenHolders({ tokenAddress }) {
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    totalCount: 0,
  });

  useEffect(() => {
    fetchHolders();
  }, [tokenAddress, pagination.limit, pagination.offset]);

  const fetchHolders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/tokens/${tokenAddress}/holders?limit=${pagination.limit}&offset=${pagination.offset}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch token holders");
      }

      const data = await response.json();
      setHolders(data.holders);
      setPagination((prev) => ({
        ...prev,
        totalCount: data.total_count || prev.totalCount,
      }));
    } catch (err) {
      console.error("Error fetching token holders:", err);
      setError("Failed to load token holders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.totalCount) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  if (loading && holders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-3">Loading holders data...</span>
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              % of Supply
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {holders.length > 0 ? (
            holders.map((holder, index) => (
              <tr
                key={holder.address}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {pagination.offset + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`https://etherscan.io/address/${holder.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {`${holder.address.substring(
                      0,
                      8
                    )}...${holder.address.substring(
                      holder.address.length - 6
                    )}`}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatLargeNumber(holder.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {holder.amountUSD ? formatCurrency(holder.amountUSD) : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {(holder.totalSupplyShare * 100).toFixed(2)}%
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No holder data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {holders.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handlePrevPage}
              disabled={pagination.offset === 0}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                pagination.offset === 0
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={
                pagination.offset + pagination.limit >= pagination.totalCount
              }
              className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                pagination.offset + pagination.limit >= pagination.totalCount
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">{pagination.offset + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.offset + pagination.limit,
                    pagination.totalCount
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalCount}</span>{" "}
                holders
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    pagination.offset === 0
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={
                    pagination.offset + pagination.limit >=
                    pagination.totalCount
                  }
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    pagination.offset + pagination.limit >=
                    pagination.totalCount
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
