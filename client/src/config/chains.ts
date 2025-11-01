import { SiEthereum, SiBinance, SiSolana } from 'react-icons/si';
import { IconType } from 'react-icons';
import { ChainId as SharedChainId, SUPPORTED_CHAINS as SHARED_SUPPORTED_CHAINS, BlockchainType } from '@shared/schema';

export interface ChainTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
  route: string;
}

export interface ChainConfig {
  id: SharedChainId;
  displayName: string;
  icon: IconType;
  color: string;
  gradient: string;
  network: string;
  explorer: string;
  blockchainType: BlockchainType;
  evmChainId?: number;
  routes: {
    overview: string;
    create: string;
    manage: string;
    tools: string;
  };
  tools: ChainTool[];
  features: {
    standardToken: boolean;
    mintableToken: boolean;
    burnableToken: boolean;
    taxableToken: boolean;
    multisender: boolean;
    authorityManagement: boolean;
    freezeAccounts: boolean;
    metadata: boolean;
  };
}

// Map shared chain IDs to UI configurations
export const CHAIN_DEFINITIONS: Record<SharedChainId, ChainConfig> = {
  'ethereum-mainnet': {
    id: 'ethereum-mainnet',
    displayName: 'Ethereum Mainnet',
    icon: SiEthereum,
    color: '#627EEA',
    gradient: 'from-blue-500 via-indigo-500 to-blue-600',
    network: 'Mainnet',
    explorer: 'https://etherscan.io',
    blockchainType: 'EVM',
    evmChainId: 1,
    routes: {
      overview: '/chain/ethereum-mainnet',
      create: '/chain/ethereum-mainnet/create',
      manage: '/chain/ethereum-mainnet/manage',
      tools: '/chain/ethereum-mainnet/tools',
    },
    tools: [
      {
        id: 'create-token',
        name: 'Create Token',
        description: 'Deploy custom ERC20 tokens',
        icon: 'Coins',
        available: true,
        route: '/chain/ethereum-mainnet/create',
      },
      {
        id: 'manage-tokens',
        name: 'Manage Tokens',
        description: 'View and manage deployed tokens',
        icon: 'Settings',
        available: true,
        route: '/chain/ethereum-mainnet/manage',
      },
      {
        id: 'mint-tokens',
        name: 'Mint Tokens',
        description: 'Mint additional tokens',
        icon: 'Plus',
        available: true,
        route: '/chain/ethereum-mainnet/mint',
      },
      {
        id: 'burn-tokens',
        name: 'Burn Tokens',
        description: 'Permanently burn tokens',
        icon: 'Flame',
        available: true,
        route: '/chain/ethereum-mainnet/burn',
      },
      {
        id: 'pause-token',
        name: 'Pause Token',
        description: 'Pause/unpause token transfers',
        icon: 'Pause',
        available: true,
        route: '/chain/ethereum-mainnet/pause',
      },
      {
        id: 'blacklist',
        name: 'Blacklist Addresses',
        description: 'Block/unblock specific addresses',
        icon: 'Ban',
        available: true,
        route: '/chain/ethereum-mainnet/blacklist',
      },
      {
        id: 'revoke-authority',
        name: 'Revoke Authority',
        description: 'Revoke token authorities',
        icon: 'Shield',
        available: true,
        route: '/chain/ethereum-mainnet/revoke',
      },
      {
        id: 'multisender',
        name: 'Multisender',
        description: 'Send tokens to multiple addresses',
        icon: 'Send',
        available: true,
        route: '/chain/ethereum-mainnet/multisend',
      },
    ],
    features: {
      standardToken: true,
      mintableToken: true,
      burnableToken: true,
      taxableToken: true,
      multisender: true,
      authorityManagement: true,
      freezeAccounts: true,
      metadata: false,
    },
  },
  'ethereum-testnet': {
    id: 'ethereum-testnet',
    displayName: 'Ethereum Sepolia',
    icon: SiEthereum,
    color: '#627EEA',
    gradient: 'from-blue-400 via-indigo-400 to-blue-500',
    network: 'Sepolia Testnet',
    explorer: 'https://sepolia.etherscan.io',
    blockchainType: 'EVM',
    evmChainId: 11155111,
    routes: {
      overview: '/chain/ethereum-testnet',
      create: '/chain/ethereum-testnet/create',
      manage: '/chain/ethereum-testnet/manage',
      tools: '/chain/ethereum-testnet/tools',
    },
    tools: [
      {
        id: 'create-token',
        name: 'Create Token',
        description: 'Deploy custom ERC20 tokens',
        icon: 'Coins',
        available: true,
        route: '/chain/ethereum-testnet/create',
      },
      {
        id: 'manage-tokens',
        name: 'Manage Tokens',
        description: 'View and manage deployed tokens',
        icon: 'Settings',
        available: true,
        route: '/chain/ethereum-testnet/manage',
      },
      {
        id: 'mint-tokens',
        name: 'Mint Tokens',
        description: 'Mint additional tokens',
        icon: 'Plus',
        available: true,
        route: '/chain/ethereum-testnet/mint',
      },
      {
        id: 'burn-tokens',
        name: 'Burn Tokens',
        description: 'Permanently burn tokens',
        icon: 'Flame',
        available: true,
        route: '/chain/ethereum-testnet/burn',
      },
      {
        id: 'pause-token',
        name: 'Pause Token',
        description: 'Pause/unpause token transfers',
        icon: 'Pause',
        available: true,
        route: '/chain/ethereum-testnet/pause',
      },
      {
        id: 'blacklist',
        name: 'Blacklist Addresses',
        description: 'Block/unblock specific addresses',
        icon: 'Ban',
        available: true,
        route: '/chain/ethereum-testnet/blacklist',
      },
      {
        id: 'revoke-authority',
        name: 'Revoke Authority',
        description: 'Revoke token authorities',
        icon: 'Shield',
        available: true,
        route: '/chain/ethereum-testnet/revoke',
      },
      {
        id: 'multisender',
        name: 'Multisender',
        description: 'Send tokens to multiple addresses',
        icon: 'Send',
        available: true,
        route: '/chain/ethereum-testnet/multisend',
      },
    ],
    features: {
      standardToken: true,
      mintableToken: true,
      burnableToken: true,
      taxableToken: true,
      multisender: true,
      authorityManagement: true,
      freezeAccounts: true,
      metadata: false,
    },
  },
  'bsc-mainnet': {
    id: 'bsc-mainnet',
    displayName: 'BNB Smart Chain',
    icon: SiBinance,
    color: '#F3BA2F',
    gradient: 'from-yellow-400 via-yellow-500 to-amber-500',
    network: 'BSC Mainnet',
    explorer: 'https://bscscan.com',
    blockchainType: 'EVM',
    evmChainId: 56,
    routes: {
      overview: '/chain/bsc-mainnet',
      create: '/chain/bsc-mainnet/create',
      manage: '/chain/bsc-mainnet/manage',
      tools: '/chain/bsc-mainnet/tools',
    },
    tools: [
      {
        id: 'create-token',
        name: 'Create Token',
        description: 'Deploy custom BEP20 tokens',
        icon: 'Coins',
        available: true,
        route: '/chain/bsc-mainnet/create',
      },
      {
        id: 'manage-tokens',
        name: 'Manage Tokens',
        description: 'View and manage deployed tokens',
        icon: 'Settings',
        available: true,
        route: '/chain/bsc-mainnet/manage',
      },
      {
        id: 'mint-tokens',
        name: 'Mint Tokens',
        description: 'Mint additional tokens',
        icon: 'Plus',
        available: true,
        route: '/chain/bsc-mainnet/mint',
      },
      {
        id: 'burn-tokens',
        name: 'Burn Tokens',
        description: 'Permanently burn tokens',
        icon: 'Flame',
        available: true,
        route: '/chain/bsc-mainnet/burn',
      },
      {
        id: 'pause-token',
        name: 'Pause Token',
        description: 'Pause/unpause token transfers',
        icon: 'Pause',
        available: true,
        route: '/chain/bsc-mainnet/pause',
      },
      {
        id: 'blacklist',
        name: 'Blacklist Addresses',
        description: 'Block/unblock specific addresses',
        icon: 'Ban',
        available: true,
        route: '/chain/bsc-mainnet/blacklist',
      },
      {
        id: 'revoke-authority',
        name: 'Revoke Authority',
        description: 'Revoke token authorities',
        icon: 'Shield',
        available: true,
        route: '/chain/bsc-mainnet/revoke',
      },
      {
        id: 'multisender',
        name: 'Multisender',
        description: 'Send tokens to multiple addresses',
        icon: 'Send',
        available: true,
        route: '/chain/bsc-mainnet/multisend',
      },
    ],
    features: {
      standardToken: true,
      mintableToken: true,
      burnableToken: true,
      taxableToken: true,
      multisender: true,
      authorityManagement: true,
      freezeAccounts: true,
      metadata: false,
    },
  },
  'bsc-testnet': {
    id: 'bsc-testnet',
    displayName: 'BNB Testnet',
    icon: SiBinance,
    color: '#F3BA2F',
    gradient: 'from-yellow-300 via-yellow-400 to-amber-400',
    network: 'BSC Testnet',
    explorer: 'https://testnet.bscscan.com',
    blockchainType: 'EVM',
    evmChainId: 97,
    routes: {
      overview: '/chain/bsc-testnet',
      create: '/chain/bsc-testnet/create',
      manage: '/chain/bsc-testnet/manage',
      tools: '/chain/bsc-testnet/tools',
    },
    tools: [
      {
        id: 'create-token',
        name: 'Create Token',
        description: 'Deploy custom BEP20 tokens',
        icon: 'Coins',
        available: true,
        route: '/chain/bsc-testnet/create',
      },
      {
        id: 'manage-tokens',
        name: 'Manage Tokens',
        description: 'View and manage deployed tokens',
        icon: 'Settings',
        available: true,
        route: '/chain/bsc-testnet/manage',
      },
      {
        id: 'mint-tokens',
        name: 'Mint Tokens',
        description: 'Mint additional tokens',
        icon: 'Plus',
        available: true,
        route: '/chain/bsc-testnet/mint',
      },
      {
        id: 'burn-tokens',
        name: 'Burn Tokens',
        description: 'Permanently burn tokens',
        icon: 'Flame',
        available: true,
        route: '/chain/bsc-testnet/burn',
      },
      {
        id: 'pause-token',
        name: 'Pause Token',
        description: 'Pause/unpause token transfers',
        icon: 'Pause',
        available: true,
        route: '/chain/bsc-testnet/pause',
      },
      {
        id: 'blacklist',
        name: 'Blacklist Addresses',
        description: 'Block/unblock specific addresses',
        icon: 'Ban',
        available: true,
        route: '/chain/bsc-testnet/blacklist',
      },
      {
        id: 'revoke-authority',
        name: 'Revoke Authority',
        description: 'Revoke token authorities',
        icon: 'Shield',
        available: true,
        route: '/chain/bsc-testnet/revoke',
      },
      {
        id: 'multisender',
        name: 'Multisender',
        description: 'Send tokens to multiple addresses',
        icon: 'Send',
        available: true,
        route: '/chain/bsc-testnet/multisend',
      },
    ],
    features: {
      standardToken: true,
      mintableToken: true,
      burnableToken: true,
      taxableToken: true,
      multisender: true,
      authorityManagement: true,
      freezeAccounts: true,
      metadata: false,
    },
  },
  'solana-testnet': {
    id: 'solana-testnet',
    displayName: 'Solana Testnet',
    icon: SiSolana,
    color: '#9945FF',
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    network: 'Testnet',
    explorer: 'https://explorer.solana.com?cluster=testnet',
    blockchainType: 'Solana',
    routes: {
      overview: '/chain/solana-testnet',
      create: '/chain/solana-testnet/create',
      manage: '/chain/solana-testnet/manage',
      tools: '/chain/solana-testnet/tools',
    },
    tools: [
      {
        id: 'create-token',
        name: 'Create Token',
        description: 'Deploy custom SPL tokens',
        icon: 'Coins',
        available: true,
        route: '/chain/solana-testnet/create',
      },
      {
        id: 'manage-tokens',
        name: 'Manage Tokens',
        description: 'View and manage deployed tokens',
        icon: 'Settings',
        available: true,
        route: '/chain/solana-testnet/manage',
      },
      {
        id: 'mint-tokens',
        name: 'Mint Tokens',
        description: 'Mint additional tokens',
        icon: 'Plus',
        available: true,
        route: '/chain/solana-testnet/mint',
      },
      {
        id: 'burn-tokens',
        name: 'Burn Tokens',
        description: 'Permanently burn tokens',
        icon: 'Flame',
        available: true,
        route: '/chain/solana-testnet/burn',
      },
      {
        id: 'freeze-account',
        name: 'Freeze Account',
        description: 'Freeze/unfreeze token accounts',
        icon: 'Snowflake',
        available: true,
        route: '/chain/solana-testnet/freeze',
      },
      {
        id: 'authority-tools',
        name: 'Authority Tools',
        description: 'Transfer/revoke authorities',
        icon: 'Shield',
        available: true,
        route: '/chain/solana-testnet/authority',
      },
      {
        id: 'update-metadata',
        name: 'Update Metadata',
        description: 'Update token metadata',
        icon: 'Image',
        available: true,
        route: '/chain/solana-testnet/metadata',
      },
      {
        id: 'multisender',
        name: 'Multisender',
        description: 'Send tokens to multiple addresses',
        icon: 'Send',
        available: true,
        route: '/chain/solana-testnet/multisend',
      },
    ],
    features: {
      standardToken: true,
      mintableToken: true,
      burnableToken: true,
      taxableToken: false,
      multisender: true,
      authorityManagement: true,
      freezeAccounts: true,
      metadata: true,
    },
  },
  'solana-mainnet': {
    id: 'solana-mainnet',
    displayName: 'Solana Mainnet',
    icon: SiSolana,
    color: '#9945FF',
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    network: 'Mainnet Beta',
    explorer: 'https://explorer.solana.com',
    blockchainType: 'Solana',
    routes: {
      overview: '/chain/solana-mainnet',
      create: '/chain/solana-mainnet/create',
      manage: '/chain/solana-mainnet/manage',
      tools: '/chain/solana-mainnet/tools',
    },
    tools: [
      {
        id: 'create-token',
        name: 'Create Token',
        description: 'Deploy custom SPL tokens',
        icon: 'Coins',
        available: true,
        route: '/chain/solana-mainnet/create',
      },
      {
        id: 'manage-tokens',
        name: 'Manage Tokens',
        description: 'View and manage deployed tokens',
        icon: 'Settings',
        available: true,
        route: '/chain/solana-mainnet/manage',
      },
      {
        id: 'mint-tokens',
        name: 'Mint Tokens',
        description: 'Mint additional tokens',
        icon: 'Plus',
        available: true,
        route: '/chain/solana-mainnet/mint',
      },
      {
        id: 'burn-tokens',
        name: 'Burn Tokens',
        description: 'Permanently burn tokens',
        icon: 'Flame',
        available: true,
        route: '/chain/solana-mainnet/burn',
      },
      {
        id: 'freeze-account',
        name: 'Freeze Account',
        description: 'Freeze/unfreeze token accounts',
        icon: 'Snowflake',
        available: true,
        route: '/chain/solana-mainnet/freeze',
      },
      {
        id: 'authority-tools',
        name: 'Authority Tools',
        description: 'Transfer/revoke authorities',
        icon: 'Shield',
        available: true,
        route: '/chain/solana-mainnet/authority',
      },
      {
        id: 'update-metadata',
        name: 'Update Metadata',
        description: 'Update token metadata',
        icon: 'Image',
        available: true,
        route: '/chain/solana-mainnet/metadata',
      },
      {
        id: 'multisender',
        name: 'Multisender',
        description: 'Send tokens to multiple addresses',
        icon: 'Send',
        available: true,
        route: '/chain/solana-mainnet/multisend',
      },
    ],
    features: {
      standardToken: true,
      mintableToken: true,
      burnableToken: true,
      taxableToken: false,
      multisender: true,
      authorityManagement: true,
      freezeAccounts: true,
      metadata: true,
    },
  },
};

export const SUPPORTED_CHAINS = Object.values(CHAIN_DEFINITIONS);

export function getChainConfig(chainId: string): ChainConfig | undefined {
  return CHAIN_DEFINITIONS[chainId as SharedChainId];
}

export function getChainType(chainId: string): 'evm' | 'solana' | null {
  const config = getChainConfig(chainId);
  if (!config) return null;
  return config.blockchainType === 'EVM' ? 'evm' : 'solana';
}

// Helper to get base chain name (e.g., 'ethereum-mainnet' -> 'ethereum')
export function getBaseChainName(chainId: SharedChainId): string {
  return chainId.split('-')[0];
}

// Helper to get all networks for a base chain
export function getChainNetworks(baseChain: 'ethereum' | 'bsc' | 'solana'): ChainConfig[] {
  return SUPPORTED_CHAINS.filter(chain => getBaseChainName(chain.id) === baseChain);
}
