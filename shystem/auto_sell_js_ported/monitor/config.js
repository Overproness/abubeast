// Monitor Configuration - JavaScript Port
// Port of monitor/config.rs

const SOLANATRACKER_BASE_URL = "https://data.solanatracker.io";
const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";
const MOBULA_BASE_URL = "https://explorer-api.mobula.io/api/1/";

function getSolanaTrackerApiKey() {
  return process.env.SOLANATRACKER_API_KEY || null;
}

function getBirdeyeApiKey() {
  return process.env.BIRDEYE_API_KEY || null;
}

const CHECK_INTERVAL = 10; // seconds
const MAX_TOKENS = 5;

// Known DEX programs for comprehensive monitoring
function getDexPrograms() {
  return {
    // Raydium
    raydium_amm: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
    raydium_clmm: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",

    // Jupiter (Aggregator)
    jupiter_v6: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    jupiter_v4: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",

    // Orca
    orca_aquafarm: "9W959DqEETiGZocYWCQPaJ6sBmUzgZqjLF6yXdWfhrqE",
    orca_whirlpool: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",

    // Meteora
    meteora_dlmm: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
    meteora_pools: "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB",

    // Other Major DEXs
    pumpfun: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    fluxbeam: "FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X",
    phoenix: "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY",
    openbook: "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
    serum: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    goosefx: "GFXsSL5sSaDfNFQUYsHekbWBW1TsFdjDYzACh62tEHxn",
    invariant: "HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt",
  };
}

function getAllDexProgramIds() {
  return Object.values(getDexPrograms());
}

module.exports = {
  SOLANATRACKER_BASE_URL,
  BIRDEYE_BASE_URL,
  MOBULA_BASE_URL,
  getSolanaTrackerApiKey,
  getBirdeyeApiKey,
  CHECK_INTERVAL,
  MAX_TOKENS,
  getDexPrograms,
  getAllDexProgramIds,
};
