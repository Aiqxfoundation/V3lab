import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { freezeTokenAccount, unfreezeTokenAccount } from '@/utils/solanaTools';
import { getTokenAuthorities } from '@/utils/solanaAuthority';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { Snowflake, Loader2, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useParams } from 'wouter';
import { SolanaTokenPicker } from '@/components/SolanaTokenPicker';

type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function SolanaFreezeAccount() {
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
  const [checkingAuthority, setCheckingAuthority] = useState(false);
  const [mintAddress, setMintAddress] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [freezeAuthority, setFreezeAuthority] = useState<string | null>(null);
  const [hasFreezeAuthority, setHasFreezeAuthority] = useState(false);

  useEffect(() => {
    const checkFreezeAuthority = async () => {
      if (!mintAddress || !publicKey) {
        setFreezeAuthority(null);
        setHasFreezeAuthority(false);
        return;
      }

      try {
        setCheckingAuthority(true);
        const connection = getSolanaConnection(network);
        const authorities = await getTokenAuthorities(connection, mintAddress);
        setFreezeAuthority(authorities.freezeAuthority);
        setHasFreezeAuthority(
          authorities.freezeAuthority?.toLowerCase() === publicKey.toLowerCase()
        );
      } catch (error) {
        console.error('Error checking freeze authority:', error);
        setFreezeAuthority(null);
        setHasFreezeAuthority(false);
      } finally {
        setCheckingAuthority(false);
      }
    };

    checkFreezeAuthority();
  }, [mintAddress, publicKey, network]);

  const handleFreeze = async (action: 'freeze' | 'unfreeze') => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    if (!hasFreezeAuthority) {
      toast({
        title: 'No freeze authority',
        description: 'You do not have freeze authority for this token',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const freezeFn = action === 'freeze' ? freezeTokenAccount : unfreezeTokenAccount;
      const signature = await freezeFn(
        connection,
        new PublicKey(publicKey),
        mintAddress,
        accountAddress,
        signTransaction
      );

      toast({
        title: `Account ${action}d successfully!`,
        description: `Signature: ${signature.slice(0, 8)}...`,
      });

      setAccountAddress('');
    } catch (error: any) {
      toast({
        title: `${action} failed`,
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
          Freeze Account
        </h1>
        <p className="text-gray-400">
          Freeze or unfreeze token accounts (requires freeze authority)
        </p>
      </div>

      <Card className="border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Freeze/Unfreeze Account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control token account freeze status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="freeze" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="freeze">Freeze</TabsTrigger>
              <TabsTrigger value="unfreeze">Unfreeze</TabsTrigger>
            </TabsList>
            
            <TabsContent value="freeze" className="space-y-4">
              <SolanaTokenPicker
                value={mintAddress}
                onChange={setMintAddress}
                label="Token Mint Address"
                placeholder="Enter or select token mint address"
                publicKey={publicKey}
                network={network}
                testId="input-freeze-mint"
              />

              {mintAddress && (
                <Alert className={hasFreezeAuthority ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}>
                  {hasFreezeAuthority ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className={hasFreezeAuthority ? 'text-green-200' : 'text-red-200'}>
                    {checkingAuthority ? (
                      'Checking freeze authority...'
                    ) : hasFreezeAuthority ? (
                      'You have freeze authority for this token'
                    ) : freezeAuthority ? (
                      `Freeze authority: ${freezeAuthority.slice(0, 8)}...${freezeAuthority.slice(-8)}`
                    ) : (
                      'No freeze authority set for this token'
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="freeze-account" className="text-white">Holder Wallet Address or Token Account</Label>
                <Input
                  id="freeze-account"
                  value={accountAddress}
                  onChange={(e) => setAccountAddress(e.target.value)}
                  placeholder="Enter wallet address or token account address"
                  className="bg-gray-900 border-gray-700 text-white"
                  data-testid="input-freeze-account"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You can enter either the holder's wallet address or their specific token account address
                </p>
              </div>

              <Button
                onClick={() => handleFreeze('freeze')}
                disabled={loading || !isConnected || !mintAddress || !accountAddress || !hasFreezeAuthority}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                data-testid="button-freeze"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Freezing Account...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Freeze
                  </>
                ) : (
                  <>
                    <Snowflake className="mr-2 h-4 w-4" />
                    Freeze Account
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="unfreeze" className="space-y-4">
              <SolanaTokenPicker
                value={mintAddress}
                onChange={setMintAddress}
                label="Token Mint Address"
                placeholder="Enter or select token mint address"
                publicKey={publicKey}
                network={network}
                testId="input-unfreeze-mint"
              />

              {mintAddress && (
                <Alert className={hasFreezeAuthority ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}>
                  {hasFreezeAuthority ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className={hasFreezeAuthority ? 'text-green-200' : 'text-red-200'}>
                    {checkingAuthority ? (
                      'Checking freeze authority...'
                    ) : hasFreezeAuthority ? (
                      'You have freeze authority for this token'
                    ) : freezeAuthority ? (
                      `Freeze authority: ${freezeAuthority.slice(0, 8)}...${freezeAuthority.slice(-8)}`
                    ) : (
                      'No freeze authority set for this token'
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="unfreeze-account" className="text-white">Holder Wallet Address or Token Account</Label>
                <Input
                  id="unfreeze-account"
                  value={accountAddress}
                  onChange={(e) => setAccountAddress(e.target.value)}
                  placeholder="Enter wallet address or token account address"
                  className="bg-gray-900 border-gray-700 text-white"
                  data-testid="input-unfreeze-account"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You can enter either the holder's wallet address or their specific token account address
                </p>
              </div>

              <Button
                onClick={() => handleFreeze('unfreeze')}
                disabled={loading || !isConnected || !mintAddress || !accountAddress || !hasFreezeAuthority}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                data-testid="button-unfreeze"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unfreezing Account...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Unfreeze
                  </>
                ) : (
                  <>
                    <Snowflake className="mr-2 h-4 w-4" />
                    Unfreeze Account
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </MainLayout>
  );
}
