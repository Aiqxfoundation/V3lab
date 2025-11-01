import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Coins, Check, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TokenAccount {
  mintAddress: string;
  balance: string;
  decimals: number;
  name?: string;
  symbol?: string;
  image?: string;
}

interface TokenSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: TokenAccount[];
  selectedMint: string;
  onSelectToken: (mintAddress: string) => void;
  loading?: boolean;
}

export function TokenSelectionModal({
  open,
  onOpenChange,
  tokens,
  selectedMint,
  onSelectToken,
  loading = false,
}: TokenSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    
    const query = searchQuery.toLowerCase();
    return tokens.filter(token => 
      token.mintAddress.toLowerCase().includes(query) ||
      token.name?.toLowerCase().includes(query) ||
      token.symbol?.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  const handleSelectToken = (mintAddress: string) => {
    onSelectToken(mintAddress);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-cyan-500" />
            Select Token
          </DialogTitle>
          <DialogDescription>
            Choose a token from your wallet to update its metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, symbol, or mint address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-token"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              <span className="ml-3 text-muted-foreground">Loading tokens...</span>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No tokens match your search' : 'No tokens found in your wallet'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredTokens.map((token) => (
                  <Button
                    key={token.mintAddress}
                    variant={selectedMint === token.mintAddress ? 'default' : 'outline'}
                    className="w-full justify-start h-auto p-4 hover:bg-accent/50 transition-colors"
                    onClick={() => handleSelectToken(token.mintAddress)}
                    data-testid={`button-select-token-${token.mintAddress}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {token.image ? (
                        <img 
                          src={token.image} 
                          alt={token.name || 'Token'} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                          <Coins className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1 text-left min-w-0">
                        {token.name && (
                          <p className="font-semibold text-sm truncate">{token.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {token.mintAddress}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Balance: {token.balance} {token.symbol && `• ${token.symbol}`}
                        </p>
                      </div>

                      {selectedMint === token.mintAddress && (
                        <Check className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
