import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { revokeMintAuthority, revokeFreezeAuthority, revokeUpdateAuthority } from '@/utils/solanaAuthority';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParams } from 'wouter';
import { TokenPicker } from '@/components/TokenPicker';

type SolanaNetwork = 'testnet' | 'mainnet-beta';
type AuthorityType = 'mint' | 'freeze' | 'update';

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
  
  const [revokeMint, setRevokeMint] = useState('');
  const [revokeType, setRevokeType] = useState<AuthorityType>('mint');

  const handleRevoke = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      let signature: string;
      const authorityPubkey = new PublicKey(publicKey);
      
      if (revokeType === 'mint') {
        signature = await revokeMintAuthority(connection, revokeMint, authorityPubkey, signTransaction);
      } else if (revokeType === 'freeze') {
        signature = await revokeFreezeAuthority(connection, revokeMint, authorityPubkey, signTransaction);
      } else {
        signature = await revokeUpdateAuthority(connection, revokeMint, authorityPubkey, signTransaction);
      }

      toast({
        title: 'Authority revoked!',
        description: `Revoked ${revokeType} authority permanently. Signature: ${signature.slice(0, 8)}...`,
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

  const connection = getSolanaConnection(network);

  return (
    <MainLayout currentChainId={chainId}>
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Revoke Authority
        </h1>
        <p className="text-gray-400">
          Permanently revoke token authorities to increase trust and security
        </p>
      </div>

      <div className="space-y-6">
        <Alert className="border-yellow-800 bg-yellow-900/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            Warning: Revoking authority is PERMANENT and IRREVERSIBLE! Make sure you understand the implications before proceeding.
          </AlertDescription>
        </Alert>

        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Revoke Authority
            </CardTitle>
            <CardDescription className="text-gray-400">
              Permanently revoke mint, freeze, or update authority (irreversible)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected && publicKey ? (
              <TokenPicker
                connection={connection}
                walletAddress={publicKey}
                onSelectToken={setRevokeMint}
                selectedMint={revokeMint}
              />
            ) : (
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-900/50 text-center">
                <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-400">Connect your wallet to see your tokens</p>
              </div>
            )}

            <div>
              <label htmlFor="revoke-type" className="text-sm font-medium text-white mb-2 block">Authority Type</label>
              <Select value={revokeType} onValueChange={(v: AuthorityType) => setRevokeType(v)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white" data-testid="select-revoke-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mint">Mint Authority</SelectItem>
                  <SelectItem value="freeze">Freeze Authority</SelectItem>
                  <SelectItem value="update">Update Authority</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                {revokeType === 'mint' && 'Prevents creating new tokens - establishes fixed supply'}
                {revokeType === 'freeze' && 'Removes ability to freeze token accounts - required for exchange listings'}
                {revokeType === 'update' && 'Locks token metadata permanently - name, symbol, and logo cannot be changed'}
              </p>
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
                  Revoke {revokeType.charAt(0).toUpperCase() + revokeType.slice(1)} Authority (Permanent)
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
