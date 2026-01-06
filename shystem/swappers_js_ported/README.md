# Swappers2 - JavaScript Port

This is a complete JavaScript port of the Rust-based Solana trading bot.

## Features

- Automated token trading on Solana
- Jupiter aggregator integration
- Helius RPC integration for fast transaction sending
- Multi-account support
- Real-time monitoring and logging
- Token quality filtering
- Configurable trading strategies

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env` and fill in your credentials:

   - `HELIUS_API_KEY`: Your Helius API key
   - `PRIVATE_KEY`: Your Solana wallet private key (base58 or hex format)

2. Configure `config.ini` with trading parameters
3. Configure `account_config.ini` with account details

## Usage

### Main Trading Bot

```bash
npm start
```

### Worker Process

```bash
npm run worker <account_name> <token_name> <token_address> <token_score>
```

### Interactive Examples

```bash
# Solana trading example
npm run example:solana

# EVM/Ankr trading
npm run ankr

# Test operations
npm run test:operations
```

## Project Structure

```
swappers_js_ported/
├── src/
│   ├── main.js              # Main entry point
│   ├── worker.js            # Worker process
│   ├── bot.js               # Core trading logic
│   ├── login.js             # Account login utilities
│   ├── prepare.js           # Data preparation
│   ├── shyft_api.js         # Shyft API integration
│   ├── summary_banner.js    # Real-time statistics
│   ├── test.js              # Testing utilities
│   ├── bin/                 # Executable scripts
│   │   ├── run_ankr.js
│   │   ├── solana_example.js
│   │   └── test_operations.js
│   └── spl_swap/            # Solana trading modules
│       ├── solana_trade.js
│       ├── solana_account_closure.js
│       ├── solana_function.js
│       └── ankr_functions.js
├── package.json
└── README.md
```

## License

Proprietary
