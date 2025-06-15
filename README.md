# AbuBeast Platform

AbuBeast is a comprehensive web3 platform that integrates multiple blockchain technologies, cross-chain functionality, and financial tools in a modern web application.

## Project Overview

AbuBeast provides a complete ecosystem for interacting with blockchain technologies including:

- Multi-chain wallet integration
- DeFi tools and services
- Cross-chain token swaps
- Financial charts and analytics
- Secure authentication system

## Tech Stack

### Frontend

- **Framework**: Next.js 15
- **UI/Styling**:
  - TailwindCSS
  - Shadcn UI components
  - Lucide React icons
  - Tailwind animations
- **State Management**: React hooks and context API

### Backend

- **Runtime**: Node.js (integrated with Next.js API routes)
- **Authentication**: JWT (jsonwebtoken) with bcrypt for password hashing
- **API Handling**: Axios for external API requests

### Database

- **Database**: MongoDB with Mongoose ODM

### Blockchain Integration

- **Ethereum**:
  - Ethers.js and Web3.js libraries
  - WalletConnect for wallet connections
- **Solana**:
  - Solana Web3.js
  - Solana Wallet Adapter
- **Cross-chain**: LiFi SDK for cross-chain swaps and bridges
- **Analytics**: Lightweight-charts for financial data visualization

## Project Structure

```
abubeast/
├── app/                    # Next.js app directory (pages and API routes)
│   ├── api/                # Backend API endpoints
│   └── ...                 # Page components and routes
├── components/             # Reusable React components
├── lib/                    # Utility functions and helpers
├── models/                 # MongoDB schemas
├── public/                 # Static assets
│   └── images/
│       └── logos/          # Partner and platform logos
├── styles/                 # Global styles
├── middleware.js           # Next.js middleware for auth and routing
└── services/               # External service integrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/abubeast.git
cd abubeast
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# External APIs (if applicable)
API_KEY=your_api_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Blockchain Features

### Wallet Integration

AbuBeast supports multiple wallet providers:

- **Ethereum/EVM**: MetaMask, WalletConnect, Coinbase Wallet
- **Solana**: Phantom, Solflare, Sollet

### Cross-Chain Operations

The platform utilizes LiFi SDK to enable:

- Cross-chain token swaps
- Bridge operations
- Liquidity aggregation

### Trading and Analytics

- Real-time market data visualization
- Trading chart analysis through lightweight-charts
- Historical price data and trends

## Deployment

The application is optimized for deployment on Vercel:

```bash
npm run build
# or
yarn build
```

For alternative deployment options, you can use:

- AWS Amplify
- Netlify
- Docker containers for custom hosting

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Security Considerations

- JWT authentication with secure HTTP-only cookies
- Password hashing with bcrypt
- Environment variable protection for sensitive data
- Regular dependency updates to patch security vulnerabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/yourusername/abubeast](https://github.com/yourusername/abubeast)
