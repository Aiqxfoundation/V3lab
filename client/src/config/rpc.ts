export interface RPCConfig {
  mainnet: string;
  testnet: string;
  explorer: string;
}

const defaultRPCs = {
  ethereum: {
    mainnet: 'https://eth.llamarpc.com',
    testnet: 'https://rpc.sepolia.org',
    explorer: 'https://etherscan.io'
  },
  bsc: {
    mainnet: 'https://bsc-dataseed.binance.org',
    testnet: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://bscscan.com'
  },
  solana: {
    mainnet: '/api/solana-rpc/mainnet',
    testnet: '/api/solana-rpc/testnet',
    explorer: 'https://solscan.io'
  }
};

export function getRPCConfig(chain: string): RPCConfig {
  const envMainnet = import.meta.env[`VITE_${chain.toUpperCase()}_RPC_MAINNET`];
  const envTestnet = import.meta.env[`VITE_${chain.toUpperCase()}_RPC_TESTNET`];
  
  const config = defaultRPCs[chain as keyof typeof defaultRPCs] || defaultRPCs.ethereum;
  
  return {
    mainnet: envMainnet || config.mainnet,
    testnet: envTestnet || config.testnet,
    explorer: config.explorer
  };
}

export function getRPC(chain: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const config = getRPCConfig(chain);
  return network === 'mainnet' ? config.mainnet : config.testnet;
}
