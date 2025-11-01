import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { mintTokens } from '@/utils/solanaTools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Wallet } from 'lucide-react';
import { useParams } from 'wouter';
import MainLayout from '@/components/MainLayout';

type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function SolanaMintTokens() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { publicKey, isConnected, signTransaction } = useSolanaWallet();
  const { toast } = useToast();
  
  const getNetworkFromChainId = (id: string): SolanaNetwork => {
    if (id?.includes('testnet')) return 'testnet';
    if (id?.includes('mainnet')) return 'mainnet-beta';
    return 'testnet';
  };
  
  const network = getNetworkFromChainId(chainId);
  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals, setDecimals] = useState('9');

  const handleMint = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const signature = await mintTokens(
        connection,
        new PublicKey(publicKey),
        mintAddress,
        destination,
        parseFloat(amount),
        parseInt(decimals),
        signTransaction
      );

      toast({
        title: 'Tokens minted successfully!',
        description: `Minted ${amount} tokens. Signature: ${signature.slice(0, 8)}...`,
      });

      setMintAddress('');
      setDestination('');
      setAmount('');
    } catch (error: any) {
      toast({
        title: 'Mint failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout currentChainId={chainId}>
      <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Mint Tokens
        </h1>
        <p className="text-gray-400">
          Mint additional tokens to any account
        </p>
      </div>

      <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-500" />
              Mint Tokens
            </CardTitle>
            <CardDescription className="text-gray-400">
              Mint additional tokens (requires mint authority)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mint-address" className="text-white">Token Mint Address</Label>
              <Input
                id="mint-address"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Enter token mint address"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-mint-address"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-white">Destination Address</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination wallet address"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-destination"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-white">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-gray-900 border-gray-700 text-white"
                  data-testid="input-amount"
                />
              </div>
              <div>
                <Label htmlFor="decimals" className="text-white">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  data-testid="input-decimals"
                />
              </div>
            </div>

            <Button
              onClick={handleMint}
              disabled={loading || !mintAddress || !destination || !amount || !isConnected}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
              data-testid="button-mint"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting Tokens...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet to Mint
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Mint Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
