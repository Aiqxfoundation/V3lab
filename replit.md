# AIQX Labs - Professional Multi-Chain Token Platform

## Overview
AIQX Labs is a production-ready multi-chain token creation and management platform supporting Ethereum (Mainnet & Sepolia), BNB Smart Chain (Mainnet & Testnet), and Solana (Mainnet & Testnet). It offers uniform navigation, smart contract-based feature embedding for EVM tokens, explicit authority management for Solana tokens, integrated IPFS support via Pinata, and a comprehensive configuration system for production deployment. The platform aims to provide a professional, efficient, and secure environment for multi-chain token operations.

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
The platform features a chain-aware architecture where each blockchain is treated as an independent system, with a focus on a seamless multi-chain user experience and robust technical implementation.

### UI/UX Decisions
- **Uniform Multi-Chain Navigation**: Consistent sidebar structures across all supported chains, with chain-specific tools (e.g., Blacklist Addresses for EVM, Freeze Account for Solana).
- **Global Wallet Connection**: A single, persistent wallet connection in the top navbar, eliminating per-page connection requirements.
- **Explicit Solana Authority UI**: Professional radio button groups for authority management with clear options and visual feedback.
- **Professional Transaction Feedback**: A dedicated modal for real-time transaction status updates, explorer links, and user-friendly error messages.
- **Help System**: Integrated multi-page, card-based documentation.
- **Token Management Panel**: A dashboard for managing deployed tokens, including features like disabling mint, pausing, blacklisting, and updating taxes.
- **Logo Upload**: IPFS-based logo upload with instant preview for token creation.
- **Chain-Specific Landing Pages**: Themed overview pages for each blockchain (Ethereum, BSC, Solana) providing chain-specific metrics, features, and direct CTAs.

### Technical Implementations
- **Chain Context System**: Global state management for blockchain selection, persistent via `localStorage`.
- **Comprehensive Multi-Wallet System**:
    - **EVM Chains**: EIP-6963 standard implementation for MetaMask, Trust Wallet, OKX, Bitget, Binance Web3, and Coinbase. Supports concurrent wallet installations and auto-reconnects.
    - **Solana**: Native multi-wallet support for Phantom, OKX, Solflare, and Backpack with automatic provider discovery.
    - **Professional UI**: Displays official SVG wallet logos with real-time availability and install prompts. Allows full browsing without wallet connection, with contextual alerts only when needed for transactions.
- **Token Creation**:
    - **EVM Chains**: Advanced smart contract system (`ERC20Advanced.sol`) using constructor flags for modular features (Mintable, Burnable, Pausable, Capped Supply, Transfer Tax, Blacklist).
    - **Blacklist Feature**: Dedicated tool for EVM chains to block addresses from sending/receiving tokens.
    - **Solana**: SPL token creation with explicit Keep/Revoke authority management (Mint, Freeze, Update Authority) and IPFS integration for metadata.
- **IPFS Integration**: Production-ready Pinata integration for uploading images, metadata, and logo files.
- **Configuration System**: App-wide configuration management (`app-config.ts`) with feature detection for IPFS and Alchemy services, supporting environment variables.
- **RPC Configuration**: Centralized RPC endpoint management with environment variable support and fallback public RPCs.
- **Validation**: Zod is used for schema validation.
- **Performance**: Solana metadata updates feature lazy loading and optimized RPC calls.
- **Solana Token Discovery & Picker**: Utility function to fetch all SPL tokens from a connected wallet and a universal component for seamless token selection across all Solana tools.
- **Authority-Aware UX**: Real-time authority status display and prevention of unauthorized actions in Solana authority tools.

### System Design Choices
- **Modular Design**: Codebase organized into `components`, `contexts`, `config`, `hooks`, `pages`, and `utils`.
- **Shared Validation Schema**: Centralized validation rules for consistency.
- **Client-side Signing**: No private keys handled on the server for enhanced security.
- **Stateless Operation**: Configured for `autoscale` to support stateless operation.

## External Dependencies
- **Blockchain Networks**: Ethereum (Mainnet & Sepolia), Binance Smart Chain (Mainnet & Testnet), Solana (Mainnet & Testnet)
- **Wallet Integrations**:
    - **EVM**: MetaMask, Trust Wallet, OKX Wallet, Bitget Wallet, Binance Web3 Wallet, Coinbase Wallet (EIP-6963 compliant)
    - **Solana**: Phantom, OKX Wallet, Solflare, Backpack
- **IPFS Storage**: Pinata (optional, for token images and metadata)
- **RPC Providers**: Alchemy (optional, for enhanced RPC endpoints)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Form Management**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query
- **Development Server**: Vite
- **Backend Framework**: Express.js