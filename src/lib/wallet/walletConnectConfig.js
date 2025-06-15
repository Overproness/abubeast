/**
 * WalletConnect configuration settings
 */
export const WALLET_CONNECT_CONFIG = {
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "04e0498d619f45278a71f1d15852fe38",
  metadata: {
    name: "AbuBeast",
    description: "Track newly launched tokens in real-time",
    url: "https://abubeast.com",
    icons: ["https://abubeast.com/logo.png"],
  },
  // Supported chains
  chains: {
    ethereum: 1, // Ethereum Mainnet
    bsc: 56, // Binance Smart Chain
    polygon: 137, // Polygon
    arbitrum: 42161, // Arbitrum
    avalanche: 43114, // Avalanche
    optimism: 10, // Optimism
  },
};
