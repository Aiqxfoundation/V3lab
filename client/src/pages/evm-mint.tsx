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
import { Plus, Loader2, Wallet } from 'lucide-react';
import * as evmTools from '@/utils/evmTools';
import { handleWeb3Error } from '@/utils/errorHandling';
import { SUPPORTED_CHAINS } from '@shared/schema';

export default function EvmMint() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { address, isConnected, chainId: walletChainId, switchChain } = useEvmWallet();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    chain => chain.chainId.toString() === chainId || chain.name === chainId
  );

  const handleMint = async () => {
    if (!isConnected || !tokenAddress || !recipient || !amount) {
      toast({ title: 'Missing Information', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (!ethers.isAddress(tokenAddress) || !ethers.isAddress(recipient)) {
      toast({ title: 'Invalid Address', description: 'Please enter valid addresses', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const txHash = await evmTools.mintTokens(tokenAddress, recipient, amount);
      
      toast({ title: 'Tokens Minted', description: `Successfully minted ${amount} tokens` });

      addTransaction({
        type: 'mint',
        status: 'confirmed',
        description: `Minted ${amount} tokens to ${recipient.slice(0, 6)}...`,
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: recipient,
        value: amount,
      });

      setAmount('');
      setRecipient('');
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Minting Tokens', showToast: true });
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
            Mint Tokens
          </h1>
          <p className="text-gray-400">
            Mint additional tokens to any address (requires mint authority)
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
              <Plus className="h-5 w-5 text-cyan-500" />
              Mint Tokens
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create new tokens and send them to a recipient address
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
              <Label htmlFor="recipient" className="text-white">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="bg-gray-900 border-gray-700 text-white"
                data-testid="input-recipient"
              />
            </div>

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

            <Button
              onClick={handleMint}
              disabled={loading || !isConnected || !tokenAddress || !recipient || !amount}
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
