"use client";

import { Component } from "react";

class TradingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service
    console.error("Trading Error Boundary caught an error:", error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900 flex items-center justify-center p-4 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 bg-red-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-400/20 rounded-full blur-lg animate-bounce delay-500"></div>
          </div>

          {/* Error content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20 shadow-2xl">
              {/* Error icon */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-600 to-orange-600 rounded-full shadow-2xl mb-4 animate-pulse">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8z" />
                    <path
                      d="M15.5 4L14.5 5L16 6.5L14.5 8L15.5 9L17 7.5L18.5 9L19.5 8L18 6.5L19.5 5L18.5 4L17 5.5L15.5 4Z"
                      fill="none"
                    />
                    <path d="M12 7L11 8L12 9L13 8L12 7Z M12 10L11 11L12 12L13 11L12 10Z M12 13L11 14L12 15L13 14L12 13Z" />
                    <path d="M12 16L11 17L12 18L13 17L12 16Z" fill="red" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent mb-4">
                  Trading System Error
                </h1>
                <p className="text-gray-300 text-lg">
                  We encountered an unexpected issue with the trading platform
                </p>
              </div>

              {/* Error details */}
              <div className="mb-8 p-6 bg-red-900/30 rounded-xl border border-red-500/30">
                <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
                  </svg>
                  Error Details
                </h3>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>
                    <strong>Error:</strong>{" "}
                    {this.state.error?.message || "Unknown error occurred"}
                  </p>
                  <p>
                    <strong>Component:</strong> Trading Platform
                  </p>
                  <p>
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </p>
                </div>

                {process.env.NODE_ENV === "development" &&
                  this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-red-300 hover:text-red-200">
                        Stack Trace (Development Mode)
                      </summary>
                      <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-32 bg-black/50 p-3 rounded">
                        {this.state.error && this.state.error.stack}
                      </pre>
                    </details>
                  )}
              </div>

              {/* Suggested actions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  What you can do:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <p className="text-gray-300">
                      Check your internet connection and try refreshing the page
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <p className="text-gray-300">
                      Clear your browser cache and cookies
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <p className="text-gray-300">
                      Contact support if the issue persists
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleRefresh}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5 inline-block mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  Refresh Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5 inline-block mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                  Go Home
                </button>
              </div>

              {/* Support info */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-gray-400 mb-2">
                  Need immediate assistance?
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <a
                    href="mailto:support@abubeast.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    📧 support@abubeast.com
                  </a>
                  <a
                    href="/help"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    📚 Help Center
                  </a>
                </div>
              </div>
            </div>

            {/* Market status indicator */}
            <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-gray-300">Markets: Operational</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-gray-300">Platform: Investigating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TradingErrorBoundary;
