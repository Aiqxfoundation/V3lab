import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useEvmWallet, type EvmWalletProvider } from "@/contexts/EvmWalletContext";
import { useSolanaWallet, type WalletProvider } from "@/contexts/SolanaWalletContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletIcons } from "./wallet-icons";

type ChainType = 'evm' | 'solana';

interface UnifiedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainType: ChainType;
}

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof WalletIcons;
  installUrl?: string;
  isAvailable: boolean;
}

export function UnifiedWalletModal({ isOpen, onClose, chainType }: UnifiedWalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const { toast } = useToast();

  const evmWallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Most popular EVM wallet',
      icon: 'MetaMask',
      installUrl: 'https://metamask.io/download/',
      isAvailable: evmWallet.availableWallets.some(w => w.provider === 'metamask'),
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      description: 'Secure multi-chain wallet',
      icon: 'TrustWallet',
      installUrl: 'https://trustwallet.com/download',
      isAvailable: evmWallet.availableWallets.some(w => w.provider === 'trustwallet'),
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      description: 'Multi-chain Web3 wallet',
      icon: 'OKX',
      installUrl: 'https://www.okx.com/web3',
      isAvailable: evmWallet.availableWallets.some(w => w.provider === 'okx'),
    },
    {
      id: 'bitget',
      name: 'Bitget Wallet',
      description: 'Professional trading wallet',
      icon: 'Bitget',
      installUrl: 'https://web3.bitget.com/en/wallet-download',
      isAvailable: evmWallet.availableWallets.some(w => w.provider === 'bitget'),
    },
    {
      id: 'binance',
      name: 'Binance Wallet',
      description: 'Binance Web3 wallet',
      icon: 'Binance',
      installUrl: 'https://www.binance.com/en/web3wallet',
      isAvailable: evmWallet.availableWallets.some(w => w.provider === 'binance'),
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      description: 'Self-custody wallet from Coinbase',
      icon: 'Coinbase',
      installUrl: 'https://www.coinbase.com/wallet/downloads',
      isAvailable: evmWallet.availableWallets.some(w => w.provider === 'coinbase'),
    },
  ];

  const solanaWallets: WalletOption[] = [
    {
      id: 'phantom',
      name: 'Phantom',
      description: 'Most popular Solana wallet',
      icon: 'Phantom',
      installUrl: 'https://phantom.app/download',
      isAvailable: solanaWallet.availableWallets.includes('phantom'),
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      description: 'Multi-chain wallet with great UX',
      icon: 'OKX',
      installUrl: 'https://www.okx.com/web3',
      isAvailable: solanaWallet.availableWallets.includes('okx'),
    },
    {
      id: 'solflare',
      name: 'Solflare',
      description: 'Powerful Solana wallet',
      icon: 'Solflare',
      installUrl: 'https://solflare.com/download',
      isAvailable: solanaWallet.availableWallets.includes('solflare'),
    },
    {
      id: 'backpack',
      name: 'Backpack',
      description: 'Modern wallet for Solana',
      icon: 'Backpack',
      installUrl: 'https://backpack.app/downloads',
      isAvailable: solanaWallet.availableWallets.includes('backpack'),
    },
  ];

  const wallets = chainType === 'evm' ? evmWallets : solanaWallets;
  const availableCount = wallets.filter(w => w.isAvailable).length;

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setConnectingWallet(walletId);

    try {
      if (chainType === 'evm') {
        const wallet = evmWallets.find(w => w.id === walletId);
        if (!wallet?.isAvailable) {
          if (wallet?.installUrl) {
            window.open(wallet.installUrl, '_blank');
          }
          throw new Error(`Please install ${wallet?.name || 'wallet'} first`);
        }
        await evmWallet.connect(walletId as EvmWalletProvider);
        toast({
          title: "Wallet connected",
          description: `Successfully connected to ${wallet.name}`,
        });
      } else {
        const wallet = solanaWallets.find(w => w.id === walletId);
        if (!wallet?.isAvailable) {
          if (wallet?.installUrl) {
            window.open(wallet.installUrl, '_blank');
          }
          throw new Error(`Please install ${wallet?.name || 'wallet'} first`);
        }
        await solanaWallet.connect(walletId as WalletProvider);
        toast({
          title: "Wallet connected",
          description: `Successfully connected to ${wallet.name}`,
        });
      }
      onClose();
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const handleInstall = (installUrl: string) => {
    window.open(installUrl, '_blank');
  };

  const Icon = (props: { name: keyof typeof WalletIcons }) => {
    const IconComponent = WalletIcons[props.name];
    return <IconComponent />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800" data-testid="dialog-unified-wallet">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon name={chainType === 'evm' ? 'MetaMask' : 'Phantom'} />
            Connect {chainType === 'evm' ? 'EVM' : 'Solana'} Wallet
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {availableCount > 0 
              ? `${availableCount} wallet${availableCount > 1 ? 's' : ''} detected. Choose one to connect.`
              : 'No wallets detected. Install a wallet to get started.'}
          </DialogDescription>
        </DialogHeader>

        {availableCount === 0 && (
          <Alert className="bg-amber-900/20 border-amber-500/50">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm text-amber-200">
              No {chainType === 'evm' ? 'EVM' : 'Solana'} wallet detected. Please install a wallet extension to continue.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 mt-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="group relative">
              {wallet.isAvailable ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 h-auto p-4 hover:border-[#00d4ff] hover:bg-[#00d4ff]/5 transition-all bg-gray-800 border-gray-700 text-white"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                  data-testid={`button-wallet-${wallet.id}`}
                >
                  <div className="h-10 w-10 flex items-center justify-center">
                    <Icon name={wallet.icon} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">{wallet.name}</p>
                    <p className="text-sm text-gray-400">{wallet.description}</p>
                  </div>
                  {isConnecting && connectingWallet === wallet.id && (
                    <Loader2 className="h-5 w-5 animate-spin text-[#00d4ff]" />
                  )}
                </Button>
              ) : (
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-4 h-auto p-4 opacity-50 cursor-not-allowed bg-gray-800/50 border-gray-700"
                    disabled
                    data-testid={`button-wallet-${wallet.id}-unavailable`}
                  >
                    <div className="h-10 w-10 flex items-center justify-center grayscale opacity-50">
                      <Icon name={wallet.icon} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-500">{wallet.name}</p>
                      <p className="text-sm text-gray-600">Not installed</p>
                    </div>
                  </Button>
                  {wallet.installUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 gap-1 text-[#00d4ff] hover:text-[#00b8e6] hover:bg-[#00d4ff]/10"
                      onClick={() => handleInstall(wallet.installUrl!)}
                      data-testid={`button-install-${wallet.id}`}
                    >
                      Install
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-center text-gray-500">
            By connecting a wallet, you agree to the Terms of Service
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
