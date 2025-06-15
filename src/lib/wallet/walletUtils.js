import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { connectToPhantom } from "./phantomUtils";

// MetaMask and other EVM-compatible wallets
export async function connectEthereumWallet(requestTradingPermissions = false) {
  try {
    if (!window.ethereum) {
      throw new Error(
        "No Ethereum wallet detected. Please install MetaMask or another compatible wallet."
      );
    }

    // Log diagnostic info before proceeding
    console.log("Connecting to Ethereum wallet...");
    console.log("- Provider state:", {
      isMetaMask: window.ethereum.isMetaMask,
      selectedAddress: window.ethereum.selectedAddress,
      chainId: window.ethereum.chainId,
      isConnected: window.ethereum.isConnected
        ? window.ethereum.isConnected()
        : "unknown",
    });

    // Wait a bit to ensure provider is ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Request account access
    console.log("Requesting accounts...");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error(
        "No accounts returned. User may have denied access or wallet is locked."
      );
    }

    console.log("Accounts received:", accounts);

    // Get provider and signer - ethers v6 syntax
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    // Format chain ID as decimal
    const formattedChainId = parseInt(chainId, 16);
    console.log("Connected to chain ID:", formattedChainId);

    // If trading permissions requested, ask for approval
    let tradingApproved = false;
    if (requestTradingPermissions) {
      console.log("Requesting trading permissions...");
      tradingApproved = await requestEVMTradingPermissions(signer, accounts[0]);
      console.log("Trading permissions granted:", tradingApproved);
    }

    return {
      address: accounts[0],
      provider,
      signer,
      chainId: formattedChainId,
      networkType: "ethereum",
      type: "metamask",
      tradingApproved,
    };
  } catch (error) {
    console.error("Error connecting Ethereum wallet:", error);
    // Provide more descriptive error messages
    if (error.code === 4001) {
      throw new Error(
        "Connection rejected. Please approve the connection request in your wallet."
      );
    } else if (error.message?.includes("already processing")) {
      throw new Error(
        "Your wallet is already processing a request. Please check your wallet extension."
      );
    } else {
      throw new Error(
        `Failed to connect Ethereum wallet: ${error.message || "Unknown error"}`
      );
    }
  }
}

// Enhanced Phantom wallet (Solana) connection
export async function connectPhantomWallet(requestTradingPermission = false) {
  try {
    console.log("Connecting to Phantom wallet using enhanced method...");

    // Use our specialized function that ensures popup appears
    const phantomConnection = await connectToPhantom();

    console.log("Phantom connection successful:", phantomConnection);
    const publicKey = phantomConnection.publicKey;

    // Create a Solana connection
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com"
    );

    // If trading permissions are requested, ask for approval
    let tradingApproved = false;
    if (requestTradingPermission) {
      tradingApproved = await requestSolanaTradingPermissions(
        connection,
        publicKey
      );
    }

    return {
      address: publicKey.toString(),
      connection,
      publicKey: publicKey,
      networkType: "solana",
      type: "phantom",
      tradingApproved,
    };
  } catch (error) {
    console.error("Error in connectPhantomWallet:", error);
    throw new Error(`Failed to connect to Phantom wallet: ${error.message}`);
  }
}

// Coinbase Wallet
export async function connectCoinbaseWallet() {
  if (window.ethereum && window.ethereum.isCoinbaseWallet) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get provider - updated for ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Format chain ID as decimal
      const formattedChainId = parseInt(chainId, 16);

      return {
        address: accounts[0],
        provider,
        signer,
        chainId: formattedChainId,
        networkType: "ethereum",
      };
    } catch (error) {
      throw new Error(`Failed to connect to Coinbase Wallet: ${error.message}`);
    }
  } else {
    throw new Error("Coinbase Wallet is not installed");
  }
}

// BitGet Wallet
export async function connectBitgetWallet() {
  if (window.ethereum && window.ethereum.isBitKeep) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Format chain ID as decimal
      const formattedChainId = parseInt(chainId, 16);

      return {
        address: accounts[0],
        provider,
        signer,
        chainId: formattedChainId,
        networkType: "ethereum",
      };
    } catch (error) {
      throw new Error(`Failed to connect to BitGet Wallet: ${error.message}`);
    }
  } else {
    throw new Error("BitGet Wallet is not installed");
  }
}

