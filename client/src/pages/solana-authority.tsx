import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { transferAuthority } from '@/utils/solanaTools';
import { revokeMintAuthority, revokeFreezeAuthority } from '@/utils/solanaAuthority';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams } from 'wouter';

type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function SolanaAuthorityTools() {
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
  
  const [transferMint, setTransferMint] = useState('');
  const [transferType, setTransferType] = useState<'mint' | 'freeze'>('mint');
  const [newAuthority, setNewAuthority] = useState('');
  
  const [revokeMint, setRevokeMint] = useState('');
  const [revokeType, setRevokeType] = useState<'mint' | 'freeze'>('mint');

  const handleTransfer = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const signature = await transferAuthority(
        connection,
        new PublicKey(publicKey),
        transferMint,
        newAuthority,
        transferType,
        signTransaction
      );

      toast({
        title: 'Authority transferred!',
        description: `Transferred ${transferType} authority. Signature: ${signature.slice(0, 8)}...`,
      });

      setTransferMint('');
      setNewAuthority('');
    } catch (error: any) {
      toast({
        title: 'Transfer failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const revokeFn = revokeType === 'mint' ? revokeMintAuthority : revokeFreezeAuthority;
      const signature = await revokeFn(
        connection,
        new PublicKey(publicKey),
        revokeMint,
        signTransaction
      );

      toast({
        title: 'Authority revoked!',
        description: `Revoked ${revokeType} authority. Signature: ${signature.slice(0, 8)}...`,
      });

      setRevokeMint('');
    } catch (error: any) {
      toast({
        title: 'Revoke failed',
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
          Authority Tools
        </h1>
        <p className="text-gray-400">
          Transfer or revoke token authorities
        </p>
      </div>

      <div className="space-y-6">
        <Alert className="border-yellow-800 bg-yellow-900/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            Warning: Authority operations are permanent. Make sure you understand the implications before proceeding.
          </AlertDescription>
        </Alert>

        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-500" />
              Transfer Authority
            </CardTitle>
            <CardDescription className="text-gray-400">
              Transfer token authority to another address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transfer-mint" className="text-white">Token Mint Address</Label>
              <Input
                id="transfer-mint"
                value={transferMint}
                onChange={(e) => setTransferMint(e.target.value)}
                placeholder="Enter token mint address"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-transfer-mint"
              />
            </div>

            <div>
              <Label htmlFor="authority-type" className="text-white">Authority Type</Label>
              <Select value={transferType} onValueChange={(v: any) => setTransferType(v)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white" data-testid="select-transfer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mint">Mint Authority</SelectItem>
                  <SelectItem value="freeze">Freeze Authority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new-authority" className="text-white">New Authority Address</Label>
              <Input
                id="new-authority"
                value={newAuthority}
                onChange={(e) => setNewAuthority(e.target.value)}
                placeholder="Enter new authority address"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-new-authority"
              />
            </div>

            <Button
              onClick={handleTransfer}
              disabled={loading || !isConnected || !transferMint || !newAuthority}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
              data-testid="button-transfer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring Authority...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet to Transfer Authority
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Transfer Authority
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Revoke Authority
            </CardTitle>
            <CardDescription className="text-gray-400">
              Permanently revoke token authority (irreversible)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="revoke-mint" className="text-white">Token Mint Address</Label>
              <Input
                id="revoke-mint"
                value={revokeMint}
                onChange={(e) => setRevokeMint(e.target.value)}
                placeholder="Enter token mint address"
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-revoke-mint"
              />
            </div>

            <div>
              <Label htmlFor="revoke-type" className="text-white">Authority Type</Label>
              <Select value={revokeType} onValueChange={(v: any) => setRevokeType(v)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white" data-testid="select-revoke-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mint">Mint Authority</SelectItem>
                  <SelectItem value="freeze">Freeze Authority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleRevoke}
              disabled={loading || !isConnected || !revokeMint}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
              data-testid="button-revoke"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking Authority...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet to Revoke Authority
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Revoke Authority (Permanent)
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
