import axios from "axios";

/**
 * GoPlus Security API Service
 * Provides token security analysis using GoPlus Labs APIs
 */

class GoPlusSecurityService {
  constructor() {
    this.baseUrl = "https://api.gopluslabs.io";
    this.timeout = 15000; // 15 seconds
    this.maxRetries = 2;
    
    // Supported chain mappings
    this.chainMappings = {
      // EVM Chains
      1: "Ethereum",
      56: "BSC", 
      42161: "Arbitrum",
      137: "Polygon",
      324: "zkSync Era",
      59144: "Linea Mainnet",
      8453: "Base",
      534352: "Scroll",
      10: "Optimism",
      43114: "Avalanche",
      250: "Fantom",
      25: "Cronos",
      66: "OKC",
      128: "HECO",
      100: "Gnosis",
      10001: "ETHW",
      321: "KCC",
      201022: "FON",
      5000: "Mantle",
      204: "opBNB",
      42766: "ZKFair",
      81457: "Blast",
      169: "Manta Pacific",
      80094: "Berachain",
      2741: "Abstract",
      177: "Hashkey Chain",
      146: "Sonic",
      1514: "Story",
      // Special chains
      "tron": "Tron",
      "solana": "Solana",
      "sui": "Sui"
    };
  }

  /**
   * Detect blockchain type from token address
   */
  detectBlockchain(address) {
    if (!address) return null;
    
    // Tron addresses start with T and are 34 characters
    if (address.length === 34 && address.startsWith("T")) {
      return "tron";
    }
    
    // Ethereum-like addresses are 42 characters and start with 0x
    if (address.length === 42 && address.startsWith("0x")) {
      return "ethereum"; // Default EVM chain
    }
    
    // Solana addresses are typically 32-44 characters and base58 encoded
    if (address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      return "solana";
    }
    
    // Default to ethereum for unknown formats
    return "ethereum";
  }

  /**
   * Get chain ID for blockchain
   */
  getChainId(blockchain, specificChain = null) {
    if (specificChain && this.chainMappings[specificChain]) {
      return specificChain;
    }
    
    switch (blockchain) {
      case "ethereum":
        return 1; // Ethereum mainnet
      case "solana":
        return "solana";
      case "sui":
        return "sui";
      case "tron":
        return "tron";
      case "bsc":
        return 56;
      case "polygon":
        return 137;
      case "arbitrum":
        return 42161;
      case "base":
        return 8453;
      case "optimism":
        return 10;
      case "avalanche":
        return 43114;
      default:
        return 1; // Default to Ethereum
    }
  }

