import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { multisendTokens } from '@/utils/solanaTools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { Send, Loader2, Wallet, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams } from 'wouter';

type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function SolanaMultisender() {
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
  const [decimals, setDecimals] = useState('9');
  const [recipients, setRecipients] = useState('');

  const handleMultisend = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const lines = recipients.trim().split('\n');
      const recipientList = lines.map(line => {
        const [address, amount] = line.split(',').map(s => s.trim());
        return { address, amount: parseFloat(amount) };
      });

      if (recipientList.some(r => !r.address || isNaN(r.amount))) {
        throw new Error('Invalid recipient format. Use: address,amount per line');
      }

      const signature = await multisendTokens(
        connection,
        new PublicKey(publicKey),
        mintAddress,
        recipientList,
        parseInt(decimals),
        signTransaction
      );

      toast({
        title: 'Multisend successful!',
        description: `Sent tokens to ${recipientList.length} recipients. Signature: ${signature.slice(0, 8)}...`,
      });

      setMintAddress('');
      setRecipients('');
    } catch (error: any) {
      toast({
        title: 'Multisend failed',
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
          Multisender
        </h1>
        <p className="text-gray-400">
          Send tokens to multiple recipients in a single transaction
        </p>
      </div>

      <div className="space-y-6">
        <Alert className="border-blue-800 bg-blue-900/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-200">
            Enter one recipient per line in the format: address,amount
            <br />
            Example: 7xKXt...abc123,100
          </AlertDescription>
        </Alert>

        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-cyan-500" />
              Send to Multiple Recipients
            </CardTitle>
            <CardDescription className="text-gray-400">
              Batch send tokens to save on transaction fees
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
              <Label htmlFor="decimals" className="text-white">Token Decimals</Label>
              <Input
                id="decimals"
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-decimals"
              />
            </div>

            <div>
              <Label htmlFor="recipients" className="text-white">Recipients (address,amount per line)</Label>
              <Textarea
                id="recipients"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100&#10;8yHbTN3ZqL98e32MxFJKLpQs4jKheTqB94UASvKtbCsV,250"
                rows={8}
                className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                data-testid="input-recipients"
              />
            </div>

            <Button
              onClick={handleMultisend}
              disabled={loading || !isConnected || !mintAddress || !recipients}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
              data-testid="button-multisend"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending to Recipients...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet to Send
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to All Recipients
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  );
}
