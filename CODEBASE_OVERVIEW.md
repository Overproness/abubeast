## 1. Project Overview

**AbuBeast** is a full-stack Next.js 15 web application that acts as an AI-powered crypto trading bot on the **Solana blockchain**. The core value proposition is:

1. A user connects their Solana wallet (Phantom, and others).
2. They grant a cryptographically signed **session key** that permits the backend to execute trades **on their behalf** — without ever holding their private key.
3. A background bot engine monitors newly-launched Solana tokens and executes buy/sell trades autonomously for all active users using their individual session keys.

The application is primary Solana-focused

---

## 6. Wallet Connection System

### Supported Wallets

| Wallet          | Network         | Detection                          |
| --------------- | --------------- | ---------------------------------- |
| Phantom         | Solana          | `window.solana.isPhantom`          |
| MetaMask        | Ethereum/EVM    | `window.ethereum.isMetaMask`       |
| Coinbase Wallet | Ethereum/EVM    | `window.ethereum.isCoinbaseWallet` |
| BitGet Wallet   | Ethereum/EVM    | `window.ethereum.isBitKeep`        |
| Uniswap Wallet  | Ethereum/EVM    | `window.ethereum.isUniswap`        |
| OKX Wallet      | Ethereum/EVM    | `window.ethereum.isOKExWallet`     |
| Trust Wallet    | Ethereum/EVM    | `window.ethereum.isTrust`          |
| WalletConnect   | EVM (Universal) | Always available (CDN loaded)      |

### Connection Flow (UI)

```
User clicks "Connect Wallet" button in Navbar (WalletConnect component)
    → WalletDropdown opens
        - Detects which wallets exist in the browser
        - Shows "Detected Wallets" section + always shows WalletConnect
    → User clicks a wallet
        - If WalletConnect → opens QR modal (WalletConnectModal)
        - Else → calls handleConnectWallet(walletType)
    → AuthContext.connectWallet(walletType) is called
    → Calls the appropriate adapter in src/lib/wallet/walletUtils.js
    → Returns { address, networkType, provider, ... }
    → walletInfo state is set in AuthContext
    → walletInfo is persisted to localStorage (minus provider reference)
    → If authenticated: POST /api/user/wallet to associate wallet with account
```

### EVM vs Solana

- **EVM wallets**: Use `window.ethereum.request({ method: 'eth_requestAccounts' })` and wrap the provider in `ethers.BrowserProvider`.
- **Phantom (Solana)**: Uses `window.solana.connect()` returning a PublicKey. Creates a `@solana/web3.js Connection` to mainnet RPC.
- **WalletConnect**: Dynamically loads WalletConnect SDK from CDN, creates an EIP-1193 provider, wraps in ethers.

---

## 7. Trading Permission & Session Key System

This is the most critical and unique system in AbuBeast. It solves the problem of **how to trade automatically on a user's behalf without ever holding their private key**.

### The Problem It Solves

Traditional bots store a user's private key on the server — a massive security risk. AbuBeast instead uses a **session key delegation** model:

1. **The backend generates** a fresh Solana keypair (public + secret key).
2. **The secret key is encrypted** with AES-256-GCM using a server-side master password and stored in the database — the user never sees it.
3. **The user signs a message** with their own wallet (Phantom) that says "I authorize this public key to trade on my behalf with these limits."
4. The backend verifies the signature cryptographically and activates the session key.
5. When the bot trades, it decrypts the session key's secret and uses it to sign transactions with the user's delegated authority.

> **The user's actual private key never touches the server at any point.**

---

### Step-by-Step: Session Key Authorization Flow

#### Step 1 — User navigates to `/trading/automated`

The `AutomatedTradingPage` component renders. If the user has no active session key, they see a prompt to authorize the bot.

---

#### Step 2 — SessionKeyAuthorization component renders

`src/components/SessionKeyAuthorization.js` provides a form where the user configures:

