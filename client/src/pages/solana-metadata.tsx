import { useState } from 'react';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Image, Loader2, Wallet } from 'lucide-react';
import { useParams } from 'wouter';

import MainLayout from '@/components/MainLayout';
type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function SolanaUpdateMetadata() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { publicKey, isConnected } = useSolanaWallet();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [uri, setUri] = useState('');
  const [description, setDescription] = useState('');

  const handleUpdate = async () => {
    if (!isConnected || !publicKey) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    toast({
      title: 'Feature coming soon',
      description: 'Metadata update functionality will be available shortly',
    });
  };

  return (
    <MainLayout currentChainId={chainId}>
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Update Metadata
        </h1>
        <p className="text-gray-400">
          Update token name, symbol, and metadata URI
        </p>
      </div>

      <Card className="border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="h-5 w-5 text-purple-500" />
            Update Token Metadata
          </CardTitle>
          <CardDescription className="text-gray-400">
            Update your token's metadata information
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Token Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Token"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-name"
              />
            </div>
            <div>
              <Label htmlFor="symbol" className="text-white">Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="MTK"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-symbol"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="uri" className="text-white">Metadata URI (JSON)</Label>
            <Input
              id="uri"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="https://example.com/metadata.json"
              className="bg-gray-900 border-gray-700 text-white"
              data-testid="input-uri"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Token description..."
              className="bg-gray-900 border-gray-700 text-white"
              data-testid="input-description"
            />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading || !isConnected || !mintAddress}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            data-testid="button-update"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Metadata...
              </>
            ) : !isConnected ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Update Metadata
              </>
            ) : (
              <>
                <Image className="mr-2 h-4 w-4" />
                Update Metadata
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
    </MainLayout>
  );
}
