# Production Configuration Guide

This guide explains how to configure the AIQX Labs Multi-Chain Dapp for production deployment.

## Environment Variables

### Required Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# IPFS Configuration (Pinata)
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Blockchain RPC Configuration (Alchemy)
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Custom RPC Endpoints (Optional)
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_BSC_RPC_URL=https://bsc-dataseed.binance.org/
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Application Settings
NODE_ENV=production
PORT=5000
```

## Getting API Keys

### Pinata (IPFS Storage)

1. Visit [https://app.pinata.cloud](https://app.pinata.cloud)
2. Create a free account
3. Navigate to API Keys section
4. Generate a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
5. Copy both the API Key and Secret Key to your `.env` file

**What Pinata is used for:**
- Storing token logos on IPFS (decentralized storage)
- Uploading token metadata (name, symbol, description)
- Creating permanent, immutable links for token assets

### Alchemy (Blockchain RPC)

1. Visit [https://www.alchemy.com](https://www.alchemy.com)
2. Create a free account
3. Create a new app for each network you want to support:
   - Ethereum Mainnet
   - Polygon Mainnet
   - BSC (if available)
4. Copy the API key from each app
5. Add to your `.env` file

**What Alchemy is used for:**
- Faster and more reliable blockchain connections
- Enhanced API features for token deployment
- Better error handling and transaction monitoring
- Support for multiple EVM-compatible chains

## Configuration Persistence

### Development Mode

In development, users can configure API keys through the Settings page (`/settings`). These are stored in browser localStorage and persist across sessions.

### Production Mode

For production deployments:

1. **Environment Variables (Recommended)**
   - Set all configuration in `.env` file
   - Deploy with environment variables configured
   - Most secure and maintainable approach

2. **Build-time Configuration**
   - Configuration is baked into the build
   - No runtime changes possible
   - Best for static deployments

3. **Runtime Configuration**
   - Use the Settings page for user-specific keys
   - Store in encrypted localStorage
   - Suitable for multi-tenant deployments

## Multi-Chain Support

The application supports the following blockchains:

### Solana
- **Testnet**: For development and testing
- **Mainnet Beta**: For production deployments
- **Features**: Full authority management, metadata updates, freeze accounts

### Ethereum
- **Mainnet**: Production network
- **Sepolia**: Test network
- **Features**: ERC20 tokens with mintable, burnable, pausable, taxable features

### Binance Smart Chain (BSC)
- **Mainnet**: Production network
- **Testnet**: Test network
- **Features**: BEP20 tokens with full ERC20 compatibility

### Polygon
- **Mainnet**: Production network
- **Mumbai**: Test network
- **Features**: Low-cost ERC20 token deployment

## Unified Navigation Structure

All chains now have a consistent navigation structure:

```
Home
├── [Chain Name] Tools
│   ├── Create Token
│   ├── Manage Tokens
│   ├── Mint Tokens
│   ├── Burn Tokens
│   ├── Freeze Account
│   ├── Authority Tools
│   │   ├── Transfer Authority
│   │   ├── Revoke Mint
│   │   ├── Revoke Freeze
│   │   └── Revoke Update (Solana only)
│   ├── Update Metadata
│   └── Multisender
```

## Token Creation Features

### Contract-Based Feature Inclusion

When creating tokens, all selected features are automatically included in the smart contract source code:

**EVM Chains (Ethereum, BSC, Polygon):**
- ✅ Mintable: Adds `mint()` function to contract
- ✅ Burnable: Adds `burn()` function to contract
- ✅ Pausable: Adds `pause()`/`unpause()` functions
- ✅ Capped Supply: Enforces maximum supply limit
- ✅ Transfer Tax: Implements automatic tax on transfers
- ✅ Blacklist: Allows blocking specific addresses

**Solana:**
- ✅ Mint Authority: Control over minting new tokens
- ✅ Freeze Authority: Ability to freeze/unfreeze accounts
- ✅ Update Authority: Permission to update metadata

### Authority Management

For Solana tokens, authority settings are configured during deployment:

1. **Mint Authority**
   - Keep: Allows minting additional tokens after deployment
   - Revoke: Fixed supply, no more tokens can be created

2. **Freeze Authority**
   - Keep: Can freeze/unfreeze token accounts
   - Revoke: No freeze functionality

3. **Update Authority**
   - Keep: Can update token metadata (name, symbol, logo)
   - Revoke: Metadata becomes immutable

**Important:** Authority revocation is permanent and cannot be undone.

## Global Wallet Connection

The wallet connection is now global and persists across all pages:

- **Location**: Top-right corner of the navbar
- **Persistence**: Stays connected when navigating between pages
- **Multi-Chain**: Automatically switches based on selected blockchain
- **Supported Wallets**:
  - **EVM**: MetaMask
  - **Solana**: Phantom, Solflare, OKX Wallet, Backpack

## Deployment Checklist

- [ ] Configure `.env` file with all API keys
- [ ] Test token creation on testnets
- [ ] Verify IPFS uploads work correctly
- [ ] Test wallet connections for all supported chains
- [ ] Verify authority management functions
- [ ] Test multisender functionality
- [ ] Review and test all navigation links
- [ ] Ensure proper error handling
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups (if using)

## Security Best Practices

1. **Never commit `.env` file to version control**
2. **Use environment-specific configurations**
3. **Rotate API keys regularly**
4. **Implement rate limiting**
5. **Use HTTPS for all connections**
6. **Validate all user inputs**
7. **Audit smart contracts before deployment**
8. **Test thoroughly on testnets first**

## Support

For issues or questions:
- Check the Help page in the application
- Review the documentation
- Contact support team

## Version

Current Version: 2.0.0
Last Updated: 2025-01-29
