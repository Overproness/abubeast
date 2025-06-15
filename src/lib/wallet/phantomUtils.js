/**
 * Specialized utilities for Phantom wallet connection
 */

// Enhanced connect function for Phantom wallet
export async function connectToPhantom() {
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error("Phantom wallet is not installed");
  }

  try {
    console.log("Attempting to connect to Phantom wallet...");

    // Force disconnect first to ensure clean connection state
    if (window.solana.isConnected) {
      console.log("Disconnecting existing Phantom connection first...");
      await window.solana.disconnect();
      // Give the wallet a moment to complete disconnection
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Ensure the popup will show by checking connection state
    const isConnected = window.solana.isConnected;
    console.log("Current connection state:", isConnected);

    // Use connect with explicit options to force popup
    console.log("Requesting Phantom connection...");
    const connectResponse = await window.solana.connect({
      onlyIfTrusted: false, // Force the popup to appear
    });

    console.log("Phantom connection successful:", connectResponse);
    return {
      publicKey: connectResponse.publicKey,
      address: connectResponse.publicKey.toString(),
      isConnected: true,
    };
  } catch (error) {
    console.error("Error connecting to Phantom:", error);
    throw new Error(`Failed to connect to Phantom wallet: ${error.message}`);
  }
}

// Function to check if Phantom wallet is installed
export function isPhantomInstalled() {
  const isPhantomInstalled = window.solana && window.solana.isPhantom;
  return isPhantomInstalled;
}

// Function to check if Phantom wallet is connected
export function isPhantomConnected() {
  if (!window.solana || !window.solana.isPhantom) {
    return false;
  }
  return window.solana.isConnected;
}

// Function to safely disconnect Phantom
export async function disconnectPhantom() {
  if (window.solana && window.solana.isConnected) {
    try {
      await window.solana.disconnect();
      return true;
    } catch (error) {
      console.error("Error disconnecting from Phantom:", error);
      return false;
    }
  }
  return true; // Already disconnected
}
