# AIQX Labs - Professional Multi-Chain Token Platform

## Overview
AIQX Labs is a production-ready multi-chain token creation and management platform supporting Ethereum (Mainnet & Sepolia), BNB Smart Chain (Mainnet & Testnet), and Solana (Mainnet & Testnet). The platform features uniform navigation across all chains, smart contract-based feature embedding for EVM tokens, explicit authority management for Solana tokens, integrated IPFS support via Pinata, and a comprehensive configuration system for production deployment.

## User Preferences
### Development Workflow
1. **Chain Selection**: Users select a blockchain which persists across sessions
2. **Wallet Connection**: Wallets auto-reconnect on page refresh
3. **Token Creation**: Chain-specific forms with validation
4. **Transaction Tracking**: Real-time status updates with explorer links

### Coding Style
- TypeScript throughout
- Zod for validation
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for forms
- TanStack Query for data fetching

## System Architecture
The platform features a chain-aware architecture where each blockchain is treated as an independent system. Key architectural decisions include:

### UI/UX Decisions
- **Uniform Multi-Chain Navigation**: All supported chains (Ethereum Mainnet/Sepolia, BSC Mainnet/Testnet, Solana Mainnet/Testnet) display identical sidebar structures with consistent tool access. EVM chains include Blacklist Addresses tool, while Solana chains include Freeze Account tool.
- **Global Wallet Connection**: A single wallet connection in the top navbar persists across all pages and chain switches, eliminating the need for per-page connection buttons.
- **Explicit Solana Authority UI**: Token authority management uses professional radio button groups with clear "Keep Authority" and "Revoke Authority" options, color-coded feedback (green/red), and permanent decision warnings.
- **Professional Transaction Feedback**: A dedicated modal provides real-time transaction status updates (Processing, Confirming, Success/Failed) with explorer links and user-friendly error messages.
- **Help System**: A multi-page, card-based help documentation system is integrated, providing guides on various platform features.
- **Token Management Panel**: A dashboard allows users to view and manage deployed tokens, with features like disabling mint, pausing, managing blacklists, and updating taxes.
- **Logo Upload**: Integrated IPFS-based logo upload with instant preview for token creation.

### Technical Implementations
- **Chain Context System**: Global state management (`ChainContext`) for the selected blockchain, with persistence via `localStorage`.
- **Comprehensive Multi-Wallet System**: 
    - **EVM Chains**: Full multi-wallet support with EIP-6963 standard implementation for MetaMask, Trust Wallet, OKX Wallet, Bitget Wallet, Binance Web3 Wallet, and Coinbase Wallet. Uses global provider map to detect and manage concurrent wallet installations, with fallback to legacy window.ethereum detection.
    - **Solana**: Native multi-wallet support for Phantom, OKX, Solflare, and Backpack with automatic provider discovery and selection.
    - **Professional UI**: Official SVG wallet logos displayed in connection modal with real-time availability status and install prompts.
    - **UX Design**: Pages are fully browsable without wallet connection; wallets only required when performing blockchain transactions. Contextual alerts appear only when wallet is needed but not connected.
    - **Auto-reconnect**: Wallet states persist across page refreshes with automatic reconnection on app load.
    - **Global Connection**: Unified wallet management in top navbar across all pages and chain switches, with automatic disconnection when switching between EVM and Solana ecosystems.
- **Token Creation**:
    - **EVM Chains**: Advanced smart contract system using constructor flags to enable/disable features at deployment time. Supports Mintable, Burnable, Pausable, Capped Supply, Transfer Tax, and Blacklist features. Uses OpenZeppelin-compatible pattern where all functions exist in ABI but logic respects feature flags (`server/contracts/ERC20Advanced.sol`).
    - **Blacklist Feature**: EVM chains have dedicated blacklist management tool (`client/src/pages/evm-blacklist.tsx`) providing address-level transfer blocking, equivalent to Solana's freeze account feature. Owner can blacklist/unblacklist specific addresses, preventing them from sending or receiving tokens.
    - **Solana**: SPL token creation with explicit Keep/Revoke authority management via radio button UI. Supports Mint Authority, Freeze Authority, and Update Authority with permanent decision warnings. Metadata support includes IPFS integration for images.
