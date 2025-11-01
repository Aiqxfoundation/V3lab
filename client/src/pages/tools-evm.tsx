import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ethers } from 'ethers';
import { 
  Send, 
  Upload, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  FileText,
  Wallet,
  Plus,
  Trash2,
  Download,
  Copy,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useEvmWallet } from '@/contexts/EvmWalletContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { TransactionHistory } from '@/components/TransactionHistory';
import { handleWeb3Error, retryWithBackoff } from '@/utils/errorHandling';
import { SUPPORTED_CHAINS } from '@shared/schema';
import * as evmTools from '@/utils/evmTools';

interface EvmToolsProps {
  chainId: string;
  chainName: string;
  gradient?: string;
}

interface Recipient {
  address: string;
  amount: string;
  valid?: boolean;
  error?: string;
}

// ERC20 ABI for transfer operations
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

// Form schema for multisender
const multisenderSchema = z.object({
  tokenType: z.enum(['native', 'erc20']),
  tokenAddress: z.string().optional(),
  recipients: z.array(z.object({
    address: z.string().refine((val) => ethers.isAddress(val), 'Invalid address'),
    amount: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be positive'),
  })).min(1, 'At least one recipient required'),
});

type MultisenderFormData = z.infer<typeof multisenderSchema>;

export default function EvmTools({ chainId, chainName }: EvmToolsProps) {
  const { address, isConnected, connect, chainId: walletChainId, switchChain } = useEvmWallet();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [balance, setBalance] = useState<string>('0');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [recipients, setRecipients] = useState<Recipient[]>([{ address: '', amount: '' }]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [tokenType, setTokenType] = useState<'native' | 'erc20'>('native');
  const [tokenAddress, setTokenAddress] = useState('');
  
  // Authority management state
  const [authorityTokenAddress, setAuthorityTokenAddress] = useState('');
  const [mintRecipient, setMintRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [authorityProcessing, setAuthorityProcessing] = useState(false);

  const currentChain = Object.values(SUPPORTED_CHAINS).find(
    chain => chain.chainId.toString() === chainId || chain.name === chainName
  );

  const form = useForm<MultisenderFormData>({
    resolver: zodResolver(multisenderSchema),
    defaultValues: {
      tokenType: 'native',
      tokenAddress: '',
      recipients: [],
    },
  });

  // Connect wallet handler
  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been connected successfully',
      });
    } catch (error: any) {
      await handleWeb3Error(error, {
        context: 'Wallet Connection',
        showToast: true,
      });
    }
  };

  // Load balance
  useEffect(() => {
    const loadBalance = async () => {
      if (!isConnected || !address || !window.ethereum) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        if (tokenType === 'native') {
          const bal = await provider.getBalance(address);
          setBalance(ethers.formatEther(bal));
        } else if (tokenAddress && ethers.isAddress(tokenAddress)) {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const [bal, decimals, symbol, name] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals(),
            contract.symbol(),
            contract.name(),
          ]);
          setBalance(ethers.formatUnits(bal, decimals));
          setTokenInfo({ decimals, symbol, name });
        }
      } catch (error) {
        console.error('Failed to load balance:', error);
      }
    };

    loadBalance();
  }, [isConnected, address, tokenType, tokenAddress]);

  // Add recipient
  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  // Remove recipient
  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  // Update recipient
  const updateRecipient = (index: number, field: 'address' | 'amount', value: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    
    // Validate address
    if (field === 'address') {
      updated[index].valid = ethers.isAddress(value);
      updated[index].error = !updated[index].valid && value ? 'Invalid address' : undefined;
    }
    
    setRecipients(updated);
  };

  // Parse CSV
  const parseCSV = (content: string) => {
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
    
    return parsed;
  };

  // Handle CSV upload
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    
    try {
      const content = await file.text();
      const parsed = parseCSV(content);
      
      if (parsed.length === 0) {
        toast({
          title: 'Invalid CSV',
          description: 'No valid recipients found in CSV file',
          variant: 'destructive',
        });
        return;
      }
      
      setRecipients(parsed);
      toast({
        title: 'CSV Imported',
        description: `Loaded ${parsed.length} recipients`,
      });
    } catch (error) {
      toast({
        title: 'CSV Error',
        description: 'Failed to parse CSV file',
        variant: 'destructive',
      });
    }
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const sample = `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9,1.5
0xaB5801a7D398351b8bE11C439e05C5B3259aeC9B,2.0
0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c,0.75`;
    
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_recipients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return recipients.reduce((sum, r) => {
      const amount = parseFloat(r.amount) || 0;
      return sum + amount;
    }, 0);
  }, [recipients]);

  // Estimate gas
  useEffect(() => {
    const estimateGas = async () => {
      if (!isConnected || !address || recipients.length === 0 || !window.ethereum) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const feeData = await provider.getFeeData();
        
        // Rough estimate: 21000 gas for native transfer, 65000 for ERC20
        const gasPerTx = tokenType === 'native' ? 21000 : 65000;
        const totalGas = gasPerTx * recipients.length;
        
        if (feeData.gasPrice) {
          const totalCost = feeData.gasPrice * BigInt(totalGas);
          setGasEstimate(ethers.formatEther(totalCost));
        }
      } catch (error) {
        console.error('Failed to estimate gas:', error);
      }
    };
    
    estimateGas();
  }, [isConnected, address, recipients, tokenType]);

  // Execute multisend
  const executeMultisend = async () => {
    if (!isConnected || !address || !window.ethereum) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    // Validate recipients
    const validRecipients = recipients.filter(r => 
      ethers.isAddress(r.address) && parseFloat(r.amount) > 0
    );

    if (validRecipients.length === 0) {
      toast({
        title: 'Invalid Recipients',
        description: 'Please add valid recipients',
        variant: 'destructive',
      });
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
          const txId = addTransaction({
            type: 'multisend',
            status: 'pending',
            description: `Sending ${recipient.amount} ${tokenType === 'native' ? currentChain?.symbol : tokenInfo?.symbol} to ${recipient.address.slice(0, 6)}...`,
            chainId: currentChain?.chainId || 1,
            hash: '',
            from: address,
            to: recipient.address,
            value: recipient.amount,
          });

          if (tokenType === 'native') {
            // Send native token
            const tx = await signer.sendTransaction({
              to: recipient.address,
              value: ethers.parseEther(recipient.amount),
            });
            txHash = tx.hash;
            await tx.wait();
          } else {
            // Send ERC20 token
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
          
          // Update transaction status
          addTransaction({
            type: 'multisend',
            status: 'confirmed',
            description: `Sent ${recipient.amount} ${tokenType === 'native' ? currentChain?.symbol : tokenInfo?.symbol} to ${recipient.address.slice(0, 6)}...`,
            chainId: currentChain?.chainId || 1,
            hash: txHash,
            from: address,
            to: recipient.address,
            value: recipient.amount,
          });
        } catch (error: any) {
          console.error(`Failed to send to ${recipient.address}:`, error);
          
          addTransaction({
            type: 'multisend',
            status: 'failed',
            description: `Failed to send to ${recipient.address.slice(0, 6)}...`,
            chainId: currentChain?.chainId || 1,
            hash: '',
            from: address,
            to: recipient.address,
            value: recipient.amount,
            error: error.message,
          });
        }
      }

      setProgress(100);
      
      toast({
        title: 'Multisend Complete',
        description: `Successfully sent to ${successCount}/${totalTxs} recipients`,
      });
      
      // Clear recipients after successful send
      if (successCount > 0) {
        setRecipients([{ address: '', amount: '' }]);
      }
    } catch (error: any) {
      await handleWeb3Error(error, {
        context: 'Multisend Execution',
        showToast: true,
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Authority Management Handlers
  const handleMint = async () => {
    if (!isConnected || !authorityTokenAddress || !mintRecipient || !mintAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setAuthorityProcessing(true);
    try {
      const txHash = await evmTools.mintTokens(authorityTokenAddress, mintRecipient, mintAmount);
      
      toast({ title: 'Tokens Minted', description: `Successfully minted ${mintAmount} tokens` });

      addTransaction({
        type: 'mint',
        status: 'confirmed',
        description: `Minted ${mintAmount} tokens to ${mintRecipient.slice(0, 6)}...`,
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: mintRecipient,
        value: mintAmount,
      });

      setMintAmount('');
      setMintRecipient('');
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Minting Tokens', showToast: true });
    } finally {
      setAuthorityProcessing(false);
    }
  };

  const handleBurn = async () => {
    if (!isConnected || !authorityTokenAddress || !burnAmount) {
      toast({ title: 'Missing Information', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setAuthorityProcessing(true);
    try {
      const txHash = await evmTools.burnTokens(authorityTokenAddress, burnAmount);
      toast({ title: 'Tokens Burned', description: `Successfully burned ${burnAmount} tokens` });

      addTransaction({
        type: 'burn',
        status: 'confirmed',
        description: `Burned ${burnAmount} tokens`,
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: authorityTokenAddress,
        value: burnAmount,
      });

      setBurnAmount('');
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Burning Tokens', showToast: true });
    } finally {
      setAuthorityProcessing(false);
    }
  };

  const handlePause = async () => {
    if (!isConnected || !authorityTokenAddress) {
      toast({ title: 'Missing Information', description: 'Please enter token address', variant: 'destructive' });
      return;
    }

    setAuthorityProcessing(true);
    try {
      const txHash = await evmTools.pauseToken(authorityTokenAddress);
      toast({ title: 'Token Paused', description: 'All token transfers have been paused' });

      addTransaction({
        type: 'pause',
        status: 'confirmed',
        description: 'Paused token transfers',
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: authorityTokenAddress,
        value: '0',
      });
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Pausing Token', showToast: true });
    } finally {
      setAuthorityProcessing(false);
    }
  };

  const handleUnpause = async () => {
    if (!isConnected || !authorityTokenAddress) {
      toast({ title: 'Missing Information', description: 'Please enter token address', variant: 'destructive' });
      return;
    }

    setAuthorityProcessing(true);
    try {
      const txHash = await evmTools.unpauseToken(authorityTokenAddress);
      toast({ title: 'Token Unpaused', description: 'Token transfers have been resumed' });

      addTransaction({
        type: 'unpause',
        status: 'confirmed',
        description: 'Unpaused token transfers',
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: authorityTokenAddress,
        value: '0',
      });
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Unpausing Token', showToast: true });
    } finally {
      setAuthorityProcessing(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!isConnected || !authorityTokenAddress || !newOwner) {
      toast({ title: 'Missing Information', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setAuthorityProcessing(true);
    try {
      const txHash = await evmTools.transferOwnership(authorityTokenAddress, newOwner);
      toast({ title: 'Ownership Transferred', description: `Ownership transferred to ${newOwner.slice(0, 6)}...` });

      addTransaction({
        type: 'transfer_ownership',
        status: 'confirmed',
        description: `Transferred ownership to ${newOwner.slice(0, 6)}...`,
        chainId: currentChain?.chainId || 1,
        hash: txHash,
        from: address!,
        to: authorityTokenAddress,
        value: '0',
      });

      setNewOwner('');
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Transferring Ownership', showToast: true });
    } finally {
      setAuthorityProcessing(false);
    }
  };

  const handleRevokeAuthority = async (type: 'mint' | 'pause' | 'blacklist' | 'ownership') => {
    if (!isConnected || !authorityTokenAddress) {
      toast({ title: 'Missing Information', description: 'Please enter token address', variant: 'destructive' });
      return;
    }

    setAuthorityProcessing(true);
    try {
      let txHash: string;
      let description: string;

      switch (type) {
        case 'mint':
          txHash = await evmTools.revokeMinting(authorityTokenAddress);
          description = 'Revoked minting authority';
          break;
        case 'pause':
          txHash = await evmTools.revokePausing(authorityTokenAddress);
          description = 'Revoked pausing authority';
          break;
        case 'blacklist':
          txHash = await evmTools.revokeBlacklisting(authorityTokenAddress);
          description = 'Revoked blacklisting authority';
          break;
        case 'ownership':
          txHash = await evmTools.renounceOwnership(authorityTokenAddress);
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
        to: authorityTokenAddress,
        value: '0',
      });
    } catch (error: any) {
      await handleWeb3Error(error, { context: 'Revoking Authority', showToast: true });
    } finally {
      setAuthorityProcessing(false);
    }
  };

  // Check if on correct network
  const isCorrectNetwork = walletChainId === currentChain?.chainId;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {chainName} Tools
        </h1>
        <p className="text-gray-400">
          Advanced tools for managing {chainName} tokens
        </p>
      </div>

      {/* Wallet Connection Card - Only show when connected and network info is relevant */}
      {isConnected && !isCorrectNetwork && (
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
                Switch to {chainName}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="multisender" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="multisender">
              <Send className="h-4 w-4 mr-2" />
              Multisender
            </TabsTrigger>
            <TabsTrigger value="mint">
              <Plus className="h-4 w-4 mr-2" />
              Mint
            </TabsTrigger>
            <TabsTrigger value="burn">
              <Trash2 className="h-4 w-4 mr-2" />
              Burn
            </TabsTrigger>
            <TabsTrigger value="pause">
              <AlertCircle className="h-4 w-4 mr-2" />
              Pause
            </TabsTrigger>
            <TabsTrigger value="authority">
              <Wallet className="h-4 w-4 mr-2" />
              Authority
            </TabsTrigger>
            <TabsTrigger value="history">
              <Hash className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="multisender" className="space-y-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                EVM Multisender
              </CardTitle>
              <CardDescription>
                Send tokens to multiple addresses in batch transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Type Selection */}
              <div className="space-y-3">
                <Label>Token Type</Label>
                <RadioGroup value={tokenType} onValueChange={(v: any) => setTokenType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="native" id="native" />
                    <Label htmlFor="native">
                      Native Token ({currentChain?.symbol || 'ETH'})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="erc20" id="erc20" />
                    <Label htmlFor="erc20">ERC20 Token</Label>
                  </div>
                </RadioGroup>
                
                {tokenType === 'erc20' && (
                  <div className="mt-3">
                    <Label>Token Contract Address</Label>
                    <Input
                      placeholder="0x..."
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="mt-1"
                      data-testid="input-token-address"
                    />
                    {tokenInfo && (
                      <p className="text-sm text-gray-400 mt-1">
                        {tokenInfo.name} ({tokenInfo.symbol})
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Balance Display */}
              {isConnected && (
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <span className="text-sm text-gray-400">Your Balance:</span>
                  <span className="font-semibold text-white">
                    {balance} {tokenType === 'native' ? currentChain?.symbol : tokenInfo?.symbol || ''}
                  </span>
                </div>
              )}

              {/* Recipients Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Recipients</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSampleCSV}
                      data-testid="button-download-sample"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Sample CSV
                    </Button>
                    <Label
                      htmlFor="csv-upload"
                      className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-700 hover:bg-gray-800"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCSVUpload}
                      data-testid="input-csv-upload"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[300px] w-full border border-gray-800 rounded-lg p-4">
                  <div className="space-y-3">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex gap-2" data-testid={`recipient-row-${index}`}>
                        <div className="flex-1">
                          <Input
                            placeholder="Address (0x...)"
                            value={recipient.address}
                            onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                            className={recipient.error ? 'border-red-500' : ''}
                            data-testid={`input-address-${index}`}
                          />
                          {recipient.error && (
                            <p className="text-xs text-red-500 mt-1">{recipient.error}</p>
                          )}
                        </div>
                        <div className="w-32">
                          <Input
                            placeholder="Amount"
                            type="number"
                            step="0.000001"
                            value={recipient.amount}
                            onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                            data-testid={`input-amount-${index}`}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRecipient(index)}
                          className="text-red-500 hover:text-red-600"
                          data-testid={`button-remove-${index}`}
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
                  </div>
                </ScrollArea>
              </div>

              {/* Summary */}
              <Card className="p-4 bg-gray-900/50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total Recipients:</span>
                    <span className="font-medium">{recipients.filter(r => r.valid !== false).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total Amount:</span>
                    <span className="font-medium">
                      {totalAmount.toFixed(6)} {tokenType === 'native' ? currentChain?.symbol : tokenInfo?.symbol || ''}
                    </span>
                  </div>
                  {gasEstimate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Estimated Gas:</span>
                      <span className="font-medium">~{gasEstimate} {currentChain?.symbol}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-gray-400">
                    Processing transactions... {progress}%
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={executeMultisend}
                  disabled={!isConnected || isProcessing || recipients.length === 0 || !isCorrectNetwork}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50"
                  data-testid="button-execute-multisend"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet to Send
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {recipients.filter(r => r.valid !== false).length} Recipients
                    </>
                  )}
                </Button>
              </div>

              {!isCorrectNetwork && isConnected && (
                <Alert className="border-yellow-800 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertTitle>Wrong Network</AlertTitle>
                  <AlertDescription>
                    Please switch to {chainName} to use the multisender
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mint Tokens Tab */}
        <TabsContent value="mint" className="space-y-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Mint New Tokens
              </CardTitle>
              <CardDescription>
                Create new tokens if your contract has minting enabled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-800 bg-blue-500/10">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription>
                  Enter your token contract address and the amount you want to mint. Only the contract owner can mint new tokens.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Contract Address</Label>
                  <Input 
                    value={authorityTokenAddress}
                    onChange={(e) => setAuthorityTokenAddress(e.target.value)}
                    placeholder="0x..." 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-mint-token-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recipient Address</Label>
                  <Input 
                    value={mintRecipient}
                    onChange={(e) => setMintRecipient(e.target.value)}
                    placeholder="0x..." 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-mint-recipient"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount to Mint</Label>
                  <Input 
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="1000" 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-mint-amount"
                  />
                </div>
                
                <Button 
                  onClick={handleMint}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
                  disabled={!isConnected || authorityProcessing}
                  data-testid="button-mint-tokens"
                >
                  {authorityProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet to Mint
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Mint Tokens
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Burn Tokens Tab */}
        <TabsContent value="burn" className="space-y-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Burn Tokens
              </CardTitle>
              <CardDescription>
                Permanently remove tokens from circulation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-800 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>
                  Burning tokens is permanent and cannot be reversed. Make sure you enter the correct amount.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Contract Address</Label>
                  <Input 
                    value={authorityTokenAddress}
                    onChange={(e) => setAuthorityTokenAddress(e.target.value)}
                    placeholder="0x..." 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-burn-token-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount to Burn</Label>
                  <Input 
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="100" 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-burn-amount"
                  />
                </div>
                
                <Button 
                  onClick={handleBurn}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50"
                  disabled={!isConnected || authorityProcessing}
                  data-testid="button-burn-tokens"
                >
                  {authorityProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Burning...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet to Burn
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Burn Tokens
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pause/Unpause Tab */}
        <TabsContent value="pause" className="space-y-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Pause / Unpause Transfers
              </CardTitle>
              <CardDescription>
                Emergency pause all token transfers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-800 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription>
                  Only the contract owner can pause or unpause transfers. Use this in emergency situations.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Contract Address</Label>
                  <Input 
                    value={authorityTokenAddress}
                    onChange={(e) => setAuthorityTokenAddress(e.target.value)}
                    placeholder="0x..." 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-pause-token-address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handlePause}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
                    disabled={!isConnected || authorityProcessing}
                    data-testid="button-pause-token"
                  >
                    {authorityProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Pausing...
                      </>
                    ) : !isConnected ? (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet to Pause
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleUnpause}
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500/10 disabled:opacity-50"
                    disabled={!isConnected || authorityProcessing}
                    data-testid="button-unpause-token"
                  >
                    {authorityProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Unpausing...
                      </>
                    ) : !isConnected ? (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet to Unpause
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unpause
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authority Management Tab */}
        <TabsContent value="authority" className="space-y-4">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-500" />
                Authority Management
              </CardTitle>
              <CardDescription>
                Transfer ownership or revoke authorities permanently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-purple-800 bg-purple-500/10">
                <AlertCircle className="h-4 w-4 text-purple-500" />
                <AlertDescription>
                  These actions are permanent and cannot be reversed. Use with caution.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Contract Address</Label>
                  <Input 
                    value={authorityTokenAddress}
                    onChange={(e) => setAuthorityTokenAddress(e.target.value)}
                    placeholder="0x..." 
                    className="bg-gray-800 border-gray-700"
                    data-testid="input-authority-token-address"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Transfer Ownership</h4>
                  <div className="space-y-2">
                    <Label>New Owner Address</Label>
                    <Input 
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      placeholder="0x..." 
                      className="bg-gray-800 border-gray-700"
                      data-testid="input-new-owner"
                    />
                  </div>
                  <Button 
                    onClick={handleTransferOwnership}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
                    disabled={!isConnected || authorityProcessing}
                    data-testid="button-transfer-ownership"
                  >
                    {authorityProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Transferring...
                      </>
                    ) : !isConnected ? (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet to Transfer Ownership
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Transfer Ownership
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Revoke Authorities</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={() => handleRevokeAuthority('mint')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      disabled={!isConnected || authorityProcessing}
                      data-testid="button-revoke-mint"
                    >
                      {authorityProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Revoking...
                        </>
                      ) : !isConnected ? (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet to Revoke
                        </>
                      ) : (
                        'Revoke Minting Authority'
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleRevokeAuthority('pause')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      disabled={!isConnected || authorityProcessing}
                      data-testid="button-revoke-pause"
                    >
                      {authorityProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Revoking...
                        </>
                      ) : !isConnected ? (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet to Revoke
                        </>
                      ) : (
                        'Revoke Pausing Authority'
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleRevokeAuthority('blacklist')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      disabled={!isConnected || authorityProcessing}
                      data-testid="button-revoke-blacklist"
                    >
                      {authorityProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Revoking...
                        </>
                      ) : !isConnected ? (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet to Revoke
                        </>
                      ) : (
                        'Revoke Blacklisting Authority'
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleRevokeAuthority('ownership')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      disabled={!isConnected || authorityProcessing}
                      data-testid="button-renounce-ownership"
                    >
                      {authorityProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Renouncing...
                        </>
                      ) : !isConnected ? (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet to Renounce
                        </>
                      ) : (
                        'Renounce Ownership (Permanent)'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory 
            filterType="multisend"
            chainId={currentChain?.chainId}
            showFilters={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
