"use client";

import { useCallback, useState } from "react";

/**
 * Custom hook for managing loading states with error handling
 * @param {boolean} initialLoading - Initial loading state
 * @returns {Object} - Loading state management object
 */
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setErrorState] = useState(null);
  const [data, setData] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setErrorState(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setSuccess = useCallback((data) => {
    setData(data);
    setErrorState(null);
    setIsLoading(false);
  }, []);

  const setError = useCallback((error) => {
    setErrorState(error);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setErrorState(null);
    setData(null);
  }, []);

  const executeAsync = useCallback(
    async (asyncFunction) => {
      try {
        startLoading();
        const result = await asyncFunction();
        setSuccess(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [startLoading, setSuccess, setError]
  );

  return {
    isLoading,
    error,
    data,
    startLoading,
    stopLoading,
    setSuccess,
    setError,
    reset,
    executeAsync,
    hasError: !!error,
    hasData: !!data,
  };
}

export default useLoadingState;