// Uniswap Wallet
export async function connectUniswapWallet() {
  if (window.ethereum && window.ethereum.isUniswap) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Format chain ID as decimal
      const formattedChainId = parseInt(chainId, 16);

      return {
        address: accounts[0],
        provider,
        signer,
        chainId: formattedChainId,
        networkType: "ethereum",
      };
    } catch (error) {
      throw new Error(`Failed to connect to Uniswap Wallet: ${error.message}`);
    }
  } else {
    throw new Error("Uniswap Wallet is not installed");
  }
}

// OKX Wallet
export async function connectOKXWallet() {
  if (window.ethereum && window.ethereum.isOKExWallet) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Format chain ID as decimal
      const formattedChainId = parseInt(chainId, 16);

      return {
        address: accounts[0],
        provider,
        signer,
        chainId: formattedChainId,
        networkType: "ethereum",
      };
    } catch (error) {
      throw new Error(`Failed to connect to OKX Wallet: ${error.message}`);
    }
  } else {
    throw new Error("OKX Wallet is not installed");
  }
}

// Trust Wallet
export async function connectTrustWallet() {
  if (window.ethereum && window.ethereum.isTrust) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Format chain ID as decimal
      const formattedChainId = parseInt(chainId, 16);

      return {
        address: accounts[0],
        provider,
        signer,
        chainId: formattedChainId,
        networkType: "ethereum",
      };
    } catch (error) {
      throw new Error(`Failed to connect to Trust Wallet: ${error.message}`);
    }
  } else {
    throw new Error("Trust Wallet is not installed");
  }
}

// WalletConnect (Universal connector)
export async function connectWalletConnect(requestTradingPermissions = false) {
  try {
    console.log("Initializing WalletConnect...");
    // Get WalletConnect project ID from environment
    const projectId =
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      "04e0498d619f45278a71f1d15852fe38";

    // Get the window object (browser only)
    if (typeof window === "undefined") {
      throw new Error("WalletConnect requires a browser environment");
    }

    // Load WalletConnect script dynamically if not already loaded
    if (!window.WalletConnectModal) {
      console.log("Loading WalletConnect script...");
      await loadWalletConnectScript();
      console.log("WalletConnect script loaded:", !!window.WalletConnectModal);
    }

    if (!window.WalletConnectModal) {
      throw new Error(
        "Failed to load WalletConnect. Please refresh the page and try again."
      );
    }

    console.log("Creating WalletConnect provider...");
    // Create a standard EIP-1193 provider instance
    const provider = await createWalletConnectProvider(projectId);
    console.log("WalletConnect provider created");

    // Create ethers provider wrapper
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    console.log("WalletConnect connection successful");

    // If trading permissions are requested, ask for approval
    let tradingApproved = false;
    if (requestTradingPermissions) {
      tradingApproved = await requestEVMTradingPermissions(
        signer,
        provider.accounts[0]
      );
    }

    return {
      address: provider.accounts[0],
      provider: ethersProvider,
      signer,
      chainId: Number(provider.chainId),
      networkType: "ethereum",
      wcProvider: provider, // Keep reference to disconnect later
      tradingApproved,
    };
  } catch (error) {
    console.error("WalletConnect error:", error);
    throw new Error(`Failed to connect with WalletConnect: ${error.message}`);
  }
}

// Function to disconnect wallet
export async function disconnectWallet(walletType, wcProvider = null) {
  if (walletType === "phantom" && window.solana) {
    await window.solana.disconnect();
    return true;
  } else if (walletType === "walletconnect" && wcProvider) {
    // For WalletConnect
    try {
      if (
        wcProvider.disconnect &&
        typeof wcProvider.disconnect === "function"
      ) {
        await wcProvider.disconnect();
      } else if (wcProvider.close && typeof wcProvider.close === "function") {
        await wcProvider.close();
      }
    } catch (err) {
      console.error("Error disconnecting WalletConnect:", err);
    }
    return true;
  }

  // For other EVM wallets, there's no standard disconnect method
  // We just clear the state on our side
  return true;
}

