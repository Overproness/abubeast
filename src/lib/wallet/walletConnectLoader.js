/**
 * Helper functions to dynamically load WalletConnect
 */

// Check if WalletConnect is already loaded
export function isWalletConnectLoaded() {
  return (
    typeof window !== "undefined" &&
    typeof window.WalletConnectModal !== "undefined"
  );
}

// Dynamically load WalletConnect script
export function loadWalletConnectScript() {
  return new Promise((resolve, reject) => {
    if (isWalletConnectLoaded()) {
      return resolve(window.WalletConnectModal);
    }

    try {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@walletconnect/web3modal@2.6.2/dist/index.js";
      script.integrity =
        "sha384-XJ5/JIo/G4tU8qgUFgxooCPe+8HEVQgFCYWqo5GO6iXGpKB8D09HjZY07rpCCAj";
      script.crossOrigin = "anonymous";
      script.async = true;

      script.onload = () => {
        if (window.WalletConnectModal) {
          resolve(window.WalletConnectModal);
        } else {
          reject(
            new Error("WalletConnect loaded but no WalletConnectModal found")
          );
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load WalletConnect script"));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
}

// Create a WalletConnect Web3Modal instance
export async function createWalletConnectModal(projectId, options = {}) {
  if (!isWalletConnectLoaded()) {
    await loadWalletConnectScript();
  }

  if (!window.WalletConnectModal) {
    throw new Error("WalletConnectModal not available");
  }

  return new window.WalletConnectModal.Web3Modal({
    projectId,
    chains: options.chains || [1], // Default to Ethereum
    themeMode: options.themeMode || "dark",
    themeVariables: options.themeVariables || {},
    explorerRecommendedWalletIds: options.recommendedWallets || [
      "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
      "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust
    ],
    ...(options.metadata && { metadata: options.metadata }),
  });
}
