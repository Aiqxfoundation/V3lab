import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Network, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type ChainId } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface SolanaNetworkSwitcherProps {
  currentNetwork: ChainId;
  onNetworkChange: (network: ChainId) => void;
  isConnected: boolean;
}

const NETWORK_LABELS: Record<string, { name: string; color: string }> = {
  'solana-testnet': { name: 'Testnet', color: 'bg-yellow-500' },
  'solana-mainnet': { name: 'Mainnet-Beta', color: 'bg-green-500' },
};

export function SolanaNetworkSwitcher({ currentNetwork, onNetworkChange, isConnected }: SolanaNetworkSwitcherProps) {
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState<ChainId>(currentNetwork);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const currentNetworkInfo = NETWORK_LABELS[currentNetwork];

  const handleNetworkSwitch = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (selectedNetwork === currentNetwork) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);

    try {
      // Try to switch network via wallet
      const wallet = window.solana || window.phantom;
      
      if (wallet?.isPhantom && wallet.request) {
        try {
          await wallet.request({
            method: 'wallet_switchNetwork',
            params: { network: selectedNetwork.replace('solana-', '') },
          });
          
          toast({
            title: '✅ Network Switched',
            description: `Switched to ${NETWORK_LABELS[selectedNetwork].name}`,
          });
          
          onNetworkChange(selectedNetwork);
          setIsOpen(false);
        } catch (error: any) {
          // Phantom doesn't support automatic switching, user needs to do it manually
          toast({
            title: '⚠️ Manual Switch Required',
            description: `Please switch to ${NETWORK_LABELS[selectedNetwork].name} in your Phantom wallet settings`,
            variant: 'default',
          });
          
          // Still update the UI to show the selected network
          onNetworkChange(selectedNetwork);
          setIsOpen(false);
        }
      } else {
        // For non-Phantom wallets, just update the selection
        toast({
          title: '⚠️ Manual Switch Required',
          description: `Please switch to ${NETWORK_LABELS[selectedNetwork].name} in your wallet settings`,
        });
        
        onNetworkChange(selectedNetwork);
        setIsOpen(false);
      }
    } catch (error: any) {
      toast({
        title: 'Switch Failed',
        description: error.message || 'Failed to switch network',
        variant: 'destructive',
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card 
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          data-testid="button-network-switcher"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${currentNetworkInfo.color} animate-pulse`} />
              <div>
                <p className="text-sm text-muted-foreground">Current Network</p>
                <p className="font-semibold text-lg">{currentNetworkInfo.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-switch-network">
              <RefreshCw className="w-4 h-4 mr-2" />
              Switch
            </Button>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Switch Solana Network
          </DialogTitle>
          <DialogDescription>
            Select the network you want to use for deploying your token
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {(['solana-testnet', 'solana-mainnet'] as ChainId[]).map((network) => {
            const info = NETWORK_LABELS[network];
            const isSelected = selectedNetwork === network;
            const isCurrent = currentNetwork === network;
            
            return (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                data-testid={`option-network-${network}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${info.color}`} />
                    <div>
                      <p className="font-semibold">{info.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {network === 'solana-testnet' && 'Public testing environment'}
                        {network === 'solana-mainnet' && 'Production network (real SOL)'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedNetwork === 'solana-mainnet' && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-500">Mainnet Warning</p>
              <p className="text-muted-foreground">
                You're switching to Mainnet. Transactions will use real SOL.
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            onClick={handleNetworkSwitch} 
            disabled={isSwitching || selectedNetwork === currentNetwork}
            className="w-full"
            data-testid="button-confirm-switch"
          >
            {isSwitching ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Switching...
              </>
            ) : selectedNetwork === currentNetwork ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Already on {NETWORK_LABELS[selectedNetwork].name}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Switch to {NETWORK_LABELS[selectedNetwork].name}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
