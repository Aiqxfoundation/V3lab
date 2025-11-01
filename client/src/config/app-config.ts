export interface AppConfiguration {
  ipfs: {
    provider: 'pinata' | 'none';
    apiKey?: string;
    secretKey?: string;
  };
  blockchain: {
    alchemyApiKey?: string;
    ethereumRpcUrl?: string;
    bscRpcUrl?: string;
    polygonRpcUrl?: string;
    solanaRpcUrl?: string;
  };
  app: {
    environment: 'development' | 'production';
    port: number;
  };
}

export function getAppConfiguration(): AppConfiguration {
  return {
    ipfs: {
      provider: import.meta.env.VITE_PINATA_API_KEY ? 'pinata' : 'none',
      apiKey: import.meta.env.VITE_PINATA_API_KEY,
      secretKey: import.meta.env.VITE_PINATA_SECRET_KEY,
    },
    blockchain: {
      alchemyApiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      ethereumRpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL,
      bscRpcUrl: import.meta.env.VITE_BSC_RPC_URL,
      polygonRpcUrl: import.meta.env.VITE_POLYGON_RPC_URL,
      solanaRpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
    },
    app: {
      environment: (import.meta.env.MODE as 'development' | 'production') || 'development',
      port: parseInt(import.meta.env.VITE_PORT || '5000'),
    },
  };
}

export function isFeatureEnabled(feature: 'ipfs' | 'alchemy'): boolean {
  const config = getAppConfiguration();

  switch (feature) {
    case 'ipfs':
      return config.ipfs.provider === 'pinata' && !!(config.ipfs.apiKey && config.ipfs.secretKey);
    case 'alchemy':
      return !!config.blockchain.alchemyApiKey;
    default:
      return false;
  }
}

export function getConfigurationStatus(): {
  configured: boolean;
  missing: string[];
  optional: string[];
} {
  const config = getAppConfiguration();
  const missing: string[] = [];
  const optional: string[] = [];

  if (!config.ipfs.apiKey || !config.ipfs.secretKey) {
    optional.push('Pinata IPFS (for metadata storage)');
  }

  if (!config.blockchain.alchemyApiKey) {
    optional.push('Alchemy API (for enhanced RPC endpoints)');
  }

  return {
    configured: missing.length === 0,
    missing,
    optional,
  };
}
