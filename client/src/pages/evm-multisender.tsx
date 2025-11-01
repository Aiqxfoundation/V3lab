import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import { ethers } from 'ethers';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useEvmWallet } from '@/contexts/EvmWalletContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { Send, Plus, Trash2, Upload, Download, Loader2, Wallet } from 'lucide-react';
import { handleWeb3Error } from '@/utils/errorHandling';
import { SUPPORTED_CHAINS } from '@shared/schema';

interface Recipient {
  address: string;
  amount: string;
  valid?: boolean;
  error?: string;
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export default function EvmMultisender() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { address, isConnected, chainId: walletChainId, switchChain } = useEvmWallet();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  
  const [tokenType, setTokenType] = useState<'native' | 'erc20'>('native');
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', amount: '' }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [balance, setBalance] = useState<string>('0');
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    chain => chain.chainId.toString() === chainId || chain.name === chainId
  );

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: 'address' | 'amount', value: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'address') {
      updated[index].valid = ethers.isAddress(value);
      updated[index].error = !updated[index].valid && value ? 'Invalid address' : undefined;
    }
    
    setRecipients(updated);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const content = await file.text();
      const lines = content.trim().split('\n');
      const parsed: Recipient[] = [];
      
      for (const line of lines) {
        const [address, amount] = line.split(',').map(s => s.trim());
        if (address && amount) {
          parsed.push({
            address,
            amount,
            valid: ethers.isAddress(address),
            error: !ethers.isAddress(address) ? 'Invalid address' : undefined,
          });
        }
      }
      
      if (parsed.length === 0) {
        toast({ title: 'Invalid CSV', description: 'No valid recipients found', variant: 'destructive' });
        return;
      }
      
      setRecipients(parsed);
      toast({ title: 'CSV Imported', description: `Loaded ${parsed.length} recipients` });
    } catch (error) {
      toast({ title: 'CSV Error', description: 'Failed to parse CSV file', variant: 'destructive' });
    }
  };

  const downloadSampleCSV = () => {
    const sample = `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9,1.5\n0xaB5801a7D398351b8bE11C439e05C5B3259aeC9B,2.0\n0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c,0.75`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_recipients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = useMemo(() => {
    return recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [recipients]);

  const executeMultisend = async () => {
    if (!isConnected || !address || !window.ethereum) {
      toast({ title: 'Wallet Not Connected', variant: 'destructive' });
      return;
    }

    const validRecipients = recipients.filter(r => 
      ethers.isAddress(r.address) && parseFloat(r.amount) > 0
    );

    if (validRecipients.length === 0) {
      toast({ title: 'Invalid Recipients', description: 'Please add valid recipients', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      let successCount = 0;
      const totalTxs = validRecipients.length;

      for (let i = 0; i < validRecipients.length; i++) {
        const recipient = validRecipients[i];
        setProgress(Math.floor((i / totalTxs) * 100));

        try {
          let txHash: string;

          if (tokenType === 'native') {
            const tx = await signer.sendTransaction({
              to: recipient.address,
              value: ethers.parseEther(recipient.amount),
            });
            txHash = tx.hash;
            await tx.wait();
          } else {
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            const decimals = tokenInfo?.decimals || 18;
            const tx = await contract.transfer(
              recipient.address,
              ethers.parseUnits(recipient.amount, decimals)
            );
            txHash = tx.hash;
            await tx.wait();
          }

          successCount++;
          
          addTransaction({
            type: 'multisend',
            status: 'confirmed',
            description: `Sent ${recipient.amount} to ${recipient.address.slice(0, 6)}...`,
            chainId: currentChain?.chainId || 1,
            hash: txHash,
            from: address,
            to: recipient.address,
            value: recipient.amount,
          });
        } catch (error: any) {
          console.error(`Failed to send to ${recipient.address}:`, error);
        }
      }

      setProgress(100);
      toast({ title: 'Multisend Complete', description: `Successfully sent to ${successCount}/${totalTxs} recipients` });
      
      if (successCount > 0) {
        setRecipients([{ address: '', amount: '' }]);
      }
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Multisend Execution', showToast: true });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const isCorrectNetwork = walletChainId === currentChain?.chainId;

  return (
    <MainLayout currentChainId={chainId}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Multisender
          </h1>
          <p className="text-gray-400">
            Send tokens to multiple addresses in one go
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

            <Card className="border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Token Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={tokenType} onValueChange={(v: any) => setTokenType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="native" id="native" />
                    <Label htmlFor="native" className="text-white">Native Token ({currentChain?.symbol})</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="erc20" id="erc20" />
                    <Label htmlFor="erc20" className="text-white">ERC20 Token</Label>
                  </div>
                </RadioGroup>

                {tokenType === 'erc20' && (
                  <div className="mt-4">
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
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-800 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Recipients</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSampleCSV}
                      data-testid="button-download-csv"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Sample CSV
                    </Button>
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import CSV
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        data-testid="input-csv-upload"
                      />
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                      placeholder="Address 0x..."
                      className="bg-gray-900 border-gray-700 text-white flex-1"
                      data-testid={`input-recipient-address-${index}`}
                    />
                    <Input
                      type="number"
                      value={recipient.amount}
                      onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="bg-gray-900 border-gray-700 text-white w-32"
                      data-testid={`input-recipient-amount-${index}`}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeRecipient(index)}
                      disabled={recipients.length === 1}
                      data-testid={`button-remove-recipient-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addRecipient}
                  className="w-full"
                  data-testid="button-add-recipient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </CardContent>
            </Card>

            {isProcessing && (
              <Card className="border-gray-800 mb-6">
                <CardContent className="pt-6">
                  <Label className="text-white mb-2">Progress</Label>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-400 mt-2">{progress}% complete</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Total Amount:</span>
                  <span className="text-cyan-500 font-bold">{totalAmount.toFixed(6)}</span>
                </div>
                <Button
                  onClick={executeMultisend}
                  disabled={isProcessing || !isConnected || recipients.length === 0}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                  data-testid="button-execute-multisend"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet to Send
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to {recipients.length} Recipients
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
      </div>
    </MainLayout>
  );
}
