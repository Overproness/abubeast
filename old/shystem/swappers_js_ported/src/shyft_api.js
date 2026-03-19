// Shyft API integration for transaction analysis
// Equivalent to shyft_api.rs

import axios from "axios";

const API_KEY = "YC65T1SP6NMXDI6X";
const ACCOUNT = "4VqLwuQgrvLVAwv9Zidj9FoJEthQbKCig9sdkeqyk93P";

/**
 * Get transaction data from Shyft API
 */
export async function getTxData(signature) {
  const url = `https://api.shyft.to/sol/v1/transaction/parsed?network=mainnet-beta&txn_signature=${signature}`;

  console.log(`[+] Fetching Data From Shyft API with Signature [${signature}]`);

  try {
    const response = await axios.get(url, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error: ${response.status}, ${response.data}`);
    }
  } catch (error) {
    throw new Error(`Shyft API Error: ${error.message}`);
  }
}

/**
 * Check if buy/sell transaction was successful
 */
export async function checkBuySellStatus(signature) {
  try {
    const data = await getTxData(signature);
    const status = data?.result?.status || "";
    return status === "Success";
  } catch (error) {
    console.error("Error checking transaction status:", error.message);
    return false;
  }
}

/**
 * Calculate profit/loss from buy and sell transactions
 */
export async function calProfitLoss(buySignature, sellSignature, token) {
  console.log("\n[+] Calculating Profit/Loss...");

  const buyData = await getTxData(buySignature);
  const sellData = await getTxData(sellSignature);

  // Extract buy amount in SOL
  let buyAmountSol = 0;
  const buyActions = buyData?.result?.actions || [];
  for (const action of buyActions) {
    const info = action?.info;
    if (info?.swapper === ACCOUNT) {
      const outToken = info?.tokens_swapped?.out?.token_address;
      if (outToken === token) {
        buyAmountSol = info?.tokens_swapped?.in?.amount || 0;
        break;
      }
    }
  }

  // Extract buy amount in tokens
  let buyAmountToken = 0;
  const buyBalances = buyData?.result?.token_balance_changes || [];
  for (const section of buyBalances) {
    if (section?.owner === ACCOUNT && section?.mint === token) {
      buyAmountToken = section?.change_amount || 0;
      break;
    }
  }
  console.log(`[+] Buy Amount Token: ${buyAmountToken}`);

  // Extract sell amount in SOL
  let sellAmountSol = 0;
  const sellActions = sellData?.result?.actions || [];
  for (const action of sellActions) {
    const info = action?.info;
    if (info?.swapper === ACCOUNT) {
      const inToken = info?.tokens_swapped?.in?.token_address;
      if (inToken === token) {
        sellAmountSol = info?.tokens_swapped?.out?.amount || 0;
      }
    }
  }

  // Extract sell amount in tokens
  let sellAmountToken = 0;
  const sellBalances = sellData?.result?.token_balance_changes || [];
  for (const section of sellBalances) {
    if (section?.owner === ACCOUNT && section?.mint === token) {
      sellAmountToken = Math.abs(section?.change_amount || 0);
      break;
    }
  }
  console.log(`[+] Sell Amount Token: ${sellAmountToken}`);
  console.log();
  console.log(`[+] Buy Amount SOL: ${buyAmountSol} SOL`);
  console.log(`[+] Sell Amount SOL: ${sellAmountSol} SOL`);

  const proceeds = (sellAmountSol / sellAmountToken) * buyAmountToken;
  const profitLoss = ((proceeds - buyAmountSol) / buyAmountSol) * 100;

  const profitLossRounded = Math.round(profitLoss * 1000) / 1000;

  console.log(`[+] Proceeds: ${proceeds} SOL`);
  console.log(`[+] Profit/Loss: ${profitLossRounded}%`);

  return profitLossRounded;
}
