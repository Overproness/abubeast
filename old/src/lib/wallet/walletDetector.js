/**
 * Utility to detect and diagnose wallet availability
 */

// Detect available wallets and their state
export function detectWallets() {
  const wallets = {
    metamask: {
      name: "MetaMask",
      installed: false,
      details: {},
    },
    phantom: {
      name: "Phantom",
      installed: false,
      details: {},
    },
    coinbase: {
      name: "Coinbase Wallet",
      installed: false,
      details: {},
    },
    bitget: {
      name: "BitGet Wallet",
      installed: false,
      details: {},
    },
    uniswap: {
      name: "Uniswap Wallet",
      installed: false,
      details: {},
    },
    okx: {
      name: "OKX Wallet",
      installed: false,
      details: {},
    },
    trustwallet: {
      name: "Trust Wallet",
      installed: false,
      details: {},
    },
  };

  if (typeof window === "undefined") return wallets;

  try {
    // Check for MetaMask
    if (window.ethereum) {
      wallets.metamask.installed = window.ethereum.isMetaMask || false;
      wallets.metamask.details = {
        selectedAddress: window.ethereum.selectedAddress || null,
        chainId: window.ethereum.chainId || null,
        isConnected: window.ethereum.isConnected
          ? window.ethereum.isConnected()
          : null,
        providers: Array.isArray(window.ethereum.providers)
          ? window.ethereum.providers.length
          : "N/A",
        isLocked: window.ethereum.selectedAddress ? false : true,
      };
    }

    // Check for Phantom with more details
    if (window.solana) {
      wallets.phantom.installed = window.solana.isPhantom || false;
      wallets.phantom.details = {
        isConnected: window.solana.isConnected || false,
        isPhantom: window.solana.isPhantom || false,
        publicKey: window.solana.publicKey
          ? window.solana.publicKey.toString()
          : null,
        autoApprove: window.solana.autoApprove,
        // Log available Phantom methods to diagnose issues
        methods: Object.getOwnPropertyNames(window.solana)
          .filter((item) => typeof window.solana[item] === "function")
          .join(", "),
      };
    }

    // Check for Coinbase Wallet
    if (window.ethereum) {
      wallets.coinbase.installed = window.ethereum.isCoinbaseWallet || false;
    }

    // Check for BitGet Wallet
    if (window.ethereum) {
      wallets.bitget.installed = window.ethereum.isBitKeep || false;
    }

    // Check for Uniswap Wallet
    if (window.ethereum) {
      wallets.uniswap.installed = window.ethereum.isUniswap || false;
    }

    // Check for OKX Wallet
    if (window.ethereum) {
      wallets.okx.installed =
        window.okexchain || window.ethereum.isOKExWallet || false;
    }

    // Check for Trust Wallet
    if (window.ethereum) {
      wallets.trustwallet.installed = window.ethereum.isTrust || false;
    }
  } catch (error) {
    console.error("Error detecting wallets:", error);
  }

  return wallets;
}

// Helper to log wallet information to the console
export function logWalletInfo() {
  const wallets = detectWallets();
  console.log("Available wallets:", wallets);

  if (typeof window !== "undefined" && window.ethereum) {
    console.log("Ethereum provider details:");
    console.log("- isMetaMask:", window.ethereum.isMetaMask || false);
    console.log(
      "- selectedAddress:",
      window.ethereum.selectedAddress || "null"
    );
    console.log("- chainId:", window.ethereum.chainId || "unknown");
    console.log(
      "- isConnected:",
      window.ethereum.isConnected ? window.ethereum.isConnected() : "unknown"
    );

    // Detect if wallet is locked
    const isLocked = !window.ethereum.selectedAddress;
    console.log("- Wallet appears to be " + (isLocked ? "locked" : "unlocked"));

    // Log available methods
    const methods = Object.getOwnPropertyNames(window.ethereum).filter(
      (item) => typeof window.ethereum[item] === "function"
    );
    console.log("- Available methods:", methods);

    // Test eth_requestAccounts availability
    console.log("Testing eth_requestAccounts availability...");
    try {
      // Just check if the method exists, don't call it
      if (
        window.ethereum.request &&
        typeof window.ethereum.request === "function"
      ) {
        console.log("- eth_requestAccounts method is available");
      } else {
        console.log("- eth_requestAccounts method is NOT available");
      }
    } catch (e) {
      console.error("- Error checking eth_requestAccounts:", e);
    }
  } else {
    console.log("No Ethereum provider detected in window.ethereum");
  }

  // Add Phantom wallet specific logging
  if (typeof window !== "undefined" && window.solana) {
    console.log("Phantom wallet details:");
    console.log("- isPhantom:", window.solana.isPhantom || false);
    console.log("- isConnected:", window.solana.isConnected || false);
    console.log("- publicKey:", window.solana.publicKey || "null");

    // Log available methods
    const phantomMethods = Object.getOwnPropertyNames(window.solana).filter(
      (item) => typeof window.solana[item] === "function"
    );
    console.log("- Available Phantom methods:", phantomMethods);

    // Test if connect method exists
    if (window.solana.connect && typeof window.solana.connect === "function") {
      console.log("- Phantom connect method is available");
    } else {
      console.log("- Phantom connect method is NOT available");
    }
  }

  return wallets;
}

// Test if MetaMask is properly accessible
export async function testMetaMaskConnection() {
  try {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return { success: false, message: "MetaMask not detected" };
    }

    console.log("Testing MetaMask connection...");
    const accounts = await window.ethereum.request({
      method: "eth_accounts", // This doesn't trigger the MetaMask popup
    });

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    return {
      success: true,
      accounts: accounts,
      chainId: chainId,
      isLocked: accounts.length === 0,
      message:
        accounts.length > 0
          ? "MetaMask is connected and unlocked"
          : "MetaMask is installed but locked or not connected",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Error testing MetaMask connection",
    };
  }
}

// Test if Phantom is properly accessible
export async function testPhantomConnection() {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      return { success: false, message: "Phantom wallet not detected" };
    }

    console.log("Testing Phantom connection...");

    // Check if already connected
    if (window.solana.isConnected) {
      console.log("Phantom is already connected");
      return {
        success: true,
        isConnected: true,
        publicKey: window.solana.publicKey
          ? window.solana.publicKey.toString()
          : null,
        message: "Phantom wallet is connected",
      };
    } else {
      console.log("Phantom is installed but not connected");
      return {
        success: true,
        isConnected: false,
        message: "Phantom wallet is installed but not connected",
      };
    }
  } catch (error) {
    console.error("Error testing Phantom connection:", error);
    return {
      success: false,
      error: error.message,
      message: "Error testing Phantom connection",
    };
  }
}
