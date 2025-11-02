import { useState, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { getWalletTokens, type WalletToken } from '@/utils/solanaTools';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Coins, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TokenPickerProps {
  connection: Connection;
  walletAddress: string;
  onSelectToken: (mintAddress: string) => void;
  selectedMint?: string;
}

export function TokenPicker({ connection, walletAddress, onSelectToken, selectedMint }: TokenPickerProps) {
  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const walletTokens = await getWalletTokens(connection, walletPubkey);
      
      if (walletTokens.length === 0) {
        setError('No tokens found in your wallet');
      }
      
      setTokens(walletTokens);
    } catch (err: any) {
      console.error('Error fetching tokens:', err);
      setError('Failed to fetch tokens from wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchTokens();
    }
  }, [walletAddress]);

  if (loading) {
    return (
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
          <span className="ml-2 text-gray-400">Loading your tokens...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchTokens}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              data-testid="button-retry-fetch-tokens"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="py-6 text-center">
          <Coins className="h-8 w-8 mx-auto mb-2 text-gray-600" />
          <p className="text-gray-400">No tokens found in your wallet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-white">Select Token from Wallet</label>
        <Button
          onClick={fetchTokens}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-400 hover:text-white"
          data-testid="button-refresh-tokens"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[200px] rounded-md border border-gray-800 bg-gray-900/50">
        <div className="p-2 space-y-2">
          {tokens.map((token) => (
            <button
              key={token.mintAddress}
              onClick={() => onSelectToken(token.mintAddress)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedMint === token.mintAddress
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
              }`}
              data-testid={`button-token-${token.mintAddress}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-white truncate">
                    {token.mintAddress.slice(0, 8)}...{token.mintAddress.slice(-8)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Balance: {parseFloat(token.balance).toLocaleString()} tokens
                  </p>
                </div>
                {selectedMint === token.mintAddress && (
                  <div className="ml-2 h-2 w-2 rounded-full bg-cyan-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
