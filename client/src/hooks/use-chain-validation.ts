import { useEffect } from 'react';
import { useEvmWallet } from '@/contexts/EvmWalletContext';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_CHAINS, type ChainId } from '@shared/schema';

export function useChainValidation(requiredChainId?: ChainId, onWrongNetwork?: () => void) {
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (!requiredChainId) return;

    const chainInfo = SUPPORTED_CHAINS[requiredChainId];
    if (!chainInfo) return;

    // EVM chain validation
    if (chainInfo.blockchainType === 'EVM' && evmWallet.isConnected) {
      const requiredChainIdNumber = chainInfo.chainId;
      
      if (evmWallet.chainId !== requiredChainIdNumber) {
        toast({
          title: 'Wrong Network',
          description: `Please switch to ${chainInfo.name} in your wallet`,
          variant: 'destructive',
        });
        
        if (onWrongNetwork) {
          onWrongNetwork();
        }
      }
    }

    // Solana validation (network-level validation)
    if (chainInfo.blockchainType === 'Solana' && solanaWallet.isConnected) {
      // For Solana, we validate network type in the deployment logic
      // This hook primarily validates that the correct chain type is selected
    }
  }, [requiredChainId, evmWallet.chainId, evmWallet.isConnected, solanaWallet.isConnected, toast, onWrongNetwork]);
}

export function getRequiredChainId(chainId: string): number | null {
  const chainInfo = SUPPORTED_CHAINS[chainId as ChainId];
  return chainInfo?.chainId ?? null;
}

export function isCorrectNetwork(chainId: ChainId, connectedChainId: number | null): boolean {
  const chainInfo = SUPPORTED_CHAINS[chainId];
  if (!chainInfo) return false;
  if (chainInfo.blockchainType !== 'EVM') return true; // Solana doesn't have chain ID validation
  return chainInfo.chainId === connectedChainId;
}
