/**
 * Utility for monitoring and tracking errors
 */

/**
 * Log API errors with contextual information
 * @param {string} source - Source of the error (API route or function name)
 * @param {string} errorType - Type of error (e.g., "Token not found", "Database error")
 * @param {Error|string} error - The error object or message
 * @param {Object} additionalContext - Any additional context that might help with debugging
 */
export function logApiError(source, errorType, error, additionalContext = {}) {
  const errorObj = {
    timestamp: new Date().toISOString(),
    source,
    errorType,
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : null,
    ...additionalContext,
  };

  console.error(`[API ERROR] ${source}: ${errorType}`);
  console.error(JSON.stringify(errorObj, null, 2));

  // In a production environment, you could send this to an error monitoring service
  // like Sentry, LogRocket, etc.
}

/**
 * Handle API errors uniformly
 * @param {Error} error - The caught error
 * @param {string} source - Source of the error
 * @param {Object} additionalContext - Any additional context
 * @returns {Object} - Formatted error response
 */
export function handleApiError(error, source, additionalContext = {}) {
  logApiError(source, error.name || "Unknown", error, additionalContext);

  return {
    error: "An error occurred",
    message: error.message || "Something went wrong",
    source: source,
    timestamp: new Date().toISOString(),
  };
}
