import { WALLET_CONNECT_CONFIG } from "@/lib/wallet/walletConnectConfig";
import { ethers } from "ethers";

/**
 * Initialize WalletConnect provider with proper error handling
 */
export async function initWalletConnectProvider() {
  try {
    // Dynamic import to avoid SSR issues
    const { default: EthereumProvider } = await import(
      "@walletconnect/ethereum-provider"
    );

    const provider = await EthereumProvider.init({
      projectId: WALLET_CONNECT_CONFIG.projectId,
      chains: [WALLET_CONNECT_CONFIG.chains.ethereum],
      optionalChains: [
        WALLET_CONNECT_CONFIG.chains.bsc,
        WALLET_CONNECT_CONFIG.chains.polygon,
        WALLET_CONNECT_CONFIG.chains.arbitrum,
        WALLET_CONNECT_CONFIG.chains.avalanche,
        WALLET_CONNECT_CONFIG.chains.optimism,
      ],
      showQrModal: true,
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
      ],
      events: ["chainChanged", "accountsChanged"],
      metadata: WALLET_CONNECT_CONFIG.metadata,
    });

    return provider;
  } catch (error) {
    console.error("Failed to initialize WalletConnect provider:", error);
    throw new Error(`WalletConnect initialization failed: ${error.message}`);
  }
}

/**
 * Connect to WalletConnect with proper error handling
 */
export async function connectViaWalletConnect() {
  try {
    const provider = await initWalletConnectProvider();

    // Connect and show QR code modal
    await provider.connect();

    if (!provider.accounts || provider.accounts.length === 0) {
      throw new Error("No accounts returned from WalletConnect");
    }

    // Create ethers wrapper
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Set up event listeners
    provider.on("accountsChanged", (accounts) => {
      console.log("WalletConnect accounts changed:", accounts);
    });

    provider.on("chainChanged", (chainId) => {
      console.log("WalletConnect chain changed:", chainId);
    });

    provider.on("disconnect", () => {
      console.log("WalletConnect session disconnected");
    });

    return {
      address: provider.accounts[0],
      provider: ethersProvider,
      signer,
      chainId: provider.chainId,
      networkType: "ethereum",
      wcProvider: provider,
    };
  } catch (error) {
    console.error("WalletConnect connection error:", error);
    throw new Error(`WalletConnect connection failed: ${error.message}`);
  }
}
