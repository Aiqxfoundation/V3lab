import { useEffect, useRef } from 'react';
import { useChain } from '@/contexts/ChainContext';
import { useEvmWallet } from '@/contexts/EvmWalletContext';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { useToast } from '@/hooks/use-toast';

export function ChainSwitchHandler() {
  const { selectedChain } = useChain();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const { toast } = useToast();
  const prevChainTypeRef = useRef<'evm' | 'solana' | null>(null);

  useEffect(() => {
    const currentChainType = selectedChain === 'solana' ? 'solana' : 'evm';
    const prevChainType = prevChainTypeRef.current;

    if (prevChainType && prevChainType !== currentChainType) {
      // Auto-disconnect wallet when switching between different chain types
      if (prevChainType === 'evm' && evmWallet.isConnected) {
        try {
          evmWallet.disconnect();
          console.log('EVM wallet disconnected due to chain switch');
        } catch (error) {
          console.error('Error disconnecting EVM wallet:', error);
          toast({
            title: "Wallet Disconnect Error",
            description: "Failed to disconnect EVM wallet. Please disconnect manually.",
            variant: "destructive",
          });
        }
      } else if (prevChainType === 'solana' && solanaWallet.isConnected) {
        // Solana disconnect is async, handle it properly
        solanaWallet.disconnect()
          .then(() => {
            console.log('Solana wallet disconnected due to chain switch');
          })
          .catch((error: any) => {
            console.error('Error disconnecting Solana wallet:', error);
            toast({
              title: "Wallet Disconnect Error",
              description: "Failed to disconnect Solana wallet. Please disconnect manually.",
              variant: "destructive",
            });
          });
      }
    }

    prevChainTypeRef.current = currentChainType;
  }, [selectedChain, evmWallet, solanaWallet, toast]);

  return null;
}
