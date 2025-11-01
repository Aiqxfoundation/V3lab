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
import { Pause, Play, Loader2, Wallet } from 'lucide-react';
import * as evmTools from '@/utils/evmTools';
import { handleWeb3Error } from '@/utils/errorHandling';
import { SUPPORTED_CHAINS } from '@shared/schema';

export default function EvmPause() {
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

  const handlePause = async () => {
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
      const txHash = await evmTools.pauseToken(tokenAddress);
      toast({ title: 'Token Paused', description: 'All token transfers have been paused' });

      addTransaction({
        type: 'pause',
        status: 'confirmed',
        description: 'Paused token transfers',
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: tokenAddress,
        value: '0',
      });
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Pausing Token', showToast: true });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpause = async () => {
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
      const txHash = await evmTools.unpauseToken(tokenAddress);
      toast({ title: 'Token Unpaused', description: 'Token transfers have been resumed' });

      addTransaction({
        type: 'unpause',
        status: 'confirmed',
        description: 'Unpaused token transfers',
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: tokenAddress,
        value: '0',
      });
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Unpausing Token', showToast: true });
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
            Pause / Unpause Token
          </h1>
          <p className="text-gray-400">
            Freeze or resume all token transfers (requires pause authority)
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

        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Pause className="h-5 w-5 text-purple-500" />
              Pause Controls
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pause or unpause all token transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handlePause}
                disabled={loading || !isConnected || !tokenAddress}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                data-testid="button-pause"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pausing...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Pause
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>

              <Button
                onClick={handleUnpause}
                disabled={loading || !isConnected || !tokenAddress}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                data-testid="button-unpause"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unpausing...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Unpause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Unpause
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
