# AbuBeast API Documentation

## Overview

The AbuBeast API is a RESTful API built with Next.js App Router that provides cryptocurrency trading, portfolio management, and token analysis functionality. The API supports both Ethereum and Solana blockchain interactions.

**Base URL**: `http://localhost:3001` (development) | `https://your-domain.com` (production)

## Authentication

### JWT Token Authentication

The API uses JWT tokens for authentication. Tokens are stored as HTTP-only cookies and include user information.

#### Token Structure
```json
{
  "userId": "string",
  "email": "string", 
  "name": "string",
  "iat": "number",
  "exp": "number"
}
```

---

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Minimum 8 characters
- Name: Required

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Error Responses:**
- `400` - Missing required fields / Invalid email format / Password too short
- `409` - User already exists
- `500` - Server error

---

### POST /api/auth/login

Authenticate a user and return JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string", 
    "name": "string"
  }
}
```

**Sets HTTP-only cookie:** `token=<jwt_token>`

**Error Responses:**
- `400` - Email and password required
- `401` - Invalid credentials
- `500` - Authentication failed

---

### POST /api/auth/logout

Logout user by clearing authentication cookie.

**Success Response (200):**
```json
{
  "success": true
}
```

---

### GET /api/auth/me

Get current authenticated user information.

**Headers Required:**
```
Cookie: token=<jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "string",
    "userId": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Error Responses:**
- `401` - Not authenticated / Invalid token
- `500` - Authentication check failed

---

## User & Wallet Management

### POST /api/user/wallet

Add a wallet address to the user's account.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "walletAddress": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wallet address added successfully",
  "walletAddresses": ["string"]
}
```

**Error Responses:**
- `401` - Unauthorized / Invalid token
- `404` - User not found
- `500` - Failed to add wallet address

---

### DELETE /api/user/wallet

Remove a wallet address from the user's account.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "walletAddress": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wallet disconnected successfully"
}
```

**Error Responses:**
- `400` - Wallet address required
- `401` - Unauthorized
- `404` - User not found / Wallet not found
- `500` - Failed to disconnect wallet

---

## Wallet Operations

### POST /api/wallet/verify-signature

Verify wallet signature for authentication.

**Request Body:**
```json
{
  "address": "string",
  "message": "string", 
  "signature": "string",
  "walletType": "ethereum|solana"
}
```

**Success Response (200):**
```json
{
  "verified": true,
  "address": "string"
}
```

**Error Responses:**
- `400` - Address, message, and signature are required
- `500` - Failed to verify signature

---

### POST /api/wallet/trading-permission

Grant trading permission for a wallet.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "walletAddress": "string",
  "walletType": "string",
  "signature": "string",
  "message": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Trading permission saved successfully"
}
```

---

### GET /api/wallet/trading-permission

Get all trading permissions for the authenticated user.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "permissions": [
    {
      "userId": "string",
      "walletAddress": "string",
      "walletType": "string",
      "active": true,
      "tradingStrategy": "moderate",
      "customSettings": {},
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

---

### POST /api/wallet/trading-settings

Update trading settings for a wallet.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "walletAddress": "string",
  "settings": {
    "strategy": "conservative|moderate|aggressive|custom",
    "allowedTokens": "all|verified|trending|whitelisted", 
    "maxInvestmentPerToken": "number",
    "maxDailyInvestment": "number",
    "stopLossPercentage": "number",
    "takeProfitPercentage": "number"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Trading settings updated successfully"
}
```

---

### GET /api/wallet/trading-settings

Get trading settings for a wallet.

**Authentication Required:** Yes