| Setting              | Default           | Description                                       |
| -------------------- | ----------------- | ------------------------------------------------- |
| Session Name         | "Trading Session" | Label for this session                            |
| Description          | Optional          | Notes about this session                          |
| Expiration           | 24 hours          | 1h / 6h / 12h / 24h / 3d / 7d / 30d               |
| Can Trade            | ✅                | Allow buy/sell operations                         |
| Can Swap             | ✅                | Allow token swaps                                 |
| Can Stake            | ❌                | Allow staking (advanced, off by default)          |
| Can Transfer         | ❌                | Allow transfers (not recommended, off by default) |
| Max per Transaction  | $100              | USD cap per single trade                          |
| Daily Spending Limit | $1000             | USD cap rolling 24h                               |

---

#### Step 3 — Generate Session Key

User clicks **"Generate Session Key"**:

```
POST /api/session-keys/generate
Body: { walletAddress, expirationHours, permissions, name, description }
Auth: JWT cookie required
```

**Backend (`src/app/api/session-keys/generate/route.js`):**

1. Verifies JWT cookie → gets `userId`.
2. Checks/creates wallet association on the `User` document.
3. Calls `generateSessionKeypair()` → creates a fresh `Solana Keypair`.
4. Calls `encryptSecretKey(secretKey, masterPassword)` → AES-256-GCM encrypts the secret key using `SESSION_KEY_MASTER_PASSWORD` environment variable. Returns `{ encryptedData, iv, authTag }`.
5. Calls `calculateExpirationDate(expirationHours)` → computes `expiresAt`.
6. Calls `generateAuthorizationMessage(publicKey, expiresAt, permissions)` → generates a human-readable message like:

   ```
   Authorize Trading Session Key

   Session Key: <publicKey>
   Permissions: trade, swap
   Limits: Max per transaction: $100.00, Daily limit: $1000.00
   Expires: 2026-03-19T...

   By signing this message, you authorize this session key to execute
   trades on your behalf within the specified limits...
   ```

7. **Returns to the frontend**: `{ sessionKey: { publicKey, expiresAt, permissions, message }, pendingAuthorization: { encryptedData, iv, authTag } }`.
   - **Critically: the encrypted private key data is sent back temporarily** (as pending data, held in React state) — it is NOT stored in the DB yet. It only gets stored after the user's signature is verified.

**Frontend state update:**
The component saves this as `pendingSessionKey` and shows the authorization panel.

---

#### Step 4 — User Authorizes (Signs the Message)

User clicks **"Sign & Authorize"**:

```javascript
// In SessionKeyAuthorization.js
const encodedMessage = new TextEncoder().encode(message);
const { signature } = await window.solana.signMessage(encodedMessage, "utf8");
const signatureBase58 = bs58.encode(signature);
```

Phantom wallet popup appears asking the user to sign the message. They see exactly what they're authorizing. After approval:

```
POST /api/session-keys/authorize
Body: {
  walletAddress,
  publicKey,           // session key public key
  signature,           // base58-encoded Solana signature
  message,             // the exact message that was signed
  encryptedData,       // from pendingAuthorization
  iv,
  authTag,
  expiresAt,
  permissions,
  name,
  description
}
Auth: JWT cookie required
```

**Backend (`src/app/api/session-keys/authorize/route.js`):**

1. Verifies JWT cookie → `userId`.
2. Confirms the wallet belongs to this user (checks `user.wallets[]`).
3. **Cryptographic signature verification** using `tweetnacl`:
   ```javascript
   const isValid = nacl.sign.detached.verify(
     new TextEncoder().encode(message), // original message bytes
     bs58.decode(signature), // decoded signature
     new PublicKey(walletAddress).toBytes(), // user's actual wallet public key
   );
   ```
   If invalid → 400 error. This ensures only the real wallet owner can authorize.
4. Deactivates any existing active session key for this wallet (only one active key per wallet at a time).
5. Creates `SessionKey` document in MongoDB:
   ```javascript
   await SessionKey.create({
     userId,
     walletAddress: walletAddress.toLowerCase(),
     publicKey, // session keypair's public key
     encryptedPrivateKey: encryptedData, // AES-256-GCM encrypted
     iv,
     authTag,
     name,
     description,
     expiresAt,
     active: true,
     permissions: {
       canTrade,
       canSwap,
       canStake,
       canTransfer,
       maxTransactionAmount,
       dailySpendingLimit,
       allowedTokens,
     },
     auditLog: [
       { action: "created", timestamp, details: { walletAddress, signature } },
     ],
   });
   ```
