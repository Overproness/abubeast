"use client";

import TradingErrorBoundary from "./TradingErrorBoundary";

/**
 * Higher Order Component that wraps a component with TradingErrorBoundary
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to the error boundary
 * @returns {React.Component} - The wrapped component
 */
export function withTradingErrorBoundary(
  WrappedComponent,
  errorBoundaryProps = {}
) {
  const WithErrorBoundaryComponent = (props) => {
    return (
      <TradingErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </TradingErrorBoundary>
    );
  };

  // Set display name for better debugging
  WithErrorBoundaryComponent.displayName = `withTradingErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithErrorBoundaryComponent;
}

export default withTradingErrorBoundary;
