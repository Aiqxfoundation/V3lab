import { useState } from 'react';
import { useParams } from 'wouter';
import { ethers } from 'ethers';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEvmWallet } from '@/contexts/EvmWalletContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { Shield, Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as evmTools from '@/utils/evmTools';
import { handleWeb3Error } from '@/utils/errorHandling';
import { SUPPORTED_CHAINS } from '@shared/schema';

export default function EvmRevokeAuthority() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { address, isConnected, chainId: walletChainId, switchChain } = useEvmWallet();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    chain => chain.chainId.toString() === chainId || chain.name === chainId
  );

  const handleRevokeAuthority = async (type: 'mint' | 'pause' | 'blacklist' | 'ownership') => {
    if (!isConnected || !tokenAddress) {
      toast({ title: 'Missing Information', description: 'Please enter token address', variant: 'destructive' });
      return;
    }

    if (!ethers.isAddress(tokenAddress)) {
      toast({ title: 'Invalid Address', description: 'Please enter a valid token address', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let txHash: string;
      let description: string;

      switch (type) {
        case 'mint':
          txHash = await evmTools.revokeMinting(tokenAddress);
          description = 'Revoked minting authority';
          break;
        case 'pause':
          txHash = await evmTools.revokePausing(tokenAddress);
          description = 'Revoked pausing authority';
          break;
        case 'blacklist':
          txHash = await evmTools.revokeBlacklisting(tokenAddress);
          description = 'Revoked blacklisting authority';
          break;
        case 'ownership':
          txHash = await evmTools.renounceOwnership(tokenAddress);
          description = 'Renounced ownership permanently';
          break;
      }
      
      toast({ title: 'Authority Revoked', description });

      addTransaction({
        type: 'revoke_authority',
        status: 'confirmed',
        description,
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: tokenAddress,
        value: '0',
      });
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Revoking Authority', showToast: true });
    } finally {
      setLoading(false);
    }
  };

  const isCorrectNetwork = walletChainId === currentChain?.chainId;

  return (
    <MainLayout currentChainId={chainId}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Revoke Authority
          </h1>
          <p className="text-gray-400">
            Permanently revoke token authorities (cannot be undone)
          </p>
        </div>

        {!isCorrectNetwork && isConnected && (
          <Card className="mb-6 border-yellow-800/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-yellow-500">Wrong network detected</p>
                <Button
                  onClick={() => switchChain(currentChain?.chainId || 1)}
                  variant="outline"
                  size="sm"
                  data-testid="button-switch-network"
                >
                  Switch to {currentChain?.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Alert className="mb-6 border-red-500/20 bg-red-500/5">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm text-gray-300">
            <strong>Warning:</strong> Revoking authorities is permanent and cannot be undone. Make sure you understand the implications before proceeding.
          </AlertDescription>
        </Alert>

        <Card className="border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Token Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="token-address" className="text-white">Token Contract Address</Label>
              <Input
                id="token-address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-token-address"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Revoke Mint Authority</CardTitle>
              <CardDescription className="text-gray-400">
                Remove ability to mint new tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleRevokeAuthority('mint')}
                disabled={loading || !isConnected || !tokenAddress}
                variant="destructive"
                className="w-full disabled:opacity-50"
                data-testid="button-revoke-mint"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Revoke
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Revoke Mint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Revoke Pause Authority</CardTitle>
              <CardDescription className="text-gray-400">
                Remove ability to pause transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleRevokeAuthority('pause')}
                disabled={loading || !isConnected || !tokenAddress}
                variant="destructive"
                className="w-full disabled:opacity-50"
                data-testid="button-revoke-pause"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Revoke
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Revoke Pause
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Revoke Blacklist Authority</CardTitle>
              <CardDescription className="text-gray-400">
                Remove ability to blacklist addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleRevokeAuthority('blacklist')}
                disabled={loading || !isConnected || !tokenAddress}
                variant="destructive"
                className="w-full disabled:opacity-50"
                data-testid="button-revoke-blacklist"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Revoke
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Revoke Blacklist
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-800 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-white text-lg">Renounce Ownership</CardTitle>
              <CardDescription className="text-red-400">
                Permanently give up contract control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleRevokeAuthority('ownership')}
                disabled={loading || !isConnected || !tokenAddress}
                variant="destructive"
                className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50"
                data-testid="button-renounce-ownership"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Renouncing...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Renounce
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Renounce Ownership
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