  /**
   * Make request to GoPlus API with retry logic
   */
  async makeRequest(url, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[GoPlus] API Request (attempt ${attempt}): ${url}`);
        
        const response = await axios({
          url,
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AbuBeast-Security-Scanner/1.0',
            ...options.headers
          },
          ...options
        });

        if (response.status === 200 && response.data) {
          console.log(`[GoPlus] Success: ${url}`);
          return response.data;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error;
        console.warn(`[GoPlus] Attempt ${attempt} failed:`, error.message);
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Get token security information for non-Solana tokens
   */
  async getTokenSecurity(contractAddress, chainId = 1) {
    try {
      const url = `${this.baseUrl}/api/v1/token_security/${chainId}`;
      const params = { contract_addresses: contractAddress };
      
      const data = await this.makeRequest(url, { params });
      
      if (data?.code === 1) {
        // Success - extract security data for the token
        const tokenSecurity = data.result?.[contractAddress.toLowerCase()];
        
        if (tokenSecurity) {
          return this.normalizeTokenSecurity(tokenSecurity, "evm");
        }
      }
      
      // Handle specific error codes
      if (data?.code) {
        console.warn(`[GoPlus] API returned code ${data.code}:`, this.getErrorMessage(data.code));
      }
      
      return null;
    } catch (error) {
      console.error(`[GoPlus] Token security check failed for ${contractAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Get token security information for Solana tokens
   */
  async getSolanaTokenSecurity(contractAddress) {
    try {
      const url = `${this.baseUrl}/api/v1/solana/token_security`;
      const params = { contract_addresses: contractAddress };
      
      const data = await this.makeRequest(url, { params });
      
      if (data?.code === 1) {
        // Success - extract security data for the token
        const tokenSecurity = data.result?.[contractAddress];
        
        if (tokenSecurity) {
          return this.normalizeTokenSecurity(tokenSecurity, "solana");
        }
      }
      
      // Handle specific error codes
      if (data?.code) {
        console.warn(`[GoPlus] Solana API returned code ${data.code}:`, this.getErrorMessage(data.code));
      }
      
      return null;
    } catch (error) {
      console.error(`[GoPlus] Solana token security check failed for ${contractAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Get Sui token security information
   */
  async getSuiTokenSecurity(contractAddress) {
    try {
      const url = `${this.baseUrl}/api/v1/sui/token_security`;
      const params = { contract_addresses: contractAddress };
      
      const data = await this.makeRequest(url, { params });
      
      if (data?.code === 1) {
        const tokenSecurity = data.result?.[contractAddress];
        
        if (tokenSecurity) {
          return this.normalizeTokenSecurity(tokenSecurity, "sui");
        }
      }
      
      if (data?.code) {
        console.warn(`[GoPlus] Sui API returned code ${data.code}:`, this.getErrorMessage(data.code));
      }
      
      return null;
    } catch (error) {
      console.error(`[GoPlus] Sui token security check failed for ${contractAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Check if address is malicious
   */
  async checkMaliciousAddress(address, chainId = 1) {
    try {
      const url = `${this.baseUrl}/api/v1/address_security/${address}`;
      const params = { chain_id: chainId };
      
      const data = await this.makeRequest(url, { params });
      
      if (data?.code === 1 && data.result) {
        return {
          isMalicious: data.result.malicious_behavior === "1",
          riskFactors: data.result.risk_factors || [],
          confidence: data.result.confidence || 0,
          lastUpdated: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[GoPlus] Address security check failed for ${address}:`, error.message);
      return null;
    }
  }

  /**
   * Get token locker information
   */
  async getTokenLockerInfo(tokenAddress, chainId = 8453, pageNum = 1, pageSize = 100) {
    try {
      const url = `${this.baseUrl}/open/api/v1/locks/token`;
      const params = { 
        chainId: chainId.toString(),
        pageNum,
        pageSize,
        tokenAddress 
      };
      
      const data = await this.makeRequest(url, { params });
      
      if (data?.code === 1) {
        return {
          locks: data.result?.data || [],
          totalCount: data.result?.total || 0,
          hasLocks: (data.result?.total || 0) > 0
        };
      }
      
      return { locks: [], totalCount: 0, hasLocks: false };
    } catch (error) {
      console.error(`[GoPlus] Token locker check failed for ${tokenAddress}:`, error.message);
      return { locks: [], totalCount: 0, hasLocks: false };
    }
  }

  /**
   * Normalize security data from different blockchains
   */
  normalizeTokenSecurity(securityData, blockchain) {
    const normalized = {
      // Basic info
      blockchain,
      scanned_at: new Date().toISOString(),
      
      // Risk indicators (normalize to boolean where possible)
      is_honeypot: this.parseBoolean(securityData.is_honeypot),
      is_blacklisted: this.parseBoolean(securityData.is_blacklisted),
      is_whitelisted: this.parseBoolean(securityData.is_whitelisted),
      is_open_source: this.parseBoolean(securityData.is_open_source),
      is_proxy: this.parseBoolean(securityData.is_proxy),
      is_mintable: this.parseBoolean(securityData.is_mintable),
      
      // Ownership & control
      owner_change_balance: this.parseBoolean(securityData.owner_change_balance),
      can_take_back_ownership: this.parseBoolean(securityData.can_take_back_ownership),
      owner_address: securityData.owner_address || null,
      creator_address: securityData.creator_address || null,
      
      // Trading restrictions
      cannot_buy: this.parseBoolean(securityData.cannot_buy),
      cannot_sell_all: this.parseBoolean(securityData.cannot_sell_all),
      trading_cooldown: this.parseBoolean(securityData.trading_cooldown),
      transfer_pausable: this.parseBoolean(securityData.transfer_pausable),
      
      // Tax information
      buy_tax: this.parseNumber(securityData.buy_tax),
      sell_tax: this.parseNumber(securityData.sell_tax),
      slippage_modifiable: this.parseBoolean(securityData.slippage_modifiable),
      
      // Liquidity
      liquidity_locked: this.parseBoolean(securityData.liquidity_locked),
      liquidity_ratio: this.parseNumber(securityData.liquidity_ratio),
      
      // Security score calculation
      risk_score: this.calculateRiskScore(securityData),
      risk_level: this.calculateRiskLevel(securityData),
      
      // Raw data for reference
      raw_data: securityData
    };

    // Add blockchain-specific fields
    if (blockchain === "solana") {
      normalized.freeze_authority = securityData.freeze_authority || null;
      normalized.mint_authority = securityData.mint_authority || null;
    }

    return normalized;
  }

  /**
   * Calculate overall risk score (0-100, where 100 is highest risk)
   */
  calculateRiskScore(securityData) {
    let score = 0;
    
    // High risk factors (20 points each)
    if (this.parseBoolean(securityData.is_honeypot)) score += 20;
    if (this.parseBoolean(securityData.is_blacklisted)) score += 20;
    if (this.parseBoolean(securityData.cannot_sell_all)) score += 20;
    
    // Medium risk factors (15 points each)
    if (this.parseBoolean(securityData.owner_change_balance)) score += 15;
    if (this.parseBoolean(securityData.can_take_back_ownership)) score += 15;
    if (this.parseBoolean(securityData.is_mintable)) score += 15;
    
    // Tax-related risks
    const buyTax = this.parseNumber(securityData.buy_tax);
    const sellTax = this.parseNumber(securityData.sell_tax);
    if (buyTax > 10) score += 10;
    if (sellTax > 10) score += 10;
    if (buyTax > 20 || sellTax > 20) score += 10; // Extra penalty for very high taxes
    
    // Trading restrictions (5-10 points each)
    if (this.parseBoolean(securityData.cannot_buy)) score += 10;
    if (this.parseBoolean(securityData.trading_cooldown)) score += 5;
    if (this.parseBoolean(securityData.transfer_pausable)) score += 10;
    
    // Positive factors (reduce score)
    if (this.parseBoolean(securityData.is_open_source)) score -= 5;
    if (this.parseBoolean(securityData.is_whitelisted)) score -= 10;
    if (this.parseBoolean(securityData.liquidity_locked)) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate risk level based on various factors
   */
  calculateRiskLevel(securityData) {
    const riskScore = this.calculateRiskScore(securityData);
    
    if (riskScore >= 60) return "high";
    if (riskScore >= 30) return "medium";
    if (riskScore >= 10) return "low";
    return "minimal";
  }

  /**
   * Parse boolean values from API (handles "0"/"1" strings)
   */
  parseBoolean(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value === "1" || value.toLowerCase() === "true";
    }
    if (typeof value === "number") return value === 1;
    return false;
  }

  /**
   * Parse numeric values from API
   */
  parseNumber(value) {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Get comprehensive token security analysis
   */
  async analyzeTokenSecurity(contractAddress, chainId = null) {
    const blockchain = this.detectBlockchain(contractAddress);
    
    console.log(`[GoPlus] Analyzing security for ${contractAddress} on ${blockchain}`);
    
    let securityData = null;
    let addressSecurity = null;
    let lockerInfo = null;
    
    try {
      // Get token security based on blockchain
      if (blockchain === "solana") {
        securityData = await this.getSolanaTokenSecurity(contractAddress);
      } else if (blockchain === "sui") {
        securityData = await this.getSuiTokenSecurity(contractAddress);
      } else {
        // EVM-based chains
        const resolvedChainId = chainId || this.getChainId(blockchain);
        securityData = await this.getTokenSecurity(contractAddress, resolvedChainId);
        
        // Also check address security for EVM chains
        addressSecurity = await this.checkMaliciousAddress(contractAddress, resolvedChainId);
        
        // Get locker information
        lockerInfo = await this.getTokenLockerInfo(contractAddress, resolvedChainId);
      }
      
      // Compile comprehensive analysis
      const analysis = {
        address: contractAddress,
        blockchain,
        chainId: chainId || this.getChainId(blockchain),
        scanned_at: new Date().toISOString(),
        has_security_data: !!securityData,
        
        // Token security
        token_security: securityData,
        
        // Address security
        address_security: addressSecurity,
        
        // Locker information
        locker_info: lockerInfo,
        
        // Overall assessment
        overall_risk_score: securityData ? securityData.risk_score : 50, // Default medium risk if no data
        overall_risk_level: securityData ? securityData.risk_level : "unknown",
        
        // Recommendations
        is_tradeable: this.isTokenTradeable(securityData, addressSecurity),
        requires_caution: this.requiresCaution(securityData, addressSecurity),
        red_flags: this.getRedFlags(securityData, addressSecurity)
      };
      
      console.log(`[GoPlus] Analysis complete for ${contractAddress}: Risk Level = ${analysis.overall_risk_level}`);
      return analysis;
      
    } catch (error) {
      console.error(`[GoPlus] Security analysis failed for ${contractAddress}:`, error.message);
      
      // Return minimal analysis on error
      return {
        address: contractAddress,
        blockchain,
        chainId: chainId || this.getChainId(blockchain),
        scanned_at: new Date().toISOString(),
        has_security_data: false,
        error: error.message,
        overall_risk_score: 50, // Default medium risk
        overall_risk_level: "unknown",
        is_tradeable: false, // Err on the side of caution
        requires_caution: true,
        red_flags: ["Security analysis failed"]
      };
    }
  }

  /**
   * Determine if token is tradeable based on security analysis
   */
  isTokenTradeable(tokenSecurity, addressSecurity) {
    if (!tokenSecurity) return false;
    
    // Immediate red flags that make token untradeable
    if (tokenSecurity.is_honeypot) return false;
    if (tokenSecurity.cannot_buy) return false;
    if (tokenSecurity.cannot_sell_all) return false;
    if (addressSecurity?.isMalicious) return false;
    
    return true;
  }

  /**
   * Determine if token requires extra caution
   */
  requiresCaution(tokenSecurity, addressSecurity) {
    if (!tokenSecurity) return true;
    
    return (
      tokenSecurity.risk_score >= 40 ||
      tokenSecurity.is_mintable ||
      tokenSecurity.owner_change_balance ||
      (tokenSecurity.buy_tax > 10 || tokenSecurity.sell_tax > 10) ||
      !tokenSecurity.liquidity_locked ||
      addressSecurity?.isMalicious
    );
  }

  /**
   * Get list of red flags from security analysis
   */
  getRedFlags(tokenSecurity, addressSecurity) {
    const redFlags = [];
    
    if (!tokenSecurity) {
      redFlags.push("No security data available");
      return redFlags;
    }
    
    if (tokenSecurity.is_honeypot) redFlags.push("Honeypot detected");
    if (tokenSecurity.is_blacklisted) redFlags.push("Token is blacklisted");
    if (tokenSecurity.cannot_sell_all) redFlags.push("Cannot sell all tokens");
    if (tokenSecurity.cannot_buy) redFlags.push("Cannot buy tokens");
    if (tokenSecurity.owner_change_balance) redFlags.push("Owner can change balances");
    if (tokenSecurity.can_take_back_ownership) redFlags.push("Ownership can be reclaimed");
    if (tokenSecurity.is_mintable) redFlags.push("Token is mintable");
    if (tokenSecurity.buy_tax > 20) redFlags.push(`Very high buy tax: ${tokenSecurity.buy_tax}%`);
    if (tokenSecurity.sell_tax > 20) redFlags.push(`Very high sell tax: ${tokenSecurity.sell_tax}%`);
    if (!tokenSecurity.liquidity_locked) redFlags.push("Liquidity not locked");
    if (addressSecurity?.isMalicious) redFlags.push("Address flagged as malicious");
    
    return redFlags;
  }

  /**
   * Get error message for GoPlus API status codes
   */
  getErrorMessage(code) {
    const messages = {
      1: "Complete data prepared",
      2: "Partial data obtained",
      2004: "Contract address format error",
      2018: "ChainID not supported",
      2020: "Non-contract address",
      2021: "No info for this contract",
      2022: "Non-supported chainId",
      2026: "dApp not found",
      2027: "ABI not found",
      2028: "The ABI not support parsing",
      4010: "App_key not exist",
      4011: "Signature expiration",
      4012: "Wrong Signature",
      4023: "Access token not found",
      4029: "Request limit reached",
      5000: "System error",
      5006: "Param error"
    };
    
    return messages[code] || `Unknown error code: ${code}`;
  }

  /**
   * Get supported chains list
   */
  getSupportedChains() {
    return this.chainMappings;
  }
}

// Create singleton instance
const goPlusSecurityService = new GoPlusSecurityService();

export default goPlusSecurityService;
