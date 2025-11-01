export interface NetworkConfig {
  chainId: number;
  name: string;
  displayName: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer: string;
  isTestnet?: boolean;
}

export const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
  // Mainnet Networks
  1: {
    chainId: 1,
    name: 'ethereum',
    displayName: 'Ethereum Mainnet',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://ethereum.publicnode.com',
    blockExplorer: 'https://etherscan.io',
  },
  56: {
    chainId: 56,
    name: 'bsc',
    displayName: 'BNB Smart Chain',
    currency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
  },
  
  // Testnets
  11155111: {
    chainId: 11155111,
    name: 'sepolia',
    displayName: 'Sepolia Testnet',
    currency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
  97: {
    chainId: 97,
    name: 'bsc-testnet',
    displayName: 'BSC Testnet',
    currency: {
      name: 'Test BNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorer: 'https://testnet.bscscan.com',
    isTestnet: true,
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(NETWORK_CONFIGS).map(id => parseInt(id));

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return NETWORK_CONFIGS[chainId];
}

export function isChainSupported(chainId: number): boolean {
  return chainId in NETWORK_CONFIGS;
}

export async function addNetwork(chainId: number): Promise<void> {
  const network = NETWORK_CONFIGS[chainId];
  if (!network) {
    throw new Error('Unsupported network');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        chainName: network.displayName,
        nativeCurrency: network.currency,
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.blockExplorer],
      }],
    });
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the request');
    }
    throw error;
  }
}