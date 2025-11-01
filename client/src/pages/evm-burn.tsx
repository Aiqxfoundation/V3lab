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
import { Flame, Loader2, Wallet } from 'lucide-react';
import * as evmTools from '@/utils/evmTools';
import { handleWeb3Error } from '@/utils/errorHandling';
import { SUPPORTED_CHAINS } from '@shared/schema';

export default function EvmBurn() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { address, isConnected, chainId: walletChainId, switchChain } = useEvmWallet();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    chain => chain.chainId.toString() === chainId || chain.name === chainId
  );

  const handleBurn = async () => {
    if (!isConnected || !tokenAddress || !amount) {
      toast({ title: 'Missing Information', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (!ethers.isAddress(tokenAddress)) {
      toast({ title: 'Invalid Address', description: 'Please enter a valid token address', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const txHash = await evmTools.burnTokens(tokenAddress, amount);
      toast({ title: 'Tokens Burned', description: `Successfully burned ${amount} tokens` });

      addTransaction({
        type: 'burn',
        status: 'confirmed',
        description: `Burned ${amount} tokens`,
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: tokenAddress,
        value: amount,
      });

      setAmount('');
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Burning Tokens', showToast: true });
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
            Burn Tokens
          </h1>
          <p className="text-gray-400">
            Permanently destroy tokens from your wallet
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
              <Flame className="h-5 w-5 text-orange-500" />
              Burn Tokens
            </CardTitle>
            <CardDescription className="text-gray-400">
              Permanently remove tokens from circulation
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

            <div>
              <Label htmlFor="amount" className="text-white">Amount to Burn</Label>
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

            <Button
              onClick={handleBurn}
              disabled={loading || !isConnected || !tokenAddress || !amount}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              data-testid="button-burn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Burning Tokens...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet to Burn
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-4 w-4" />
                  Burn Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