// Helper function to dynamically load the WalletConnect web3modal script
async function loadWalletConnectScript() {
  return new Promise((resolve, reject) => {
    try {
      // Check if script already exists to prevent duplicates
      if (document.querySelector('script[src*="walletconnect/web3modal"]')) {
        if (window.WalletConnectModal) {
          return resolve();
        }
        // Wait a bit in case script is still loading
        setTimeout(() => {
          if (window.WalletConnectModal) {
            return resolve();
          }
          reject(
            new Error("WalletConnect script exists but modal not available")
          );
        }, 1000);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@walletconnect/web3modal@2.6.2/dist/index.js";
      script.integrity =
        "sha384-XJ5/JIo/G4tU8qgUFgxooCPe+8HEVQgFCYWqo5GO6iXGpKB8D09HjZY07rpCCAj";
      script.crossOrigin = "anonymous";
      script.async = true;

      script.onload = () => {
        console.log(
          "WalletConnect script loaded, checking for WalletConnectModal..."
        );
        if (window.WalletConnectModal) {
          console.log("WalletConnectModal found");
          resolve();
        } else {
          console.error("WalletConnectModal not found after script load");
          reject(new Error("Failed to load WalletConnect modal"));
        }
      };

      script.onerror = (e) => {
        console.error("Error loading WalletConnect script:", e);
        reject(new Error("Failed to load WalletConnect script"));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Exception loading WalletConnect script:", error);
      reject(error);
    }
  });
}

// Helper to create a WalletConnect provider instance
async function createWalletConnectProvider(projectId) {
  return new Promise((resolve, reject) => {
    try {
      if (!window.WalletConnectModal) {
        reject(new Error("WalletConnect not loaded"));
        return;
      }

      // Initialize the Web3Modal
      const web3Modal = new window.WalletConnectModal.Web3Modal({
        projectId: projectId,
        chains: [1], // Default to Ethereum Mainnet
        explorerRecommendedWalletIds: [
          // Popular wallets that should be shown at the top of the list
          "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
          "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
          "ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18", // Coinbase Wallet
        ],
        themeMode: "dark",
        metadata: {
          name: "AbuBeast",
          description: "Track newly launched tokens in real-time",
          url: window.location.origin,
          icons: [`${window.location.origin}/logo.png`],
        },
      });

      // Open the modal and get provider
      web3Modal
        .openModal()
        .then((provider) => {
          if (!provider) {
            reject(new Error("No provider selected"));
            return;
          }
          resolve(provider);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
}

// Function to request trading permissions for EVM wallets
async function requestEVMTradingPermissions(signer, address) {
  try {
    // Create a message for the user to sign granting trading permissions
    const message = `
AbuBeast Automated Trading Authorization

I authorize AbuBeast to execute trades on my behalf.
This permission allows the platform to automatically buy and sell tokens when specific criteria are met.
This signature does not give access to withdraw funds.

Wallet address: ${address}
Date: ${new Date().toISOString()}
Nonce: ${Math.floor(Math.random() * 1000000)}
`;

    // Ask user to sign the message
    const signature = await signer.signMessage(message);

    // Verify the signature on our end
    const verified = await verifySignature(address, message, signature);

    if (verified) {
      // Store the permission on the backend
      await saveTradePermission(address, "ethereum", signature, message);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to get trading permissions:", error);
    return false;
  }
}

// Function to request trading permissions for Solana wallets
async function requestSolanaTradingPermissions(connection, publicKey) {
  try {
    // Create a message for the user to sign granting trading permissions
    const encoder = new TextEncoder();
    const message = `
AbuBeast Automated Trading Authorization

I authorize AbuBeast to execute trades on my behalf.
This permission allows the platform to automatically buy and sell tokens when specific criteria are met.
This signature does not give access to withdraw funds.

Wallet address: ${publicKey.toString()}
Date: ${new Date().toISOString()}
Nonce: ${Math.floor(Math.random() * 1000000)}
`;

    const encodedMessage = encoder.encode(message);

    // Ask the user to sign the message
    const signature = await window.solana.request({
      method: "signMessage",
      params: {
        message: encodedMessage,
        display: "utf8",
      },
    });

    // Verify the signature
    const verified = await verifySignature(
      publicKey.toString(),
      message,
      signature.signature
    );

    if (verified) {
      // Store the permission on the backend
      await saveTradePermission(
        publicKey.toString(),
        "solana",
        signature.signature,
        message
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to get Solana trading permissions:", error);
    return false;
  }
}

// Verify signature using backend
async function verifySignature(address, message, signature) {
  try {
    const response = await fetch("/api/wallet/verify-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        message,
        signature,
      }),
    });

    const data = await response.json();
    return data.verified;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Save trading permission to the backend
async function saveTradePermission(
  walletAddress,
  walletType,
  signature,
  message
) {
  try {
    const response = await fetch("/api/wallet/trading-permission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        walletType,
        signature,
        message,
      }),
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Error saving trading permission:", error);
    return false;
  }
}