- **IPFS Integration**: Production-ready Pinata integration with utilities for uploading images, metadata, and logo files (`client/src/utils/ipfsUploader.ts`). Supports environment-based configuration with graceful fallbacks.
- **Configuration System**: App-wide configuration management (`client/src/config/app-config.ts`) with feature detection for IPFS and Alchemy services, environment variable support, and configuration status checking.
- **RPC Configuration**: Centralized RPC endpoint management (`client/src/config/rpc.ts`) with environment variable support and fallback public RPCs.
- **Validation**: Zod is used for schema validation across the application.
- **Performance**: Solana metadata updates feature lazy loading, on-demand fetching, and optimized RPC calls for efficient performance.

### System Design Choices
- **Modular Design**: The codebase is organized into `components`, `contexts`, `config`, `hooks`, `pages`, and `utils` for maintainability.
- **Shared Validation Schema**: A `shared/schema.ts` file centralizes validation rules for consistency.
- **Client-side Signing**: No private keys are handled on the server, ensuring user security.
- **Stateless Operation**: Deployment is configured for `autoscale` to support stateless operation.

## External Dependencies
- **Blockchain Networks**: Ethereum (Mainnet & Sepolia), Binance Smart Chain (Mainnet & Testnet), Solana (Mainnet & Testnet)
- **Wallet Integrations**:
    - **EVM**: MetaMask, Trust Wallet, OKX Wallet, Bitget Wallet, Binance Web3 Wallet, Coinbase Wallet (EIP-6963 compliant, global connection in navbar)
    - **Solana**: Phantom, OKX Wallet, Solflare, Backpack (native multi-wallet support, global connection in navbar)
- **IPFS Storage**: Pinata (for token images and metadata) - Optional with environment configuration
- **RPC Providers**: Alchemy (enhanced RPC endpoints) - Optional with environment configuration
- **Styling**: Tailwind CSS with custom dark mode support
- **Animation**: Framer Motion
- **Form Management**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query
- **Development Server**: Vite
- **Backend Framework**: Express.js

## Required Configuration (Production)
Create a `.env` file based on `.env.example`:

### IPFS Configuration (Optional)
```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### Blockchain RPC Configuration (Optional but Recommended)
```env
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_BSC_RPC_URL=https://bsc-dataseed.binance.org/
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Application Settings
```env
NODE_ENV=production
PORT=5000
```

## Recent Updates (October 2025)
1. **Multi-Chain Navigation Standardization**: All chains now show identical sidebar layouts
2. **Smart Contract Feature System**: EVM tokens use constructor flags for feature toggling
3. **Solana Authority UI Enhancement**: Replaced switches with explicit Keep/Revoke radio buttons
4. **IPFS Integration**: Added Pinata utilities with environment-based configuration
5. **Production Configuration**: Created app-wide config system with feature detection
6. **Global Wallet Connection**: Unified wallet management in top navbar across all pages
7. **Solana Network Consolidation**: Removed Devnet support per user request - now supports only Testnet and Mainnet for Solana
8. **Chain Routing Fix**: Fixed chain detection logic to properly identify Solana chains using blockchain type instead of exact chainId match
9. **Comprehensive Multi-Wallet System (October 30, 2025)**:
   - Implemented EIP-6963 standard for EVM wallet discovery and management
   - Added support for 6 EVM wallets: MetaMask, Trust Wallet, OKX, Bitget, Binance Web3, Coinbase
   - Enhanced Solana wallet support: Phantom, OKX, Solflare, Backpack
   - Created professional wallet icon library with official SVG logos (`client/src/components/wallet-icons.tsx`)
   - Refactored WalletRequired component to be contextual (shows content with alerts instead of blocking pages)
   - Upgraded unified-wallet-modal with availability detection and install prompts
   - Pages now fully browsable without wallet connection; wallet only required for blockchain actions
   - Global provider map for concurrent multi-wallet detection in EIP-6963 environments
