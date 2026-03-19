# Swappers2 JavaScript - Complete Port from Rust

## Overview

This is a complete, feature-for-feature port of the Rust-based Solana trading bot to JavaScript/Node.js. Every module, function, and feature has been faithfully converted to maintain the same functionality.

## Files Ported

### Core Modules

- ✅ `src/lib.rs` → Module structure (implicit in JS)
- ✅ `src/main.js` → Main entry point for trading bot
- ✅ `src/worker.js` → Worker process for individual token trades
- ✅ `src/prepare.js` → Data preparation and API utilities

### Feature Modules

- ✅ `src/bot.js` → Core trading logic with buy/sell automation
- ✅ `src/login.js` → Account login utilities
- ✅ `src/shyft_api.js` → Shyft API integration for transaction analysis
- ✅ `src/summary_banner.js` → Real-time trading statistics display
- ✅ `src/test.js` → Testing utilities

### SPL Swap Modules

- ✅ `src/spl_swap/solana_trade.js` → Main Solana trading with Jupiter & Helius
- ✅ `src/spl_swap/solana_account_closure.js` → Token account cleanup
- ✅ `src/spl_swap/solana_function.js` → Alternative trading implementation with WebSocket
- ✅ `src/spl_swap/ankr_functions.js` → EVM chain trading support

### Executable Scripts

- ✅ `src/bin/run_ankr.js` → Interactive EVM trading example
- ✅ `src/bin/solana_example.js` → Interactive Solana trading example
- ✅ `src/bin/test_operations.js` → Test suite for operations

### Configuration & Setup

- ✅ `package.json` → Dependencies and scripts
- ✅ `.env.example` → Environment configuration template
- ✅ `README.md` → Comprehensive documentation
- ✅ `setup.sh` & `setup.ps1` → Setup scripts for Unix/Windows

## Key Features Preserved

1. **Automated Token Trading**

   - CSV-based token input processing
   - Multi-account support
   - Token age and market cap filtering
   - Automatic buy/sell execution

2. **Jupiter Aggregator Integration**

   - Quote fetching
   - Swap transaction generation
   - Slippage protection
   - Dynamic compute unit limits

3. **Helius RPC Integration**

   - Fast transaction sending
   - Multiple endpoint fallback
   - Retry logic
   - Transaction confirmation

4. **Trading Logic**

   - Configurable profit targets
   - Stop-loss protection
   - Deadline-based selling
   - Token score-based position sizing
   - Garbage token detection
   - Real-time price monitoring

5. **Transaction Management**

   - Jito tip integration
   - Address lookup table support
   - WebSocket-based confirmation
   - Account closure after trading

6. **Monitoring & Logging**
   - Real-time statistics banner
   - CSV logging
   - Error tracking
   - Performance metrics

## Architecture Equivalence

| Rust Component                | JavaScript Equivalent                   |
| ----------------------------- | --------------------------------------- |
| `tokio` runtime               | Native `async/await` with promises      |
| `anyhow` error handling       | Try/catch with custom Error classes     |
| `serde` serialization         | Native JSON with `JSON.parse/stringify` |
| `solana-sdk`                  | `@solana/web3.js`                       |
| `reqwest` HTTP client         | `axios`                                 |
| `bs58` base58 encoding        | `bs58` package                          |
| `ini` config parser           | `ini` package                           |
| `csv` file handling           | `csv-parser` & `csv-writer`             |
| `colored` terminal colors     | `chalk`                                 |
| `tokio-tungstenite` WebSocket | `ws` package                            |
| `ethers-rs` (placeholder)     | `ethers` package                        |

## Dependencies

All Rust dependencies have been mapped to their JavaScript equivalents:

```json
{
  "@solana/web3.js": "^1.95.0", // solana-sdk
  "@solana/spl-token": "^0.4.0", // spl-token
  "axios": "^1.7.0", // reqwest
  "dotenv": "^16.4.0", // dotenv
  "ini": "^5.0.0", // rust-ini
  "csv-parser": "^3.0.0", // csv (read)
  "csv-writer": "^1.6.0", // csv (write)
  "chalk": "^5.3.0", // colored
  "bs58": "^6.0.0", // bs58
  "ethers": "^6.13.0", // ethers-rs
  "ws": "^8.18.0" // tokio-tungstenite
}
```

## Installation

```bash
# Install dependencies
npm install

# Or use setup script
# Unix/Linux/Mac:
chmod +x setup.sh
./setup.sh

# Windows:
.\setup.ps1
```

## Configuration

1. **Environment Variables** (`.env`):

   ```
   HELIUS_API_KEY=your_key_here
   PRIVATE_KEY=your_solana_private_key
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

2. **Account Config** (`account_config.ini`):
   Same format as Rust version

3. **Trading Config** (`config.ini`):
   Same format as Rust version

## Usage

All npm scripts mirror the Rust binary names:

```bash
# Main trading bot
npm start                    # cargo run --bin main

# Worker process
npm run worker               # cargo run --bin worker

# Login utility
npm run login                # cargo run --bin login

# Testing
npm test                     # cargo run --bin test_trade
npm run test:operations      # cargo run --bin test_operations

# Examples
npm run example:solana       # cargo run --bin solana_example
npm run ankr                 # cargo run --bin run_ankr
```

## Differences from Rust Version

### Functional Differences

- **None**: All functionality is preserved

### Implementation Differences

1. **Async/Await**: JavaScript uses native promises instead of Tokio
2. **Error Handling**: JavaScript uses try/catch instead of Result<T, E>
3. **Type System**: JavaScript is dynamically typed (runtime checks instead of compile-time)
4. **Memory Management**: JavaScript uses garbage collection instead of ownership
5. **Concurrency**: JavaScript uses event loop instead of thread-based concurrency

### Performance Considerations

- JavaScript may be slightly slower for CPU-intensive operations
- Network I/O performance is comparable
- Memory usage may be higher due to garbage collection
- Transaction sending and confirmation times are identical (network-bound)

## Testing

The port includes all test functionality from the Rust version:

```bash
# Test individual operations
node src/bin/test_operations.js buy
node src/bin/test_operations.js sell
node src/bin/test_operations.js balance
node src/bin/test_operations.js all
```

## Compatibility

- **Node.js**: Requires v18.0.0 or higher
- **Operating Systems**: Windows, macOS, Linux
- **Solana**: Compatible with mainnet-beta
- **Jupiter**: Uses latest v1 API
- **Helius**: Uses latest RPC endpoints

## Migration Notes

If you're migrating from the Rust version:

1. All config files (`config.ini`, `account_config.ini`, `input.csv`) work unchanged
2. Environment variables use the same names
3. Log output format is identical
4. CSV log structure is identical
5. All trading parameters work the same way

## Support & Development

The JavaScript port maintains 100% feature parity with the Rust version. All modules, functions, and configurations work identically.

## License

Proprietary - Same as original Rust version
