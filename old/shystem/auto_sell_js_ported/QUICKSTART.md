# 🚀 Quick Start Guide - Auto-Sell Engine (JavaScript)

This guide will help you get the Auto-Sell Engine up and running in minutes.

---

## 📋 Prerequisites

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Solana wallet** with private key
- **RPC endpoint** (Helius, QuickNode, or public)
- **(Optional)** Shyft API key for webhook monitoring

---

## ⚡ Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd auto_sell_js_ported
npm install
```

### 2. Create Configuration

Create a `.env` file in the project root:

```env
# === REQUIRED CONFIGURATION ===

# Solana RPC endpoint (replace with your Helius/QuickNode URL)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Solana WebSocket endpoint
SOLANA_WSS_URL=wss://api.mainnet-beta.solana.com

# Your wallet private key (base58 encoded)
# ⚠️ KEEP THIS SECRET! Never commit to git!
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# === OPTIONAL CONFIGURATION ===

# Network (mainnet-beta, devnet, testnet)
SOLANA_NETWORK=mainnet-beta

# Trading parameters
SLIPPAGE_BPS=50                  # 0.5% slippage
JITO_TIP_LAMPORTS=100000         # 0.0001 SOL tip
MAX_SELL_RETRIES=3               # Retry failed sells

# Server settings
SERVER_PORT=3000
CALLBACK_URL=http://localhost:3000/webhook/shyft

# Monitoring limits
MAX_MONITORED_TOKENS=100

# Data directory
DATA_DIR=./data

# Stream provider (WEBSOCKET, LASERSTREAM, or YELLOWSTONE)
STREAM_PROVIDER=WEBSOCKET

# Shyft webhooks (optional but recommended)
SHYFT_API_KEY=your_shyft_api_key_here
```

### 3. Start the Engine

```bash
npm start
```

You should see:

```
================================================================================
🚀 AUTO-SELL ENGINE STARTING...
================================================================================
✅ Configuration loaded successfully
✅ File logger initialized
✅ Auto-sell engine initialized
✅ Unified token monitor initialized
✅ Token monitoring started
✅ HTTP server listening on http://0.0.0.0:3000
================================================================================
✅ AUTO-SELL ENGINE IS RUNNING
================================================================================
```

---

## 🎯 Basic Usage

### Add a Token to Monitor

```bash
curl -X POST http://localhost:3000/monitor/add \
  -H "Content-Type: application/json" \
  -d '{
    "token_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "token_pair_addr": "optional_pair_address",
    "liquidity_pool": "optional_pool_address"
  }'
```

### Check Monitored Tokens

```bash
curl http://localhost:3000/monitor/tokens
```

### Remove a Token

```bash
curl -X DELETE http://localhost:3000/monitor/remove/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Check Health

```bash
curl http://localhost:3000/health
```

---

## 🔧 Configuration Details

### Getting Your Private Key

**From Phantom/Solflare:**

1. Export your private key (base58 format)
2. Add to `.env` as `SOLANA_PRIVATE_KEY`

**From CLI wallet:**

```bash
# Convert JSON keypair to base58
node -e "console.log(require('bs58').encode(Buffer.from(require('./keypair.json'))))"
```

### RPC Endpoints

**Recommended providers:**

