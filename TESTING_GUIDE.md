# TESTING GUIDE - Complete Trading System

## Overview
This guide provides step-by-step instructions for testing all integrated trading systems.

## Prerequisites

### 1. Environment Setup
Ensure your `.env.local` has:
```bash
SESSION_KEY_ENCRYPTION_SECRET=your-strong-secret-key
HELIUS_API_KEY=your-helius-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WEBHOOK_SECRET=your-webhook-secret
AUTO_START_TRADING_BOT=true
```

### 2. Database Connection
Verify MongoDB is running and accessible.

### 3. Server Running
```bash
npm run dev
```

---

## Test Suite 1: Session Key Management

### Test 1.1: Generate Session Key
```bash
curl -X POST http://localhost:3000/api/session-keys/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "permissions": {
      "canTrade": true,
      "canSwap": true,
      "canTransfer": false
    },
    "dailyLimit": 10,
    "perTransactionLimit": 1,
    "expiresIn": 2592000000
  }'
```

**Expected Response:**
```json
{
  "sessionKey": "SESSION_PUBLIC_KEY",
  "message": "AUTHORIZATION_MESSAGE_TO_SIGN",
  "expiresAt": "2026-02-05T..."
}
```

**Verify:**
- [ ] Response includes sessionKey
- [ ] Response includes authorization message
- [ ] Expiration date is correct

### Test 1.2: Authorize Session Key
```bash
# First, sign the message with your wallet (use Phantom/Solflare)
# Then:

curl -X POST http://localhost:3000/api/session-keys/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "sessionKey": "SESSION_PUBLIC_KEY",
    "signature": "SIGNED_MESSAGE",
    "walletAddress": "YOUR_WALLET_ADDRESS"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session key authorized successfully"
}
```

**Verify:**
- [ ] Authorization succeeds
- [ ] Session key is now active in database
- [ ] Signature validation works

### Test 1.3: List Session Keys
```bash
curl -X GET http://localhost:3000/api/session-keys/list \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "sessionKeys": [
    {
      "publicKey": "...",
      "active": true,
      "permissions": {...},
      "expiresAt": "...",
      "usageStats": {...}
    }
  ]
}
```

**Verify:**
- [ ] Lists all user's session keys
- [ ] Shows correct permissions
- [ ] Shows usage statistics

### Test 1.4: Revoke Session Key
```bash
curl -X POST http://localhost:3000/api/session-keys/revoke \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "sessionKey": "SESSION_PUBLIC_KEY"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session key revoked successfully"
}
```

**Verify:**
- [ ] Session key is marked as inactive
- [ ] Cannot be used for trades anymore

---

## Test Suite 2: Bot Configuration

### Test 2.1: Get Bot Status
```bash
curl -X GET http://localhost:3000/api/trading/bot/status \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "isRunning": false,
  "activeSessionKeys": 0,
  "monitoredTokens": 0,
  "todayStats": {...}
}
```

**Verify:**
- [ ] Returns current bot state
- [ ] Shows active session keys count
- [ ] Shows monitored tokens count

