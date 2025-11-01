import { createContext, useContext, useState, ReactNode } from 'react';
import { ChainId } from '@shared/schema';

interface ChainContextType {
  selectedChain: ChainId;
  setSelectedChain: (chain: ChainId) => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

// Migration map for old chain IDs to new network-specific IDs
const OLD_TO_NEW_CHAIN_ID: Record<string, ChainId> = {
  'ethereum': 'ethereum-mainnet',
  'bsc': 'bsc-mainnet',
  'solana': 'solana-mainnet',
};

// Valid chain IDs from shared schema
const VALID_CHAIN_IDS: ChainId[] = [
  'ethereum-mainnet',
  'ethereum-testnet',
  'bsc-mainnet',
  'bsc-testnet',
  'solana-devnet',
  'solana-testnet',
  'solana-mainnet',
];

function validateAndMigrateChainId(saved: string | null): ChainId {
  if (!saved) {
    return 'ethereum-mainnet'; // Default to ethereum mainnet
  }

  // Check if it's already a valid new chain ID
  if (VALID_CHAIN_IDS.includes(saved as ChainId)) {
    return saved as ChainId;
  }

  // Try to migrate from old chain ID
  if (OLD_TO_NEW_CHAIN_ID[saved]) {
    const migrated = OLD_TO_NEW_CHAIN_ID[saved];
    // Save the migrated value to localStorage
    localStorage.setItem('selectedChain', migrated);
    return migrated;
  }

  // If invalid, default to ethereum mainnet
  console.warn(`Invalid chain ID "${saved}" in localStorage, defaulting to ethereum-mainnet`);
  return 'ethereum-mainnet';
}

export function ChainProvider({ children }: { children: ReactNode }) {
  const [selectedChain, setSelectedChainState] = useState<ChainId>(() => {
    const saved = localStorage.getItem('selectedChain');
    return validateAndMigrateChainId(saved);
  });

  const setSelectedChain = (chain: ChainId) => {
    setSelectedChainState(chain);
    localStorage.setItem('selectedChain', chain);
  };

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error('useChain must be used within ChainProvider');
  }
  return context;
}

// Export ChainId type for convenience
export type { ChainId };
