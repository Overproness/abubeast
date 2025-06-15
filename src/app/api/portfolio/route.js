import { verifyToken } from "@/lib/auth/auth";
import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

// Token ABI for ERC20 tokens
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const walletType = searchParams.get("type") || "ethereum"; // Default to ethereum

    console.log(
      "[Portfolio API] Request received for wallet:",
      wallet,
      "type:",
      walletType
    );

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.cookies.get("token")?.value;
    console.log("[Portfolio API] Token found:", !!token);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    console.log("[Portfolio API] Token verification result:", !!tokenData);

    if (!tokenData || !tokenData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch portfolio data based on wallet type
    const portfolioData = await fetchWalletPortfolio(wallet, walletType);

    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error("[Portfolio API] Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}

async function fetchWalletPortfolio(walletAddress, walletType) {
  try {
    console.log(
      `[Portfolio API] Fetching ${walletType} portfolio for:`,
      walletAddress
    );

    let portfolioData;

    if (walletType === "solana") {
      portfolioData = await fetchSolanaPortfolio(walletAddress);
    } else {
      // Default to Ethereum/EVM
      portfolioData = await fetchEthereumPortfolio(walletAddress);
    }

    return portfolioData;
  } catch (error) {
    console.error("Error fetching wallet portfolio:", error);
    throw error;
  }
}

async function fetchSolanaPortfolio(walletAddress) {
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com"
    );

    const publicKey = new PublicKey(walletAddress);

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceInSol = solBalance / 1000000000; // Convert lamports to SOL

    // Get token prices (primarily SOL)
    const tokenPrices = await getTokenPrices(["solana"]);
    const solPrice = tokenPrices.solana?.usd || 50; // Default price if API fails

    // Calculate total balance
    const solValue = solBalanceInSol * solPrice;
    const totalBalance = solValue;

    // Get token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }
    );

    console.log(
      `[Portfolio API] Found ${tokenAccounts.value.length} Solana token accounts`
    );

    const holdings = [];

    // Add SOL holding
    if (solBalanceInSol > 0) {
      holdings.push({
        name: "Solana",
        symbol: "SOL",
        balance: solBalanceInSol,
        value: solValue,
        pnl: 0, // Would need historical data for accurate P&L
        pnlPercentage: 0,
        logo: "https://assets.coincap.io/assets/icons/sol@2x.png",
        mintAddress: "So11111111111111111111111111111111111111112",
      });
    }

    // Generate historical data for chart
    const historicalData = generateMockHistoricalData(totalBalance);

    return {
      totalBalance,
      totalPnL: totalBalance * 0.15, // Mock 15% profit
      totalPnLPercentage: 15,
      tokenCount: 1 + tokenAccounts.value.length,
      holdings,
      historicalData,
    };
  } catch (error) {
    console.error("Error fetching Solana portfolio:", error);

    // Return default data if there's an error
    return {
      totalBalance: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      tokenCount: 0,
      holdings: [],
      historicalData: generateMockHistoricalData(0),
    };
  }
}

async function fetchEthereumPortfolio(walletAddress) {
  try {
    // Use a reliable RPC provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
        "https://eth-mainnet.g.alchemy.com/v2/demo"
    );

    // Get ETH balance
    const ethBalance = await provider.getBalance(walletAddress);
    const ethBalanceInEth = parseFloat(ethers.formatEther(ethBalance));

    console.log(`[Portfolio API] ETH balance: ${ethBalanceInEth}`);

    // Get token prices
    const tokenPrices = await getTokenPrices(["ethereum"]);
    const ethPrice = tokenPrices.ethereum?.usd || 2000; // Default price if API fails

    const ethValue = ethBalanceInEth * ethPrice;
    const totalBalance = ethValue;

    const holdings = [];

    // Add ETH holding
    if (ethBalanceInEth > 0) {
      holdings.push({
        name: "Ethereum",
        symbol: "ETH",
        balance: ethBalanceInEth,
        value: ethValue,
        pnl: ethValue * 0.2, // Mock 20% profit
        pnlPercentage: 20,
        logo: "https://assets.coincap.io/assets/icons/eth@2x.png",
        contractAddress: "0x0000000000000000000000000000000000000000",
      });
    }

    // Common ERC20 tokens to check
    const commonTokens = [
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
        name: "Tether",
        logo: "https://assets.coincap.io/assets/icons/usdt@2x.png",
      },
      {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        name: "USD Coin",
        logo: "https://assets.coincap.io/assets/icons/usdc@2x.png",
      },
      {
        address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        symbol: "LINK",
        name: "Chainlink",
        logo: "https://assets.coincap.io/assets/icons/link@2x.png",
      },
    ];

    // Check for token balances
    for (const token of commonTokens) {
      try {
        const contract = new ethers.Contract(
          token.address,
          ERC20_ABI,
          provider
        );
        const balance = await contract.balanceOf(walletAddress);
        const decimals = await contract.decimals();
        const balanceFormatted = parseFloat(
          ethers.formatUnits(balance, decimals)
        );

        if (balanceFormatted > 0) {
          // Get token price
          const tokenPriceResponse = await getTokenPrices([
            token.symbol.toLowerCase(),
          ]);
          const tokenPrice =
            tokenPriceResponse[token.symbol.toLowerCase()]?.usd || 1;

          const value = balanceFormatted * tokenPrice;

          holdings.push({
            name: token.name,
            symbol: token.symbol,
            balance: balanceFormatted,
            value: value,
            pnl: value * 0.1, // Mock 10% profit
            pnlPercentage: 10,
            logo: token.logo,
            contractAddress: token.address,
          });

          // Add to total balance
          totalBalance += value;
        }
      } catch (error) {
        console.error(`Error fetching data for token ${token.symbol}:`, error);
      }
    }

    // Generate historical data for chart
    const historicalData = generateMockHistoricalData(totalBalance);

    return {
      totalBalance,
      totalPnL: totalBalance * 0.2,
      totalPnLPercentage: 20,
      tokenCount: holdings.length,
      holdings,
      historicalData,
    };
  } catch (error) {
    console.error("Error fetching Ethereum portfolio:", error);

    // Return default data if there's an error
    return {
      totalBalance: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      tokenCount: 0,
      holdings: [],
      historicalData: generateMockHistoricalData(0),
    };
  }
}

// Get token prices from CoinGecko
async function getTokenPrices(tokenIds) {
  try {
    const idsString = tokenIds.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return {};
  }
}

// Generate mock historical data for the portfolio chart
function generateMockHistoricalData(currentValue) {
  const data = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  // Generate data for the past 30 days
  for (let i = 30; i >= 0; i--) {
    // Fluctuate the value slightly to make the chart look realistic
    const randomFactor = 0.95 + Math.random() * 0.1; // Between 0.95 and 1.05

    // Calculate this day's value (start with 80% of current value and grow)
    let dayValue;
    if (i === 0) {
      dayValue = currentValue; // Today's value is the current value
    } else {
      // Past values are lower, with some random fluctuation
      dayValue = currentValue * (0.8 + ((30 - i) / 30) * 0.2) * randomFactor;
    }

    data.push({
      time: Math.floor((now - i * dayInMs) / 1000), // Convert to seconds
      value: dayValue,
    });
  }

  return data;
}