**Query Parameters:**
- `walletAddress` (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "settings": {
    "strategy": "string",
    "allowedTokens": "string",
    "maxInvestmentPerToken": "number",
    "maxDailyInvestment": "number", 
    "stopLossPercentage": "number",
    "takeProfitPercentage": "number"
  }
}
```

---

## Portfolio Management

### GET /api/portfolio

Get portfolio data for a wallet.

**Authentication Required:** Yes

**Query Parameters:**
- `wallet` (string, required) - Wallet address
- `type` (string, optional) - Wallet type: "ethereum" (default) | "solana"

**Success Response (200):**
```json
{
  "success": true,
  "portfolio": {
    "totalValue": "number",
    "totalValueUsd": "number",
    "tokens": [
      {
        "address": "string",
        "symbol": "string",
        "name": "string",
        "balance": "string",
        "balanceUsd": "number",
        "price": "number",
        "change24h": "number"
      }
    ],
    "historicalData": [
      {
        "timestamp": "number",
        "value": "number"
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Wallet address is required
- `401` - Unauthorized
- `500` - Failed to fetch portfolio data

---

## Token Information

### GET /api/tokens

Get list of tokens with optional filtering.

**Query Parameters:**
- `since` (timestamp, optional) - Get tokens added since this timestamp
- `limit` (number, optional) - Limit results (default: 100)

**Success Response (200):**
```json
{
  "success": true,
  "tokens": [
    {
      "_id": "string",
      "mint_address": "string",
      "name": "string",
      "symbol": "string",
      "marketData": {
        "price": "number",
        "market_cap": "number",
        "volume": "number",
        "change_24h": "number"
      },
      "processed": true,
      "added_at": "string"
    }
  ],
  "timestamp": "number"
}
```

---

### POST /api/tokens

Add new tokens to the database (Admin endpoint).

**Request Body:**
```json
[
  {
    "mint_address": "string",
    "name": "string",
    "symbol": "string"
  }
]
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "string",
  "processed": "number",
  "newTokens": "number"
}
```

---

### GET /api/tokens/[address]

Get detailed information for a specific token.

**Path Parameters:**
- `address` (string, required) - Token contract address

**Success Response (200):**
```json
{
  "success": true,
  "token": {
    "_id": "string",
    "mint_address": "string",
    "name": "string",
    "symbol": "string",
    "marketData": {
      "price": "number",
      "market_cap": "number",
      "volume": "number",
      "change_24h": "number",
      "liquidity": "number"
    },
    "processed": true,
    "added_at": "string"
  }
}
```

**Error Responses:**
- `400` - Token address is required
- `404` - Token not found
- `500` - Failed to fetch token data

---

### GET /api/tokens/[address]/ohlcv

Get OHLCV (candlestick) data for a token.

**Path Parameters:**
- `address` (string, required) - Token contract address

**Query Parameters:**
- `period` (string, optional) - Time period: "1min", "5min", "15min", "1h", "4h", "1d", "1w", "1M" (default: "1h")

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "number",
      "open": "number",
      "high": "number", 
      "low": "number",
      "close": "number",
      "volume": "number"
    }
  ]
}
```

---

### GET /api/tokens/[address]/holders

Get token holder information.

**Path Parameters:**
- `address` (string, required) - Token contract address

**Query Parameters:**
- `limit` (number, optional) - Limit results (default: 20)
- `offset` (number, optional) - Offset for pagination (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "holders": [
    {
      "address": "string",
      "balance": "string",
      "percentage": "number"
    }
  ],
  "total_count": "number"
}
```

---

### GET /api/tokens/[address]/transactions

Get recent transactions for a token.

**Path Parameters:**
- `address` (string, required) - Token contract address

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "hash": "string",
      "timestamp": "number",
      "type": "buy|sell",
      "amount": "string",
      "amountUsd": "number",
      "price": "number",
      "sender": "string"
    }
  ]
}
```

---

### POST /api/tokens/enrichment

Trigger data enrichment for unprocessed tokens (Admin endpoint).

**Success Response (200):**
```json
{
  "success": true,
  "message": "string",
  "processedCount": "number"
}
```

---

### POST /api/tokens/analyze

Trigger token analysis and automated trading (Admin endpoint).

**Authentication Required:** Yes (Admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "string",
  "processedCount": "number"
}
```

---

### GET /api/tokens/analyze

Get token analysis statistics (Admin endpoint).