- **Helius** - [helius.dev](https://helius.dev) (Best for production)
- **QuickNode** - [quicknode.com](https://quicknode.com)
- **Alchemy** - [alchemy.com](https://www.alchemy.com)
- **Public** - `https://api.mainnet-beta.solana.com` (Rate limited)

**Format:**

```env
SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY
SOLANA_WSS_URL=wss://rpc.helius.xyz/?api-key=YOUR_KEY
```

### Shyft Webhooks (Optional)

Get an API key from [shyft.to](https://shyft.to)

```env
SHYFT_API_KEY=your_key_here
CALLBACK_URL=https://your-domain.com/webhook/shyft
```

**Benefits:**

- Real-time transaction notifications
- No WebSocket overhead
- Automatic retry handling

---

## 📊 Monitoring & Logs

### Log Files

All logs are stored in `data/logs/`:

- **`token_events.jsonl`** - Token additions/removals
- **`sell_attempts.jsonl`** - Sell execution logs
- **`events_detected.jsonl`** - Trigger detections
- **`system_events.jsonl`** - System events

### View Recent Logs

```bash
# Last 10 token additions
tail -n 10 data/logs/token_events.jsonl

# Last 10 sell attempts
tail -n 10 data/logs/sell_attempts.jsonl

# Follow system events in real-time
tail -f data/logs/system_events.jsonl
```

### API-Based Monitoring

```bash
# Get sell history
curl http://localhost:3000/history/sells

# Get triggered events
curl http://localhost:3000/history/triggered_events

# Get system events
curl http://localhost:3000/history/system_events
```

---

## 🎮 Common Operations

### Development Mode (Hot Reload)

```bash
npm run dev
```

Changes to `.js` files will automatically restart the server.

### Production Deployment

```bash
# Using PM2
npm install -g pm2
pm2 start index.js --name auto-sell-engine

# View logs
pm2 logs auto-sell-engine

# Monitor
pm2 monit

# Restart
pm2 restart auto-sell-engine

# Stop
pm2 stop auto-sell-engine
```

### Graceful Shutdown

Press `Ctrl+C` or send SIGTERM:

```bash
kill -TERM $(pgrep -f "node index.js")
```

The engine will:

1. Stop HTTP server
2. Close all WebSocket connections
3. Save watchlist
4. Log final statistics

---

## 🔐 Security Best Practices

### 1. **Protect Your Private Key**

```bash
# Never commit .env
echo ".env" >> .gitignore

# Restrict file permissions
chmod 600 .env
```

### 2. **Use Environment Variables**

For production, use environment variables instead of `.env`:

```bash
export SOLANA_PRIVATE_KEY="your_key"
export SOLANA_RPC_URL="your_rpc"
npm start
```

### 3. **Firewall Rules**

Only expose necessary ports:

```bash
# Allow only local connections
SERVER_PORT=3000
# Or bind to localhost: 127.0.0.1:3000
```

### 4. **Separate Trading Wallet**

Use a dedicated wallet with limited funds for auto-selling.

---

## 🐛 Troubleshooting

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Connection refused" to RPC

- Check your `SOLANA_RPC_URL`
- Verify API key if using paid service
- Test with curl: `curl $SOLANA_RPC_URL`

### "Private key invalid"

- Ensure key is base58 encoded (not JSON array)
- No extra spaces or newlines
- Must be 88 characters long

### "EADDRINUSE" (Port in use)

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill $(lsof -ti:3000)

# Or change port
SERVER_PORT=3001 npm start
```

### WebSocket disconnects

- Use a reliable RPC provider (Helius, QuickNode)
- Check network stability
- Monitor reconnection attempts in logs

---

## 📈 Performance Tips

### 1. **Use Premium RPC**

Public endpoints are rate-limited. Use:

- Helius (recommended)
- QuickNode
- Alchemy

### 2. **Optimize Slippage**

```env
# Lower slippage = better prices, higher failure rate
SLIPPAGE_BPS=50   # 0.5% (recommended)

# Higher slippage = worse prices, lower failure rate
SLIPPAGE_BPS=300  # 3%
```

### 3. **Jito Tips**

```env
# Higher tips = faster execution
JITO_TIP_LAMPORTS=100000   # 0.0001 SOL (normal)
JITO_TIP_LAMPORTS=1000000  # 0.001 SOL (fast)
```

### 4. **Monitor Limits**

```env
# Lower limit = better performance
MAX_MONITORED_TOKENS=50

# Higher limit = more monitoring
MAX_MONITORED_TOKENS=200
```

---

## 🧪 Testing

### Test with Devnet

```env
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WSS_URL=wss://api.devnet.solana.com
```

Get devnet SOL: [solfaucet.com](https://solfaucet.com)

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Add test token
curl -X POST http://localhost:3000/monitor/add \
  -H "Content-Type: application/json" \
  -d '{"token_mint":"So11111111111111111111111111111111111111112"}'

# Check status
curl http://localhost:3000/monitor/status
```

---

## 📚 Next Steps

1. ✅ **Configure `.env`** - Set up RPC, private key, etc.
2. ✅ **Start the engine** - `npm start`
3. ✅ **Add tokens** - POST to `/monitor/add`
4. ✅ **Monitor logs** - Watch `data/logs/`
5. ✅ **Set up webhooks** - Configure Shyft (optional)
6. ✅ **Deploy to VPS** - Use PM2 for production

---

## 🆘 Support

- **Documentation:** See `README.md` and `PORT_COMPLETE.md`
- **API Reference:** See `Docs/API_DOCUMENTATION.md`
- **Logs:** Check `data/logs/*.jsonl`

---

## ⚖️ License

MIT License - See `LICENSE` file

---

**Happy Trading! 🚀**