10. **Wallet Detection Improvements & Professional UX (October 31, 2025)**:
   - Implemented retry logic with 10 attempts at 300ms intervals for both Solana and EVM wallet detection to handle late-injected browser extensions
   - Removed all blocking "Connect Your Wallet" cards from 15+ pages across the platform
   - Forms are now always visible without wallet connection - submit buttons show "Connect Wallet to [Action]" when disconnected
   - "Connect Wallet" button exclusively appears in the header, never blocking page content
   - Consistent professional UX pattern applied across Create Token, Mint, Burn, Pause, Freeze, Authority, Metadata, and Multisender pages
   - All pages fully browsable and forms accessible without wallet connection
11. **Chain Migration & EVM Blacklist Feature (October 31, 2025)**:
   - **Chain Consolidation**: Removed Polygon, Arbitrum, and Base support - platform now exclusively supports Ethereum (Mainnet & Sepolia), BSC (Mainnet & Testnet), and Solana (Mainnet & Testnet)
12. **Professional Chain-Specific Landing Pages (November 1, 2025)**:
   - **Unique Themed Overview Pages**: Created professional landing pages for each blockchain with distinct visual themes:
     - **Ethereum**: Blue gradient theme (#627EEA) with professional blockchain imagery, featuring Ethereum-specific metrics (400K+ ERC-20 tokens, $500B+ TVL, 15s block time)
     - **BNB Smart Chain**: Yellow/amber gradient theme with BSC branding, highlighting performance metrics (3s block time, 2,000+ TPS, $0.03 gas fees)
     - **Solana**: Purple/pink gradient theme showcasing Solana's speed (65,000 TPS, 400ms block time, $0.00025 transaction cost)
   - **Enhanced Navigation Flow**: Implemented `/chain/:chainId` route that displays chain overview pages as the default landing when switching blockchains, eliminating confusion where old feature pages remained visible after chain switches
   - **Comprehensive Chain Information**: Each overview page includes:
     - Hero section with chain branding and tagline
     - Real-time statistics cards with blockchain-specific metrics
     - "Why Choose This Blockchain?" feature comparison grid
     - Token capabilities showcase (Mintable, Burnable, Pausable, Tax, Blacklist, etc.)
     - Step-by-step "How It Works" guide
     - Professional stock photography from blockchain industry
     - Direct CTAs to Create Token and Manage Tokens
     - Complete tools grid with all available features
   - **ChainSwitcher Integration**: Updated chain selector dropdown to automatically navigate to overview pages when users select a different blockchain, providing immediate context about the selected chain before accessing features
   - **Testnet Support**: All overview pages properly detect and badge testnet environments (Sepolia, BSC Testnet, Solana Testnet)
   - **Lazy Loading**: Overview pages use React.lazy() for optimal bundle splitting and performance
   - **EVM Blacklist Implementation**: Created comprehensive blacklist management tool (`client/src/pages/evm-blacklist.tsx`) providing EVM equivalent of Solana's freeze account feature
   - **Feature Parity**: All EVM chains now have `freezeAccounts: true` feature flag with dedicated "Blacklist Addresses" tool in navigation
   - **Type-Safe Implementation**: Fixed TypeScript chain lookup using `SUPPORTED_CHAINS[chainId as ChainId]` pattern for type safety
   - **Verified Contract**: ERC20Advanced.sol contract supports 6 modular features (Mintable, Burnable, Pausable, Capped, Tax, Blacklist) with production-ready Solidity 0.8.20 implementation
   - **UI Consistency**: Blacklist tool follows same UX patterns as other EVM tools with owner-gated operations, toast notifications, and real-time status checks