**Authentication Required:** Yes (Admin)

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": "number",
    "analyzed": "number", 
    "pending": "number",
    "recentTokens": [
      {
        "mint_address": "string",
        "name": "string",
        "symbol": "string",
        "analyzed": true,
        "analyzed_at": "string",
        "added_at": "string"
      }
    ]
  }
}
```

---

## Swap Management

### POST /api/swaps

Save a completed swap transaction.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "fromToken": "string",
  "toToken": "string", 
  "fromChain": "string",
  "toChain": "string",
  "fromAmount": "string",
  "toAmount": "string",
  "txHash": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Swap transaction saved",
  "swapId": "string"
}
```

**Error Responses:**
- `400` - Missing required swap details
- `401` - Unauthorized
- `500` - Failed to save swap transaction

---

### GET /api/swaps

Get user's swap history.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "swaps": [
    {
      "_id": "string",
      "userId": "string",
      "fromToken": "string",
      "toToken": "string",
      "fromChain": "string", 
      "toChain": "string",
      "fromAmount": "string",
      "toAmount": "string",
      "txHash": "string",
      "status": "completed",
      "timestamp": "string"
    }
  ]
}
```

---

## Internal API Endpoints

These endpoints require an internal API key (`X-API-Key` header) and are used for automated trading and monitoring.

### GET /api/internal/trading-permissions

Check trading permissions for a user and wallet.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Query Parameters:**
- `userId` (string, required)
- `wallet` (string, required)

**Success Response (200):**
```json
{
  "hasPermission": true,
  "permission": {
    "userId": "string",
    "walletAddress": "string",
    "active": true,
    "tradingStrategy": "string",
    "customSettings": {}
  }
}
```

---

### GET /api/internal/trading-settings

Get trading settings for a user and wallet.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Query Parameters:**
- `userId` (string, required)
- `wallet` (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "settings": {
    "strategy": "string",
    "maxInvestmentPerToken": "number",
    "maxDailyInvestment": "number",
    "stopLossPercentage": "number",
    "takeProfitPercentage": "number",
    "allowedTokens": "string",
    "slippageTolerance": "number"
  }
}
```

---

### POST /api/internal/trade-limits

Check if a trade would exceed daily limits.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Request Body:**
```json
{
  "userId": "string",
  "walletAddress": "string",
  "amountUSD": "number"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "currentSpent": "number",
  "maxLimit": "number",
  "remaining": "number",
  "newTransactionAmount": "number",
  "willExceedLimit": false
}
```

---

### POST /api/internal/trade-logs

Log a completed trade.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Request Body:**
```json
{
  "walletAddress": "string",
  "txHash": "string",
  "fromToken": "string",
  "toToken": "string",
  "fromAmount": "string",
  "toAmount": "string",
  "expectedToAmount": "string",
  "status": "string",
  "timestamp": "string",
  "chainId": "string",
  "gasUsed": "string",
  "gasCostUSD": "number"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "logId": "string"
}
```

---

### GET /api/internal/trade-logs

Get trade logs for a user or wallet.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Query Parameters:**
- `userId` (string, optional)
- `wallet` (string, optional)

**Success Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "string",
      "userId": "string",
      "walletAddress": "string",
      "txHash": "string",
      "fromToken": "string",
      "toToken": "string",
      "fromAmount": "string",
      "toAmount": "string",
      "status": "string",
      "timestamp": "string"
    }
  ]
}
```

---

### POST /api/internal/trade-orders

Create a new trade order.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Request Body:**
```json
{
  "userId": "string",
  "walletAddress": "string",
  "tokenAddress": "string",
  "orderType": "string",
  "targetPrice": "number",
  "amount": "string",
  "triggerCondition": "string",
  "expiresAt": "string",
  "chainId": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "orderId": "string"
}
```

---

### GET /api/internal/trade-orders

Get active trade orders.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Query Parameters:**
- `userId` (string, optional)
- `wallet` (string, optional)
- `status` (string, optional, default: "active")

**Success Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "string",
      "userId": "string",
      "walletAddress": "string",
      "tokenAddress": "string",
      "orderType": "string",
      "targetPrice": "number",
      "amount": "string",
      "status": "string",
      "createdAt": "string"
    }
  ]
}
```

