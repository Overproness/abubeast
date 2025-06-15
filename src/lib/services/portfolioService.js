import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";

/**
 * Service to handle portfolio calculations and blockchain data fetching
 */

// ERC20 ABI for token balance queries
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

/**
 * Fetch portfolio data for an Ethereum wallet
 */
export async function fetchEthereumPortfolio(walletAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

    // Get ETH balance
    const ethBalance = await provider.getBalance(walletAddress);
    const ethBalanceFormatted = parseFloat(ethers.formatEther(ethBalance));

    // Get ETH price (in a real implementation, fetch from price API)
    const ethPrice = await fetchTokenPrice("ethereum");

    const portfolio = {
      nativeToken: {
        symbol: "ETH",
        name: "Ethereum",
        balance: ethBalanceFormatted,
        price: ethPrice,
        value: ethBalanceFormatted * ethPrice,
      },
      tokens: [],
      totalValue: ethBalanceFormatted * ethPrice,
    };

    // Fetch ERC20 token balances (you would need a list of tokens to check)
    const commonTokens = [
      { address: "0xA0b86a33E6417C7C5a77f1b7Fe1e2B2e33C6D1D4", symbol: "USDC" },
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT" },
      // Add more token addresses as needed
    ];

    for (const tokenInfo of commonTokens) {
      try {
        const tokenContract = new ethers.Contract(
          tokenInfo.address,
          ERC20_ABI,
          provider
        );

        const balance = await tokenContract.balanceOf(walletAddress);
        const decimals = await tokenContract.decimals();
        const name = await tokenContract.name();

        const balanceFormatted = parseFloat(
          ethers.formatUnits(balance, decimals)
        );

        if (balanceFormatted > 0) {
          const tokenPrice = await fetchTokenPrice(
            tokenInfo.symbol.toLowerCase()
          );
          const tokenValue = balanceFormatted * tokenPrice;

          portfolio.tokens.push({
            address: tokenInfo.address,
            symbol: tokenInfo.symbol,
            name,
            balance: balanceFormatted,
            price: tokenPrice,
            value: tokenValue,
          });

          portfolio.totalValue += tokenValue;
        }
      } catch (error) {
        console.error(`Error fetching token ${tokenInfo.symbol}:`, error);
      }
    }

    return portfolio;
  } catch (error) {
    console.error("Error fetching Ethereum portfolio:", error);
    throw error;
  }
}

/**
 * Fetch portfolio data for a Solana wallet
 */
export async function fetchSolanaPortfolio(walletAddress) {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const publicKey = new PublicKey(walletAddress);

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceFormatted = solBalance / 1e9; // Convert lamports to SOL

    // Get SOL price
    const solPrice = await fetchTokenPrice("solana");

    const portfolio = {
      nativeToken: {
        symbol: "SOL",
        name: "Solana",
        balance: solBalanceFormatted,
        price: solPrice,
        value: solBalanceFormatted * solPrice,
      },
      tokens: [],
      totalValue: solBalanceFormatted * solPrice,
    };

    // Fetch SPL token balances
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }
    );

    for (const tokenAccount of tokenAccounts.value) {
      const accountData = tokenAccount.account.data.parsed.info;
      const balance = parseFloat(accountData.tokenAmount.uiAmount);

      if (balance > 0) {
        const mintAddress = accountData.mint;

        // In a real implementation, you would fetch token metadata and prices
        portfolio.tokens.push({
          address: mintAddress,
          symbol: "Unknown",
          name: "Unknown Token",
          balance,
          price: 0,
          value: 0,
        });
      }
    }

    return portfolio;
  } catch (error) {
    console.error("Error fetching Solana portfolio:", error);
    throw error;
  }
}

/**
 * Fetch token price from external API
 */
async function fetchTokenPrice(tokenId) {
  try {
    // Using CoinGecko API as an example
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${tokenId}`);
    }

    const data = await response.json();
    return data[tokenId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching price for ${tokenId}:`, error);
    return 0;
  }
}

/**
 * Calculate portfolio performance metrics
 */
export function calculatePortfolioMetrics(
  currentPortfolio,
  historicalPortfolio
) {
  if (!historicalPortfolio || historicalPortfolio.length === 0) {
    return {
      totalPnL: 0,
      totalPnLPercentage: 0,
      dayChange: 0,
      dayChangePercentage: 0,
    };
  }

  const oldestEntry = historicalPortfolio[0];
  const newestEntry = historicalPortfolio[historicalPortfolio.length - 1];

  const totalPnL = currentPortfolio.totalValue - oldestEntry.totalValue;
  const totalPnLPercentage = (totalPnL / oldestEntry.totalValue) * 100;

  // Calculate 24h change
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const dayAgoEntry =
    historicalPortfolio.find(
      (entry) => new Date(entry.timestamp).getTime() >= dayAgo
    ) || oldestEntry;

  const dayChange = currentPortfolio.totalValue - dayAgoEntry.totalValue;
  const dayChangePercentage = (dayChange / dayAgoEntry.totalValue) * 100;

  return {
    totalPnL,
    totalPnLPercentage,
    dayChange,
    dayChangePercentage,
  };
}

/**
 * Save portfolio snapshot to database
 */
export async function savePortfolioSnapshot(
  userId,
  walletAddress,
  portfolioData
) {
  try {
    const PortfolioHistory = (await import("@/models/PortfolioHistory"))
      .default;

    const snapshot = new PortfolioHistory({
      userId,
      walletAddress: walletAddress.toLowerCase(),
      totalValue: portfolioData.totalValue,
      holdings: [
        {
          tokenAddress: "native",
          symbol: portfolioData.nativeToken.symbol,
          name: portfolioData.nativeToken.name,
          balance: portfolioData.nativeToken.balance,
          value: portfolioData.nativeToken.value,
          price: portfolioData.nativeToken.price,
        },
        ...portfolioData.tokens.map((token) => ({
          tokenAddress: token.address,
          symbol: token.symbol,
          name: token.name,
          balance: token.balance,
          value: token.value,
          price: token.price,
        })),
      ],
    });

    await snapshot.save();
    return snapshot;
  } catch (error) {
    console.error("Error saving portfolio snapshot:", error);
    throw error;
  }
}
