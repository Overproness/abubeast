// Client-side only LiFi service
let lifi;

export function getLifi() {
  // Only initialize on client-side
  if (typeof window === "undefined") {
    throw new Error("LiFi SDK can only be used on the client-side");
  }

  if (!lifi) {
    // Dynamic import to avoid server-side execution
    import("@lifi/sdk")
      .then(({ LiFi }) => {
        lifi = new LiFi({
          integrator: "AbuBeast",
        });
      })
      .catch((error) => {
        console.error("Failed to initialize LiFi SDK:", error);
      });
  }
  return lifi;
}

/**
 * Get available chains from LiFi (client-side only)
 */
export async function getAvailableChains() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const { LiFi } = await import("@lifi/sdk");
    const lifiInstance = new LiFi({ integrator: "AbuBeast" });
    const { chains } = await lifiInstance.getChains();
    return chains;
  } catch (error) {
    console.error("Error fetching available chains:", error);
    throw error;
  }
}

/**
 * Get available tokens for a specific chain (client-side only)
 * @param {string} chainId - Chain ID
 */
export async function getAvailableTokens(chainId) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const { LiFi } = await import("@lifi/sdk");
    const lifiInstance = new LiFi({ integrator: "AbuBeast" });
    const { tokens } = await lifiInstance.getTokens({ chains: [chainId] });
    return tokens[chainId] || [];
  } catch (error) {
    console.error(`Error fetching tokens for chain ${chainId}:`, error);
    throw error;
  }
}

/**
 * Get route for token swap (client-side only)
 * @param {Object} params - Swap parameters
 */
export async function getRoute(params) {
  if (typeof window === "undefined") {
    throw new Error("Route calculation only available on client-side");
  }

  try {
    const { LiFi } = await import("@lifi/sdk");
    const lifiInstance = new LiFi({ integrator: "AbuBeast" });
    const route = await lifiInstance.getRoutes(params);
    return route;
  } catch (error) {
    console.error("Error getting swap route:", error);
    throw error;
  }
}

/**
 * Execute a token swap (client-side only)
 * @param {Object} route - The route to execute
 * @param {Object} signer - The signer object
 */
export async function executeSwap(route, signer) {
  if (typeof window === "undefined") {
    throw new Error("Swap execution only available on client-side");
  }

  try {
    const { LiFi } = await import("@lifi/sdk");
    const lifiInstance = new LiFi({ integrator: "AbuBeast" });
    const result = await lifiInstance.executeRoute(signer, route);
    return result;
  } catch (error) {
    console.error("Error executing swap:", error);
    throw error;
  }
}

/**
 * Get swap status (client-side only)
 * @param {string} txHash - Transaction hash
 * @param {string} chainId - Chain ID
 */
export async function getSwapStatus(txHash, chainId) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const { LiFi } = await import("@lifi/sdk");
    const lifiInstance = new LiFi({ integrator: "AbuBeast" });
    const status = await lifiInstance.getStatus({
      txHash,
      chainId,
    });
    return status;
  } catch (error) {
    console.error("Error getting swap status:", error);
    throw error;
  }
}