---

### POST /api/internal/trade-errors

Log a trade error.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Request Body:**
```json
{
  "userId": "string",
  "walletAddress": "string",
  "error": "string",
  "tradeInfo": {},
  "timestamp": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "errorId": "string"
}
```

---

### GET /api/internal/trade-errors

Get trade errors for monitoring.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Query Parameters:**
- `userId` (string, optional)
- `wallet` (string, optional)
- `limit` (number, optional, default: 100)

**Success Response (200):**
```json
{
  "success": true,
  "errors": [
    {
      "_id": "string",
      "userId": "string", 
      "walletAddress": "string",
      "error": "string",
      "tradeInfo": {},
      "timestamp": "string"
    }
  ]
}
```

---

### POST /api/internal/get-route

Get trading route information using LiFi API.

**Headers Required:**
```
X-API-Key: <internal_api_key>
```

**Request Body:**
```json
{
  "fromChainId": "string",
  "toChainId": "string",
  "fromTokenAddress": "string",
  "toTokenAddress": "string",
  "fromAddress": "string",
  "fromAmount": "string",
  "slippage": "number"
}
```

**Success Response (200):**
```json
{
  "routes": [],
  "estimate": {}
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "string",
  "details": "string (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `500` - Internal Server Error

---

## Rate Limiting

- No explicit rate limiting is currently implemented
- Consider implementing rate limiting for production use

---

## CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: Configure in environment variables

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:** Content-Type, Authorization

---

## Data Models

### User
```javascript
{
  email: String (required, unique),
  name: String (required),
  password: String (required, min 8 chars),
  wallets: [{
    type: String (enum: metamask, phantom, coinbase, other),
    address: String (required),
    addedAt: Date,
    updatedAt: Date
  }],
  createdAt: Date
}
```

### TradingPermission
```javascript
{
  userId: ObjectId,
  walletAddress: String,
  walletType: String,
  active: Boolean,
  tradingStrategy: String,
  customSettings: Object,
  signature: String,
  message: String,
  auditLog: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Token
```javascript
{
  mint_address: String (unique),
  name: String,
  symbol: String,
  marketData: {
    price: Number,
    market_cap: Number,
    volume: Number,
    change_24h: Number,
    liquidity: Number
  },
  processed: Boolean,
  analyzed: Boolean,
  added_at: Date,
  analyzed_at: Date
}
```

### SwapHistory
```javascript
{
  userId: ObjectId,
  fromToken: String,
  toToken: String,
  fromChain: String,
  toChain: String,
  fromAmount: String,
  toAmount: String,
  txHash: String,
  status: String,
  timestamp: Date
}
```

---

## Environment Variables

### Required Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/abubeast

# Authentication  
JWT_SECRET=your-secret-key

# External APIs
MOBULA_API_KEY=your-mobula-api-key

# Internal API Security
INTERNAL_API_KEY=your-internal-api-key

# Environment
NODE_ENV=development|production
```

---

## Testing

### Authentication Tests

Run authentication tests:
```bash
npm test -- __tests__/auth-core.test.js
npm test -- __tests__/auth-e2e.test.js
```

### API Format Tests

```bash
npm test -- __tests__/api-format.test.js
```

---

## Security Considerations

1. **Authentication**: JWT tokens are stored as HTTP-only cookies
2. **Password Security**: Passwords are hashed using bcrypt with 12 rounds
3. **Input Validation**: All endpoints validate required fields and formats
4. **CORS**: Configured for allowed origins only
5. **Internal APIs**: Protected with API key authentication
6. **Signature Verification**: Wallet signatures are verified for trading permissions

---

## Development Notes

- Built with Next.js 15.3.2 App Router
- Uses MongoDB with Mongoose ODM
- Supports both Ethereum and Solana wallets
- Integration with LiFi for cross-chain swaps
- Real-time token data from Mobula API
- Automated trading capabilities with configurable risk management

---

*Last Updated: June 29, 2025*
