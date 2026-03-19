"use client";

import { useState } from "react";

export default function TradingErrorDisplay({
  error,
  onRetry,
  onDismiss,
  type = "error", // error, warning, connection
  title,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !error) return null;

  const getErrorConfig = () => {
    switch (type) {
      case "connection":
        return {
          bgColor: "from-orange-900 to-red-900",
          borderColor: "border-orange-500/30",
          iconColor: "text-orange-400",
          titleColor: "text-orange-300",
          defaultTitle: "Connection Error",
        };
      case "warning":
        return {
          bgColor: "from-yellow-900 to-orange-900",
          borderColor: "border-yellow-500/30",
          iconColor: "text-yellow-400",
          titleColor: "text-yellow-300",
          defaultTitle: "Trading Warning",
        };
      default:
        return {
          bgColor: "from-red-900 to-pink-900",
          borderColor: "border-red-500/30",
          iconColor: "text-red-400",
          titleColor: "text-red-300",
          defaultTitle: "Trading Error",
        };
    }
  };

  const config = getErrorConfig();

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-xl p-6 shadow-2xl backdrop-blur-sm`}
      >
        {/* Background animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 w-16 h-16 bg-white rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-white rounded-full blur-lg animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start space-x-4">
            {/* Error icon */}
            <div className={`flex-shrink-0 w-12 h-12 ${config.iconColor} mt-1`}>
              {type === "connection" ? (
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 17h2v2h-2v-2zm2-2V9c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1z" />
                </svg>
              ) : type === "warning" ? (
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              ) : (
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full animate-pulse"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z" />
                </svg>
              )}
            </div>

            {/* Error content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${config.titleColor} mb-2`}>
                {title || config.defaultTitle}
              </h3>

              <div className="text-gray-300 space-y-2">
                <p className="text-sm leading-relaxed">
                  {typeof error === "string"
                    ? error
                    : error?.message || "An unexpected error occurred"}
                </p>

                {/* Additional error details */}
                {error?.code && (
                  <p className="text-xs text-gray-400">
                    Error Code: {error.code}
                  </p>
                )}

                {error?.details && (
                  <p className="text-xs text-gray-400">{error.details}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3 mt-4">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Retry
                  </button>
                )}

                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-400 hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Market impact indicator */}
          {type === "error" && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center text-xs text-gray-400">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                <span>This error may affect trading operations</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
