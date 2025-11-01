import { useChain, ChainId } from '@/contexts/ChainContext';
import { CHAIN_DEFINITIONS } from '@/config/chains';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check } from "lucide-react";

// Group chains by family (Ethereum, BSC, Solana)
const CHAIN_FAMILIES = {
  ethereum: {
    label: 'Ethereum',
    chains: ['ethereum-mainnet', 'ethereum-testnet'] as ChainId[],
  },
  bsc: {
    label: 'Binance Smart Chain',
    chains: ['bsc-mainnet', 'bsc-testnet'] as ChainId[],
  },
  solana: {
    label: 'Solana',
    chains: ['solana-mainnet', 'solana-testnet', 'solana-devnet'] as ChainId[],
  },
};

export function ChainSwitcher() {
  const { selectedChain, setSelectedChain } = useChain();
  const [, setLocation] = useLocation();
  const currentChain = CHAIN_DEFINITIONS[selectedChain];

  if (!currentChain) {
    return null;
  }

  const handleChainSwitch = (chainId: ChainId) => {
    setSelectedChain(chainId);
    setLocation(`/chain/${chainId}`);
  };

  const Icon = currentChain.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 min-w-[160px]"
          data-testid="button-chain-switcher"
        >
          <Icon className="h-4 w-4" style={{ color: currentChain.color }} />
          <span className="hidden sm:inline">{currentChain.displayName}</span>
          <span className="sm:hidden">{currentChain.displayName.split(' ')[0]}</span>
          <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Select Blockchain & Network
        </DropdownMenuLabel>

        {Object.entries(CHAIN_FAMILIES).map(([familyId, family]) => (
          <div key={familyId}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-foreground">
              {family.label}
            </DropdownMenuLabel>
            
            {family.chains.map((chainId) => {
              const chain = CHAIN_DEFINITIONS[chainId];
              if (!chain) return null;
              
              const ChainIcon = chain.icon;
              const isSelected = selectedChain === chainId;
              const isMainnet = chainId.includes('mainnet');
              const isTestnet = chainId.includes('testnet');
              const isDevnet = chainId.includes('devnet');
              
              return (
                <DropdownMenuItem
                  key={chainId}
                  onClick={() => handleChainSwitch(chainId)}
                  disabled={isSelected}
                  className="gap-2 cursor-pointer"
                  data-testid={`menu-item-chain-${chainId}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <ChainIcon 
                        className="h-4 w-4" 
                        style={{ color: chain.color }}
                      />
                      <span className="text-sm">{chain.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isMainnet && (
                        <Badge variant="default" className="text-xs h-5 bg-green-600 hover:bg-green-700">
                          Mainnet
                        </Badge>
                      )}
                      {isTestnet && (
                        <Badge variant="secondary" className="text-xs h-5">
                          Testnet
                        </Badge>
                      )}
                      {isDevnet && (
                        <Badge variant="outline" className="text-xs h-5">
                          Devnet
                        </Badge>
                      )}
                      {isSelected && <Check className="h-4 w-4 text-green-500 ml-1" />}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
