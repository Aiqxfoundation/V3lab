import type React from 'react';
import { useParams } from 'wouter';
import { CHAIN_DEFINITIONS } from '@/config/chains';
import type { ChainId } from '@shared/schema';

// Smart route wrapper that renders different components based on chain type
export function createChainAwareRoute(
  evmComponent: React.ComponentType,
  solanaComponent: React.ComponentType
) {
  return function ChainAwareRoute() {
    const params = useParams();
    const chainId = params.chainId as ChainId;
    
    const currentChain = CHAIN_DEFINITIONS[chainId];
    const isSolana = currentChain?.blockchainType === 'Solana';
    const Component = isSolana ? solanaComponent : evmComponent;
    
    return <Component />;
  };
}