6. Returns `{ success, sessionKey: { id, publicKey, walletAddress, expiresAt, permissions, name, createdAt } }` — **no sensitive data returned**.

**Frontend:** Shows success, calls `onSuccess(sessionKey)`. The `AutomatedTradingPage` switches to the "manage" tab.

---

### How the Bot Uses Session Keys to Trade

When the `TradingBotEngine` or `SessionBasedSwapper` needs to trade for a user:

```javascript
// In sessionKeyTrader.js — SessionKeyTrader constructor
const masterKey = getMasterEncryptionKey(); // reads SESSION_KEY_MASTER_PASSWORD from env
const decrypted = decryptSecretKey(
  sessionKey.encryptedPrivateKey,
  sessionKey.iv,
  sessionKey.authTag,
  masterKey,
);
this.keypair = Keypair.fromSecretKey(bs58.decode(decrypted));
```

This gives the bot a **live `Keypair`** (the session key, NOT the user's own wallet key) that was previously delegated trading authority. All Solana transactions are then signed with this keypair via Jupiter API quotes and swaps.

**Before every trade, the bot checks:**

- `sessionKey.isValid()` — both `active === true` AND `expiresAt > now`
- `sessionKey.canSpend(amount)` — checks per-transaction and daily spending limits
- `sessionKey.permissions.canTrade || canSwap`

---

### Session Key Lifecycle

```
[Generated & encrypted] → [User signs → Verified → Stored in DB as active]
    → [Bot trades using decrypted keypair] → [Usage tracked in usageStats + auditLog]
    → [Expires naturally (expiresAt)] OR [User manually revokes]
    → [active = false, auditLog entry added]
```

**Revoking a session key:**

```
POST /api/session-keys/revoke
Body: { sessionKeyId }
```

Sets `SessionKey.active = false` and logs the revocation.

**Listing session keys:**

```
GET /api/session-keys/list?walletAddress=...
```

Returns all session keys for the authenticated user, filtered optionally by wallet.

---

### Legacy Trading Permission (Pre-Session Key)

There is also a simpler, older `TradingPermission` model that stores a wallet signature as proof of consent. This is kept for backward compatibility but the session key system is the primary mechanism. The `AuthContext` exposes `tradingPermissions`, `fetchTradingPermissions`, and `revokeTradingPermission` for this legacy system.

---

## 13. Frontend Pages & Components

### Pages

| Route                | File                                | Description                                                             |
| -------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `/`                  | `src/app/page.js`                   | Landing page — hero, features, how-it-works, stats, pricing CTA         |
| `/dashboard`         | `src/app/dashboard/page.js`         | Main user dashboard — portfolio, token table, trading stats, bot widget |
| `/trading`           | `src/app/trading/page.js`           | Trading overview                                                        |
| `/trading/automated` | `src/app/trading/automated/page.js` | Session key creation, management, live monitor, bot control             |
| `/swap`              | `src/app/swap/page.js`              | Manual token swap via LiFi/Jupiter                                      |
| `/portfolio`         | `src/app/portfolio/page.js`         | Portfolio tracker                                                       |
| `/auth/login`        | `src/app/auth/login/page.js`        | Login form                                                              |
| `/auth/signup`       | `src/app/auth/signup/page.js`       | Registration form                                                       |
| `/otp`               | `src/app/otp/page.js`               | OTP verification step                                                   |
| `/settings`          | `src/app/settings/page.js`          | Account settings, trading settings                                      |
| `/profile`           | `src/app/profile/page.js`           | User profile                                                            |
| `/token/[address]`   | `src/app/token/page.js`             | Individual token detail page                                            |

### Key Components

#### `WalletConnect.js`

- Displays wallet address (truncated) + copy button + disconnect when connected.
- Shows "Connect Wallet" dropdown when disconnected.
- Detects installed wallets dynamically.

#### `SessionKeyAuthorization.js`

- The main "Authorize Bot" form.
- Two-phase: configure → generate key → sign with wallet → authorize.
- Handles both the generate API call and the sign+authorize API call.

#### `SessionKeyManager.js`

- Lists all active session keys for the connected wallet.
- Shows expiry countdown, permissions, usage stats.
- Revoke button per key.

#### `SessionKeyStatus.js`

- Compact inline indicator of session key health.
- Shows "Active", "Expiring soon", or "No active session".

#### `AutomatedTradingWidget.js`

- Dashboard card showing bot status.
- If no session key → prompt to enable.
- If active → shows trades count, daily volume, remaining limit, P&L, expiry bar.

#### `TradingBotControl.js`

- Start/stop bot buttons.
- Shows token monitor status + emergency sell status.
- Lists recent 10 trades.

#### `RealTimeTradingMonitor.js`

- Live feed of trading events via polling or WebSocket.

#### `AdvancedSwap.js`

- Advanced manual swap interface with slippage controls.

#### `ServiceInitializer.js`

- Client component that fires `POST /api/startup` once on app mount to initialize backend trading services.

Useful code:

```javascript
    this.mobulaKeys = [
      "05af5fe9-c6a2-4677-8491-fa1bea364fc1", // current one
      "2db058e9-dc03-4368-bc09-cf0c2adbcaa1",
      "50a7c029-1dcd-4713-9ee3-d74aaca5988e",
    ];

    // Moralis API Keys
    this.moralisKeys = [
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjBhOGYyNjUwLWEzODYtNGQzNC05MDIyLTJjOGQ3N2ZkODg0YSIsIm9yZ0lkIjoiNDU1OTY4IiwidXNlcklkIjoiNDY5MTMyIiwidHlwZUlkIjoiN2FmNmY3MTItMmJkNi00YTUxLThkNzctMjA2ZDk0ZTU5ZDdmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTA5NjY1ODcsImV4cCI6NDkwNjcyNjU4N30.razmcbOMMFJ87I-QipQuc-cMGP76D4ZcwqB-aZplYuY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhZWQ2OWY3LTQ4YjEtNGI0NC04NGY3LTVhMzIyNjAwYWJmZiIsIm9yZ0lkIjoiNDMyOTY2IiwidXNlcklkIjoiNDQ1Mzc5IiwidHlwZUlkIjoiOTgzYWE1OTYtYmE4Ny00NDMwLTgwZDgtNDU3MWU5ODkzOTA0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAyMzMzNjQsImV4cCI6NDg5NTk5MzM2NH0.adR5b9jUVAeVhWO893TlbdUbpJBelA2AU-TxLBRcxnw",
    ];



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




"use client";

import { useTheme } from "@/context/ThemeContext";
import { getZIndexClass } from "@/lib/utils/zIndexLayers";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function DexScreenerChart({
  pairAddress,
  chain = "solana",
  isOpen,
  onClose,
  tokenSymbol,
}) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      setLoading(true);

      // Simulate loading time for iframe
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !pairAddress) return null;

  const chartTheme = isDarkMode ? "dark" : "light";
  const embedUrl = `https://dexscreener.com/${chain}/${pairAddress}?embed=1&loadChartSettings=0&chartDefaultOnMobile=1&chartTheme=${chartTheme}&theme=${chartTheme}&chartStyle=1&chartType=usd&interval=15`;

  return (
    <div className={`fixed inset-0 ${getZIndexClass('CHART_MODAL')} flex items-center justify-center`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-7xl mx-4 h-[90vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">📈</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {tokenSymbol ? `${tokenSymbol} Chart` : "Token Chart"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Powered by DexScreener •{" "}
                {chain.charAt(0).toUpperCase() + chain.slice(1)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors duration-200 group"
            aria-label="Close chart"
          >
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        {/* Chart Container */}
        <div className="relative w-full h-[calc(100%-5rem)]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Loading chart data...
                </p>
              </div>
            </div>
          )}

          {/* DexScreener Embed */}
          <div className="w-full h-full">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                #dexscreener-embed {
                  position: relative;
                  width: 100%;
                  height: 100%;
                }
                @media(min-width: 1400px) {
                  #dexscreener-embed {
                    height: 100%;
                  }
                }
                #dexscreener-embed iframe {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  top: 0;
                  left: 0;
                  border: 0;
                  border-radius: 0 0 12px 12px;
                }
              `,
              }}
            />
            <div id="dexscreener-embed">
              <iframe
                src={embedUrl}
                allow="clipboard-write"
                title={`${tokenSymbol || "Token"} Chart`}
                onLoad={() => setLoading(false)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Real-time price data and charts</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

```
