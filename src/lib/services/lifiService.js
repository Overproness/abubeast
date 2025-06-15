import { LiFi } from "@lifi/sdk";

// Initialize LiFi SDK
let lifi;

export function getLifi() {
  if (!lifi) {
    lifi = new LiFi({
      integrator: "AbuBeast",
    });
  }
  return lifi;
}

/**
 * Get available chains from LiFi
 */
export async function getAvailableChains() {
  const lifi = getLifi();
  try {
    const { chains } = await lifi.getChains();
    return chains;
  } catch (error) {
    console.error("Error fetching available chains:", error);
    throw error;
  }
}

/**
 * Get available tokens for a specific chain
 * @param {string} chainId - Chain ID
 */
export async function getAvailableTokens(chainId) {
  const lifi = getLifi();
  try {
    const { tokens } = await lifi.getTokens({ chains: [chainId] });
    return tokens[chainId] || [];
  } catch (error) {
    console.error(`Error fetching tokens for chain ${chainId}:`, error);
    throw error;
  }
}

/**
 * Get route for token swap
 * @param {Object} params - Swap parameters
 */
export async function getRoute(params) {
  const lifi = getLifi();
  try {
    const route = await lifi.getRoutes(params);
    return route;
  } catch (error) {
    console.error("Error getting swap route:", error);
    throw error;
  }
}

/**
 * Execute a token swap
 * @param {Object} route - The route to execute
 * @param {Object} signer - The signer object
 */
export async function executeSwap(route, signer) {
  const lifi = getLifi();
  try {
    const result = await lifi.executeRoute(signer, route);
    return result;
  } catch (error) {
    console.error("Error executing swap:", error);
    throw error;
  }
}

/**
 * Get swap status
 * @param {string} txHash - Transaction hash
 * @param {string} chainId - Chain ID
 */
export async function getSwapStatus(txHash, chainId) {
  const lifi = getLifi();
  try {
    const status = await lifi.getStatus({
      txHash,
      chainId,
    });
    return status;
  } catch (error) {
    console.error("Error getting swap status:", error);
    throw error;
  }
}
