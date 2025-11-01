import { useEvmWallet } from "@/contexts/EvmWalletContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, AlertCircle, Check, Loader2, Wifi, WifiOff } from "lucide-react";
import { NETWORK_CONFIGS } from "@/config/networks";
import { SiEthereum, SiBinance } from 'react-icons/si';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const chainIcons: Record<string, any> = {
  'ethereum': SiEthereum,
  'bsc': SiBinance,
  'sepolia': SiEthereum,
  'bsc-testnet': SiBinance,
};

export function NetworkSwitcher() {
  const { 
    chainId, 
    networkName, 
    isWrongNetwork, 
    targetChainId, 
    switchChain, 
    isConnected 
  } = useEvmWallet();
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  const handleNetworkSwitch = async (targetId: number) => {
    if (chainId === targetId) return;
    
    setIsSwitching(true);
    try {
      await switchChain(targetId);
      toast({
        title: "Network switched",
        description: `Successfully switched to ${NETWORK_CONFIGS[targetId]?.displayName}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to switch network",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  const currentNetwork = chainId ? NETWORK_CONFIGS[chainId] : null;
  const mainnetNetworks = Object.values(NETWORK_CONFIGS).filter(n => !n.isTestnet);
  const testnetNetworks = Object.values(NETWORK_CONFIGS).filter(n => n.isTestnet);
  const CurrentIcon = currentNetwork?.name ? chainIcons[currentNetwork.name] : null;

  return (
    <div className="flex items-center gap-2">
      {/* Network Status Indicator */}
      {isWrongNetwork && targetChainId && (
        <Badge 
          variant="destructive" 
          className="gap-1 animate-pulse"
          data-testid="badge-wrong-network"
        >
          <AlertCircle className="h-3 w-3" />
          Wrong Network
        </Badge>
      )}

      {/* Network Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 min-w-[140px] relative"
            disabled={isSwitching}
            data-testid="button-network-switcher"
          >
            {isSwitching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                {/* Connection Status Dot */}
                <div className="relative">
                  {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
                  <div className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                    isWrongNetwork ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`} />
                </div>
                
                {networkName || 'Unknown Network'}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[250px]">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Select Network
          </DropdownMenuLabel>
          
          {/* Mainnet Networks */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Mainnets
          </DropdownMenuLabel>
          {mainnetNetworks.map((network) => {
            const Icon = chainIcons[network.name];
            const isSelected = chainId === network.chainId;
            
            return (
              <DropdownMenuItem
                key={network.chainId}
                onClick={() => handleNetworkSwitch(network.chainId)}
                disabled={isSelected || isSwitching}
                className="gap-2 cursor-pointer"
                data-testid={`menu-item-network-${network.name}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <div className="flex flex-col">
                      <span className="text-sm">{network.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        ID: {network.chainId}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-green-500" />}
                </div>
              </DropdownMenuItem>
            );
          })}

          {/* Testnet Networks */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Testnets
          </DropdownMenuLabel>
          {testnetNetworks.map((network) => {
            const Icon = chainIcons[network.name];
            const isSelected = chainId === network.chainId;
            
            return (
              <DropdownMenuItem
                key={network.chainId}
                onClick={() => handleNetworkSwitch(network.chainId)}
                disabled={isSelected || isSwitching}
                className="gap-2 cursor-pointer"
                data-testid={`menu-item-network-${network.name}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 opacity-50" />}
                    <div className="flex flex-col">
                      <span className="text-sm">{network.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        ID: {network.chainId}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-green-500" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}