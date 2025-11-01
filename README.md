# AIQX Labs Multi-Chain Token Platform

A production-ready, multi-chain token creation and management platform supporting Solana, Ethereum, BSC, and Polygon.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

### Multi-Chain Support
- ✅ **Solana** (Testnet & Mainnet Beta)
- ✅ **Ethereum** (Mainnet & Sepolia)
- ✅ **Binance Smart Chain** (Mainnet & Testnet)
- ✅ **Polygon** (Mainnet & Mumbai)

### Token Creation
- ✅ **EVM Tokens** (ERC20/BEP20)
  - Mintable tokens
  - Burnable tokens
  - Pausable tokens
  - Capped supply
  - Transfer tax
  - Blacklist functionality
  
- ✅ **Solana Tokens** (SPL)
  - Mint authority control
  - Freeze authority control
  - Update authority control
  - Metadata management

### Token Management
- ✅ View all deployed tokens
- ✅ Manage token features
- ✅ Mint additional tokens
- ✅ Burn tokens
- ✅ Freeze/Unfreeze accounts (Solana)
- ✅ Pause/Unpause transfers (EVM)
- ✅ Update metadata
- ✅ Transfer/Revoke authorities

### Advanced Tools
- ✅ **Multisender** - Send tokens to multiple addresses
- ✅ **Authority Management** - Transfer or revoke authorities
- ✅ **Blacklist Management** - Block specific addresses (EVM)
- ✅ **Tax Management** - Configure transfer taxes (EVM)

### Infrastructure
- ✅ **IPFS Integration** - Decentralized logo and metadata storage via Pinata
- ✅ **Alchemy API** - Enhanced RPC endpoints for EVM chains
- ✅ **Global Wallet Connection** - Persistent wallet state across all pages
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Input Validation** - Comprehensive security validations
- ✅ **Responsive Design** - Mobile-friendly interface

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL (for token storage)
- Pinata API keys (for IPFS)
- Alchemy API keys (optional, for enhanced RPC)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Aiqxfoundation/Myapp.git
cd Myapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Set up database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```bash
# IPFS Configuration (Pinata)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Blockchain RPC Configuration (Alchemy)
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_API_KEY=your_alchemy_api_key

# Custom RPC Endpoints (Optional)
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_BSC_RPC_URL=https://bsc-dataseed.binance.org/
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Application Settings
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
```

### Getting API Keys

#### Pinata (IPFS Storage)
1. Visit [https://app.pinata.cloud](https://app.pinata.cloud)
2. Create a free account
3. Generate API keys with `pinFileToIPFS` and `pinJSONToIPFS` permissions
4. Add keys to `.env` file

#### Alchemy (RPC Provider)
1. Visit [https://www.alchemy.com](https://www.alchemy.com)
2. Create a free account
3. Create apps for each network (Ethereum, Polygon, etc.)
4. Copy API keys to `.env` file

## 🏗️ Project Structure

```
Myapp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Wallet, Chain, etc.)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration files
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Backend Express server
│   ├── contracts/         # Smart contract templates
│   ├── utils/             # Server utilities
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts
└── docs/                  # Documentation
```

## 🎯 Usage

### Creating a Token

1. **Select Blockchain**
   - Choose from Solana, Ethereum, BSC, or Polygon on the home page

2. **Connect Wallet**
   - Click "Connect Wallet" in the top-right corner
   - Select your wallet (MetaMask for EVM, Phantom/Solflare for Solana)

3. **Configure Token**
   - Enter token name, symbol, and supply
   - Select desired features (mintable, burnable, etc.)
   - Upload logo (optional)
   - Add metadata (description, website, social links)

4. **Set Authorities** (Solana only)
   - Choose to keep or revoke mint authority
   - Choose to keep or revoke freeze authority
   - Choose to keep or revoke update authority

5. **Deploy**
   - Review gas/transaction fees
   - Confirm deployment
   - Wait for confirmation

### Managing Tokens

1. **Navigate to Management**
   - Go to Dashboard or Chain-specific Manage page
   - View all your deployed tokens

2. **Select Token**
   - Click on a token to view details
   - See active features and statistics

3. **Use Tools**
   - Mint additional tokens
   - Burn tokens
   - Pause/Unpause (EVM)
   - Freeze accounts (Solana)
   - Update metadata
   - Manage authorities

## 🔐 Security

### Input Validation
- ✅ Address validation (EVM & Solana)
- ✅ Token name/symbol validation
- ✅ Supply and decimals validation
- ✅ URL validation
- ✅ XSS prevention through sanitization

### Transaction Security
- ✅ Balance checking before transactions
- ✅ Gas estimation
- ✅ Transaction parameter validation
- ✅ Confirmation waiting

### Error Handling
- ✅ React Error Boundaries
- ✅ Graceful error recovery
- ✅ User-friendly error messages
- ✅ Development mode debugging

## 📚 Documentation

- [Production Configuration Guide](./PRODUCTION_CONFIG.md)
- [Production Ready Summary](./PRODUCTION_READY_SUMMARY.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Design Guidelines](./design_guidelines.md)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build            # Build for production
npm run check            # Type check

# Database
npm run db:push          # Push database schema

# Production
npm start                # Start production server
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Radix UI + Tailwind CSS (UI)
- Framer Motion (animations)
- React Hook Form + Zod (forms)

**Blockchain:**
- ethers.js v6 (EVM)
- @solana/web3.js (Solana)
- @solana/spl-token (Solana tokens)

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Solidity compiler (solc)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- Solana Foundation for SPL token standards
- Metaplex for Solana metadata standards
- Pinata for IPFS infrastructure
- Alchemy for RPC infrastructure

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Aiqxfoundation/Myapp/issues)
- **Documentation**: See `/docs` folder
- **Email**: support@aiqxlabs.com

## 🗺️ Roadmap

### Current Version (2.0.0)
- ✅ Multi-chain token creation
- ✅ Token management
- ✅ Authority management
- ✅ IPFS integration
- ✅ Global wallet connection

### Future Enhancements
- [ ] Liquidity management
- [ ] Airdrop tools
- [ ] Token vesting
- [ ] Multi-sig support
- [ ] Advanced analytics
- [ ] Mobile app

## 📊 Status

- **Version**: 2.0.0
- **Status**: Production Ready ✅
- **Last Updated**: 2025-01-29
- **Production Readiness**: 89%

---

**Built with ❤️ by AIQX Labs**