### Test 2.2: Update Bot Settings
```bash
curl -X PUT http://localhost:3000/api/trading/bot/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "botEnabled": false,
    "tokenFilters": {
      "minLiquidity": 1000,
      "maxMarketCap": 1000000,
      "minLpBurn": 50
    },
    "perTradeLimits": {
      "minInvestment": 0.01,
      "maxInvestment": 0.5,
      "slippage": 5
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

**Verify:**
- [ ] Settings are saved to database
- [ ] Bot respects new settings
- [ ] Validation works for invalid values

### Test 2.3: Start Bot
```bash
curl -X POST http://localhost:3000/api/trading/bot/start \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Trading bot started successfully"
}
```

**Verify:**
- [ ] Bot status changes to running
- [ ] Console shows bot startup logs
- [ ] Services are initialized

### Test 2.4: Stop Bot
```bash
curl -X POST http://localhost:3000/api/trading/bot/stop \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Trading bot stopped successfully"
}
```

**Verify:**
- [ ] Bot status changes to stopped
- [ ] Monitoring stops
- [ ] No new trades execute

---

## Test Suite 3: Manual Trading

### Test 3.1: Buy Token
```bash
curl -X POST http://localhost:3000/api/trading/swapper/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amountInSol": 0.01,
    "slippage": 5,
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "tokenData": {
      "name": "USD Coin",
      "symbol": "USDC"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "TRANSACTION_SIGNATURE",
  "amountOut": 10.5,
  "tradeLogId": "TRADE_LOG_ID"
}
```

**Verify:**
- [ ] Transaction succeeds on blockchain
- [ ] Token balance increases in wallet
- [ ] Trade is logged in database
- [ ] Session key usage is recorded

### Test 3.2: Sell Token
```bash
curl -X POST http://localhost:3000/api/trading/swapper/sell \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "sellPercentage": 100,
    "walletAddress": "YOUR_WALLET_ADDRESS"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "TRANSACTION_SIGNATURE",
  "amountSold": 10.5,
  "solReceived": 0.0095
}
```

**Verify:**
- [ ] Transaction succeeds on blockchain
- [ ] SOL balance increases
- [ ] Token balance decreases
- [ ] Trade is logged with profit/loss

### Test 3.3: Generic Swap
```bash
curl -X POST http://localhost:3000/api/trading/swap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 0.01,
    "slippage": 5,
    "walletAddress": "YOUR_WALLET_ADDRESS"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "TRANSACTION_SIGNATURE",
  "amountOut": 10.5
}
```

**Verify:**
- [ ] Swap executes correctly
- [ ] Both balances update
- [ ] Jupiter routing works

---

## Test Suite 4: Auto-Sell System

### Test 4.1: Configure Auto-Sell
```bash
curl -X PUT http://localhost:3000/api/trading/autosell/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "enabled": true,
    "triggers": {
      "devSell": {
        "enabled": true,
        "threshold": 10
      },
      "stopLoss": {
        "enabled": true,
        "percentage": -20
      },
      "takeProfit": {
        "enabled": true,
        "percentage": 50
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Auto-sell settings updated successfully"
}
```

**Verify:**
- [ ] Settings saved correctly
- [ ] Triggers are active
- [ ] Percentages are validated

### Test 4.2: Get Auto-Sell Status
```bash
curl -X GET http://localhost:3000/api/trading/autosell/status \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "autoSellEnabled": true,
  "triggers": {...},
  "engineStatus": {...}
}
```

**Verify:**
- [ ] Returns current configuration
- [ ] Shows engine status
- [ ] Shows monitored tokens

### Test 4.3: Manual Auto-Sell Execution
```bash
curl -X POST http://localhost:3000/api/trading/autosell/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "tokenMint": "TOKEN_ADDRESS",
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "triggerType": "manual",
    "sellPercentage": 100
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "TRANSACTION_SIGNATURE",
  "amountSold": 1000,
  "solReceived": 0.5
}
```

**Verify:**
- [ ] Sell executes immediately
- [ ] Uses correct percentage
- [ ] Records trigger type
- [ ] Logs to history

### Test 4.4: Get Auto-Sell History
```bash
curl -X GET http://localhost:3000/api/trading/autosell/history?limit=10 \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "history": [...],
  "count": 5
}
```

**Verify:**
- [ ] Shows recent auto-sells
- [ ] Includes trigger types
- [ ] Shows profit/loss
- [ ] Sorted by date

---

## Test Suite 5: Token Discovery

### Test 5.1: Configure Discovery
```bash
curl -X PUT http://localhost:3000/api/trading/discovery/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "enabled": true,
    "tokenFilters": {
      "minLiquidity": 1000,
      "maxMarketCap": 500000,
      "minLpBurn": 80,
      "requireNoMintAuthority": true,
      "requireNoFreezeAuthority": true
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Discovery settings updated successfully"
}
```

**Verify:**
- [ ] Filters are saved
- [ ] Discovery service respects filters
- [ ] Only matching tokens are processed

### Test 5.2: Get Recent Tokens
```bash
curl -X GET http://localhost:3000/api/trading/discovery/recent?limit=20 \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "tokens": [
    {
      "address": "...",
      "name": "...",
      "symbol": "...",
      "liquidity": 5000,
      "marketCap": 100000,
      "createdAt": "..."
    }
  ]
}
```

**Verify:**
- [ ] Returns discovered tokens
- [ ] Sorted by date
- [ ] Includes all metadata
- [ ] Respects limit parameter

### Test 5.3: Get Token Details
```bash
curl -X GET "http://localhost:3000/api/trading/discovery/token?address=TOKEN_ADDRESS" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "token": {
    "address": "...",
    "name": "...",
    "symbol": "...",
    "price": 0.00001,
    "liquidity": 5000,
    "marketCap": 100000,
    "security": {...}
  }
}
```

**Verify:**
- [ ] Returns detailed token info
- [ ] Includes security data
- [ ] Shows holder information
- [ ] Current price data

---

## Test Suite 6: Monitoring

### Test 6.1: Add Token to Monitor
```bash
curl -X POST http://localhost:3000/api/trading/monitor/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "token_mint": "TOKEN_ADDRESS",
    "triggers": {
      "devSell": true,
      "whaleSell": true,
      "stopLoss": -20,
      "takeProfit": 50
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token added to monitoring"
}
```

**Verify:**
- [ ] Token is monitored
- [ ] Triggers are set
- [ ] WebSocket connection established
- [ ] Events are detected

### Test 6.2: List Monitored Tokens
```bash
curl -X GET http://localhost:3000/api/trading/monitor/list \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "tokens": [
    {
      "tokenMint": "...",
      "triggers": {...},
      "addedAt": "..."
    }
  ]
}
```

**Verify:**
- [ ] Lists all monitored tokens
- [ ] Shows triggers for each
- [ ] Shows monitoring status

### Test 6.3: Remove Token from Monitoring
```bash
curl -X DELETE "http://localhost:3000/api/trading/monitor/remove?token_mint=TOKEN_ADDRESS" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token removed from monitoring"
}
```

**Verify:**
- [ ] Token monitoring stops
- [ ] WebSocket connection closes
- [ ] No more events processed

---

## Test Suite 7: Webhooks (External Systems)

### Test 7.1: New Token Webhook
```bash
curl -X POST http://localhost:3000/api/trading/webhook/new-token \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_WEBHOOK_SECRET" \
  -d '{
    "address": "NEW_TOKEN_ADDRESS",
    "name": "New Token",
    "symbol": "NEWT",
    "price": 0.00001,
    "liquidity": 5000,
    "marketCap": 100000,
    "lpBurn": "80",
    "mintAuthority": false,
    "freezeAuthority": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token received and queued for processing"
}
```

**Verify:**
- [ ] Webhook secret is validated
- [ ] Token is processed by bot
- [ ] Filters are applied
- [ ] Buy executes if eligible

### Test 7.2: Emergency Webhook
```bash
curl -X POST http://localhost:3000/api/trading/webhook/emergency \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_WEBHOOK_SECRET" \
  -d '{
    "tokenMint": "TOKEN_ADDRESS",
    "eventType": "dev_sell",
    "eventData": {
      "walletAddress": "DEV_WALLET",
      "percentSold": 15,
      "amountSold": 1000000
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Emergency event processed"
}
```

**Verify:**
- [ ] Event is processed immediately
- [ ] Auto-sells are triggered
- [ ] All affected users are handled
- [ ] Events are logged

---

## Test Suite 8: Trade History

### Test 8.1: Get Trade History
```bash
curl -X GET "http://localhost:3000/api/trading/history?limit=50&type=all" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "trades": [...],
  "total": 25,
  "stats": {
    "totalTrades": 25,
    "totalProfit": 0.5,
    "winRate": 60
  }
}
```

**Verify:**
- [ ] Shows all trades
- [ ] Includes buy and sell
- [ ] Calculates profit/loss
- [ ] Shows win rate

---

## Integration Tests

### Integration Test 1: Full Automated Flow
1. Configure bot with filters
2. Start bot
3. Simulate new token (via webhook)
4. Verify bot buys token
5. Add token to monitoring
6. Simulate emergency event
7. Verify auto-sell executes
8. Check trade history
9. Verify profit/loss calculation

### Integration Test 2: Multi-User Scenario
1. Create session keys for multiple users
2. Configure different settings for each
3. Send new token webhook
4. Verify each user trades according to their settings
5. Check that trades don't interfere
6. Verify separate trade logs

### Integration Test 3: Limit Testing
1. Set daily limit to 1 SOL
2. Execute multiple trades
3. Verify limit is enforced
4. Try to exceed limit
5. Verify rejection
6. Check next day reset

---

## Performance Tests

### Performance Test 1: Concurrent Trades
- Send 10 token webhooks simultaneously
- Verify queue management
- Check that max concurrent trades is respected
- Monitor memory usage

### Performance Test 2: Long-Running Monitoring
- Add 50 tokens to monitoring
- Run for 24 hours
- Check for memory leaks
- Verify WebSocket stability

---

## Error Handling Tests

### Error Test 1: Invalid Session Key
- Try to trade with revoked session key
- Expect: 403 Forbidden

### Error Test 2: Insufficient Balance
- Try to buy with insufficient SOL
- Expect: Error message about balance

### Error Test 3: Exceeded Limits
- Try to exceed daily limit
- Expect: Rejection with limit info

### Error Test 4: Invalid Token
- Try to trade non-existent token
- Expect: Error about invalid token

---

## Security Tests

### Security Test 1: Webhook Secret
- Call webhook without secret
- Expect: 401 Unauthorized

### Security Test 2: Session Expiration
- Use expired session key
- Expect: Session key no longer valid error

### Security Test 3: Permission Enforcement
- Try action without permission
- Expect: Permission denied error

---

## Checklist Summary

- [ ] All Session Key tests pass
- [ ] All Bot Configuration tests pass
- [ ] All Manual Trading tests pass
- [ ] All Auto-Sell tests pass
- [ ] All Token Discovery tests pass
- [ ] All Monitoring tests pass
- [ ] All Webhook tests pass
- [ ] All Trade History tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Error handling tests pass
- [ ] Security tests pass

---

## Test Result Documentation

Record your test results:

```
Test Date: _______________
Tester: _______________

Tests Passed: ___ / ___
Tests Failed: ___
Critical Issues: ___
Minor Issues: ___

Notes:
_______________________________
_______________________________
```

---

**After all tests pass, the system is ready for production! 🎉**
