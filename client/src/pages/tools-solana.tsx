import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Send, UserPlus, UserX, Image, Plus, Flame, Snowflake, Wallet, Loader2, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { useParams } from 'wouter';
import {
  multisendTokens,
  transferAuthority,
  mintTokens,
  burnTokens,
  freezeTokenAccount,
  unfreezeTokenAccount,
} from '@/utils/solanaTools';
import { revokeMintAuthority, revokeFreezeAuthority, revokeUpdateAuthority, getTokenAuthorities } from '@/utils/solanaAuthority';
import { SolanaTokenPicker } from '@/components/SolanaTokenPicker';

type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function ToolsSolana() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { publicKey, isConnected, signTransaction } = useSolanaWallet();
  const { toast } = useToast();
  
  // Determine network from chainId
  const getNetworkFromChainId = (id: string): SolanaNetwork => {
    if (id?.includes('testnet')) return 'testnet';
    if (id?.includes('mainnet')) return 'mainnet-beta';
    return 'testnet'; // default
  };
  
  const [network, setNetwork] = useState<SolanaNetwork>(getNetworkFromChainId(chainId));
  const [loading, setLoading] = useState(false);

  // Freeze authority checking state
  const [checkingAuthority, setCheckingAuthority] = useState(false);
  const [freezeAuthority, setFreezeAuthority] = useState<string | null>(null);
  const [hasFreezeAuthority, setHasFreezeAuthority] = useState(false);

  // Multisender state
  const [multisendMint, setMultisendMint] = useState('');
  const [multisendDecimals, setMultisendDecimals] = useState('9');
  const [multisendRecipients, setMultisendRecipients] = useState('');

  // Mint Tokens state
  const [mintMint, setMintMint] = useState('');
  const [mintDestination, setMintDestination] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintDecimals, setMintDecimals] = useState('9');

  // Burn Tokens state
  const [burnMint, setBurnMint] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [burnDecimals, setBurnDecimals] = useState('9');

  // Freeze/Unfreeze state
  const [freezeMint, setFreezeMint] = useState('');
  const [freezeAccount, setFreezeAccount] = useState('');
  const [freezeAction, setFreezeAction] = useState<'freeze' | 'unfreeze'>('freeze');

  // Transfer Authority state
  const [transferMint, setTransferMint] = useState('');
  const [transferType, setTransferType] = useState<'mint' | 'freeze'>('mint');
  const [transferNewAuthority, setTransferNewAuthority] = useState('');

  // Revoke Authority state
  const [revokeMint, setRevokeMint] = useState('');
  const [revokeType, setRevokeType] = useState<'mint' | 'freeze' | 'update'>('mint');

  // Update Metadata state
  const [metadataMint, setMetadataMint] = useState('');
  const [metadataName, setMetadataName] = useState('');
  const [metadataSymbol, setMetadataSymbol] = useState('');
  const [metadataUri, setMetadataUri] = useState('');

  useEffect(() => {
    const checkFreezeAuthority = async () => {
      if (!freezeMint || !publicKey) {
        setFreezeAuthority(null);
        setHasFreezeAuthority(false);
        return;
      }

      try {
        setCheckingAuthority(true);
        const connection = getSolanaConnection(network);
        const authorities = await getTokenAuthorities(connection, freezeMint);
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
  }, [freezeMint, publicKey, network]);

  const handleMultisend = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const lines = multisendRecipients.trim().split('\n');
      const recipients = lines.map(line => {
        const [address, amount] = line.split(',').map(s => s.trim());
        return { address, amount: parseFloat(amount) };
      });

      if (recipients.some(r => !r.address || isNaN(r.amount))) {
        throw new Error('Invalid recipient format. Use: address,amount per line');
      }

      const signature = await multisendTokens(
        connection,
        new PublicKey(publicKey),
        multisendMint,
        recipients,
        parseInt(multisendDecimals),
        signTransaction
      );

      toast({
        title: 'Multisend successful!',
        description: `Sent tokens to ${recipients.length} recipients. Signature: ${signature.slice(0, 8)}...`,
      });

      setMultisendMint('');
      setMultisendRecipients('');
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

  const handleMintTokens = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const signature = await mintTokens(
        connection,
        new PublicKey(publicKey),
        mintMint,
        mintDestination,
        parseFloat(mintAmount),
        parseInt(mintDecimals),
        signTransaction
      );

      toast({
        title: 'Tokens minted!',
        description: `Minted ${mintAmount} tokens. Signature: ${signature.slice(0, 8)}...`,
      });

      setMintMint('');
      setMintDestination('');
      setMintAmount('');
    } catch (error: any) {
      toast({
        title: 'Mint failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const signature = await burnTokens(
        connection,
        new PublicKey(publicKey),
        burnMint,
        parseFloat(burnAmount),
        parseInt(burnDecimals),
        signTransaction
      );

      toast({
        title: 'Tokens burned!',
        description: `Burned ${burnAmount} tokens permanently. Signature: ${signature.slice(0, 8)}...`,
      });

      setBurnMint('');
      setBurnAmount('');
    } catch (error: any) {
      toast({
        title: 'Burn failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeUnfreeze = async () => {
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

      const signature = freezeAction === 'freeze'
        ? await freezeTokenAccount(connection, new PublicKey(publicKey), freezeMint, freezeAccount, signTransaction)
        : await unfreezeTokenAccount(connection, new PublicKey(publicKey), freezeMint, freezeAccount, signTransaction);

      toast({
        title: `Account ${freezeAction}d!`,
        description: `Token account ${freezeAction}d successfully. Signature: ${signature.slice(0, 8)}...`,
      });

      setFreezeMint('');
      setFreezeAccount('');
    } catch (error: any) {
      toast({
        title: `${freezeAction} failed`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferAuthority = async () => {
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
        transferType,
        transferNewAuthority,
        signTransaction
      );

      toast({
        title: 'Authority transferred!',
        description: `${transferType === 'mint' ? 'Mint' : 'Freeze'} authority transferred successfully. Signature: ${signature.slice(0, 8)}...`,
      });

      setTransferMint('');
      setTransferNewAuthority('');
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

  const handleRevokeAuthority = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      let signature: string;
      if (revokeType === 'mint') {
        signature = await revokeMintAuthority(connection, revokeMint, new PublicKey(publicKey), signTransaction);
      } else if (revokeType === 'freeze') {
        signature = await revokeFreezeAuthority(connection, revokeMint, new PublicKey(publicKey), signTransaction);
      } else {
        signature = await revokeUpdateAuthority(connection, revokeMint, new PublicKey(publicKey), signTransaction);
      }

      const authorityName = revokeType === 'mint' ? 'Mint' : revokeType === 'freeze' ? 'Freeze' : 'Update';

      toast({
        title: 'Authority revoked!',
        description: `${authorityName} authority permanently revoked. Signature: ${signature.slice(0, 8)}...`,
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

  const handleUpdateMetadata = async () => {
    if (!isConnected || !publicKey || !signTransaction) {
      toast({ title: 'Wallet not connected', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);

      const { updateTokenMetadata } = await import('@/utils/solanaTools');

      const signature = await updateTokenMetadata(
        connection,
        { publicKey, signTransaction },
        metadataMint,
        {
          name: metadataName,
          symbol: metadataSymbol,
          description: '',
          image: metadataUri,
        }
      );

      toast({
        title: 'Metadata updated!',
        description: `Token metadata updated successfully. Signature: ${signature.slice(0, 8)}...`,
      });

      setMetadataMint('');
      setMetadataName('');
      setMetadataSymbol('');
      setMetadataUri('');
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Solana Tools
        </h1>
        <p className="text-gray-400">
          Advanced token management tools for your SPL tokens
        </p>
      </div>

      {/* Network Selector */}
      <Card className="mb-6 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Network Selection</CardTitle>
          <CardDescription className="text-gray-400">
            Choose the Solana network for your operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={network} onValueChange={(v) => setNetwork(v as SolanaNetwork)}>
            <SelectTrigger className="w-64" data-testid="select-network">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="testnet" data-testid="option-testnet">Testnet</SelectItem>
              <SelectItem value="mainnet-beta" data-testid="option-mainnet">Mainnet Beta</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Wallet Connection Notice */}
      {!isConnected ? (
        <Card className="mb-6 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="font-semibold text-white">Connect Your Wallet</p>
                <p className="text-sm text-gray-400">Use the "Connect Wallet" button in the top-right corner to access Solana tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-green-800/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-white">Wallet Connected</p>
                <p className="text-sm text-gray-400 font-mono">
                  {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="multisender" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="multisender">
            <Send className="h-4 w-4 mr-2" />
            Multisender
          </TabsTrigger>
          <TabsTrigger value="mint-burn">
            <Plus className="h-4 w-4 mr-2" />
            Mint/Burn
          </TabsTrigger>
          <TabsTrigger value="freeze">
            <Snowflake className="h-4 w-4 mr-2" />
            Freeze
          </TabsTrigger>
          <TabsTrigger value="authority">
            <Shield className="h-4 w-4 mr-2" />
            Authority
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Image className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
        </TabsList>

        {/* Multisender Tab */}
        <TabsContent value="multisender">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Multisender Tool</CardTitle>
              <CardDescription className="text-gray-400">
                Send tokens to multiple recipients in a single transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SolanaTokenPicker
                value={multisendMint}
                onChange={setMultisendMint}
                label="Token Mint Address"
                placeholder="Enter or select token mint address"
                publicKey={publicKey}
                network={network}
                testId="input-multisend-mint"
              />
              <div>
                <Label className="text-white">Token Decimals</Label>
                <Input
                  type="number"
                  value={multisendDecimals}
                  onChange={(e) => setMultisendDecimals(e.target.value)}
                  data-testid="input-multisend-decimals"
                />
              </div>
              <div>
                <Label className="text-white">Recipients (address,amount per line)</Label>
                <Textarea
                  value={multisendRecipients}
                  onChange={(e) => setMultisendRecipients(e.target.value)}
                  placeholder="e.g.&#10;7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,100&#10;8yGqKHZgKWtGbRXw3VvN1Qkqz3hUvFqCx7jRfYjXgzsK,200"
                  className="min-h-[120px]"
                  data-testid="textarea-multisend-recipients"
                />
              </div>
              <Button onClick={handleMultisend} disabled={loading || !isConnected} className="w-full disabled:opacity-50" data-testid="button-send-tokens">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Tokens...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet to Send
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mint/Burn Tab */}
        <TabsContent value="mint-burn">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mint Tokens */}
            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-500" />
                  Mint Tokens
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Mint additional tokens to any wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SolanaTokenPicker
                  value={mintMint}
                  onChange={setMintMint}
                  label="Token Mint Address"
                  placeholder="Enter or select token mint address"
                  publicKey={publicKey}
                  network={network}
                  testId="input-mint-mint"
                />
                <div>
                  <Label className="text-white">Destination Address</Label>
                  <Input
                    value={mintDestination}
                    onChange={(e) => setMintDestination(e.target.value)}
                    placeholder="Enter recipient address"
                    data-testid="input-mint-destination"
                  />
                </div>
                <div>
                  <Label className="text-white">Amount</Label>
                  <Input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="Enter amount"
                    data-testid="input-mint-amount"
                  />
                </div>
                <div>
                  <Label className="text-white">Decimals</Label>
                  <Input
                    type="number"
                    value={mintDecimals}
                    onChange={(e) => setMintDecimals(e.target.value)}
                    data-testid="input-mint-decimals"
                  />
                </div>
                <Button onClick={handleMintTokens} disabled={loading || !isConnected} className="w-full disabled:opacity-50" data-testid="button-mint-tokens">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting Tokens...
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
              </CardContent>
            </Card>

            {/* Burn Tokens */}
            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Burn Tokens
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Permanently burn tokens from your wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SolanaTokenPicker
                  value={burnMint}
                  onChange={setBurnMint}
                  label="Token Mint Address"
                  placeholder="Enter or select token mint address"
                  publicKey={publicKey}
                  network={network}
                  testId="input-burn-mint"
                />
                <div>
                  <Label className="text-white">Amount</Label>
                  <Input
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="Enter amount"
                    data-testid="input-burn-amount"
                  />
                </div>
                <div>
                  <Label className="text-white">Decimals</Label>
                  <Input
                    type="number"
                    value={burnDecimals}
                    onChange={(e) => setBurnDecimals(e.target.value)}
                    data-testid="input-burn-decimals"
                  />
                </div>
                <Alert className="bg-orange-900/20 border-orange-500/50">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-orange-200">
                    This action is permanent and cannot be undone
                  </AlertDescription>
                </Alert>
                <Button onClick={handleBurnTokens} disabled={loading || !isConnected} variant="destructive" className="w-full disabled:opacity-50" data-testid="button-burn-tokens">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Burning Tokens...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet to Burn
                    </>
                  ) : (
                    <>
                      <Flame className="h-4 w-4 mr-2" />
                      Burn Tokens
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Freeze Tab */}
        <TabsContent value="freeze">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Freeze/Unfreeze Account</CardTitle>
              <CardDescription className="text-gray-400">
                Freeze or unfreeze token accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SolanaTokenPicker
                value={freezeMint}
                onChange={setFreezeMint}
                label="Token Mint Address"
                placeholder="Enter or select token mint address"
                publicKey={publicKey}
                network={network}
                testId="input-freeze-mint"
              />

              {freezeMint && (
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
                <Label className="text-white">Account Address</Label>
                <Input
                  value={freezeAccount}
                  onChange={(e) => setFreezeAccount(e.target.value)}
                  placeholder="Enter account address to freeze/unfreeze"
                  data-testid="input-freeze-account"
                />
              </div>
              <div>
                <Label className="text-white">Action</Label>
                <Select value={freezeAction} onValueChange={(v) => setFreezeAction(v as 'freeze' | 'unfreeze')}>
                  <SelectTrigger data-testid="select-freeze-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freeze">Freeze Account</SelectItem>
                    <SelectItem value="unfreeze">Unfreeze Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleFreezeUnfreeze} disabled={loading || !isConnected || !hasFreezeAuthority} className="w-full disabled:opacity-50" data-testid="button-freeze-unfreeze">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {freezeAction === 'freeze' ? 'Freezing Account...' : 'Unfreezing Account...'}
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet to {freezeAction === 'freeze' ? 'Freeze' : 'Unfreeze'}
                  </>
                ) : !hasFreezeAuthority ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    No Freeze Authority
                  </>
                ) : (
                  <>
                    <Snowflake className="h-4 w-4 mr-2" />
                    {freezeAction === 'freeze' ? 'Freeze Account' : 'Unfreeze Account'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authority Tab */}
        <TabsContent value="authority">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Transfer Authority */}
            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                  Transfer Authority
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Transfer mint or freeze authority to another wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SolanaTokenPicker
                  value={transferMint}
                  onChange={setTransferMint}
                  label="Token Mint Address"
                  placeholder="Enter or select token mint address"
                  publicKey={publicKey}
                  network={network}
                  testId="input-transfer-mint"
                />
                <div>
                  <Label className="text-white">Authority Type</Label>
                  <Select value={transferType} onValueChange={(v) => setTransferType(v as 'mint' | 'freeze')}>
                    <SelectTrigger data-testid="select-transfer-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mint">Mint Authority</SelectItem>
                      <SelectItem value="freeze">Freeze Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">New Authority Address</Label>
                  <Input
                    value={transferNewAuthority}
                    onChange={(e) => setTransferNewAuthority(e.target.value)}
                    placeholder="Enter wallet address"
                    data-testid="input-transfer-new-authority"
                  />
                </div>
                <Button onClick={handleTransferAuthority} disabled={loading || !isConnected} className="w-full disabled:opacity-50" data-testid="button-transfer-authority">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transferring Authority...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet to Transfer Authority
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Transfer Authority
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Revoke Authority */}
            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-500" />
                  Revoke Authority
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Permanently revoke mint, freeze, or update authority
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SolanaTokenPicker
                  value={revokeMint}
                  onChange={setRevokeMint}
                  label="Token Mint Address"
                  placeholder="Enter or select token mint address"
                  publicKey={publicKey}
                  network={network}
                  testId="input-revoke-mint"
                />
                <div>
                  <Label className="text-white">Authority Type</Label>
                  <Select value={revokeType} onValueChange={(v) => setRevokeType(v as 'mint' | 'freeze' | 'update')}>
                    <SelectTrigger data-testid="select-revoke-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mint">Mint Authority</SelectItem>
                      <SelectItem value="freeze">Freeze Authority</SelectItem>
                      <SelectItem value="update">Update Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Alert className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-200">
                    Warning: This action is permanent and cannot be undone
                  </AlertDescription>
                </Alert>
                <Button onClick={handleRevokeAuthority} disabled={loading || !isConnected} variant="destructive" className="w-full disabled:opacity-50" data-testid="button-revoke-authority">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Revoking Authority...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet to Revoke Authority
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Revoke Authority
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <Card className="border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Update Token Metadata</CardTitle>
              <CardDescription className="text-gray-400">
                Update token name, symbol, or metadata URI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SolanaTokenPicker
                value={metadataMint}
                onChange={setMetadataMint}
                label="Token Mint Address"
                placeholder="Enter or select token mint address"
                publicKey={publicKey}
                network={network}
                testId="input-metadata-mint"
              />
              <div>
                <Label className="text-white">Token Name</Label>
                <Input
                  value={metadataName}
                  onChange={(e) => setMetadataName(e.target.value)}
                  placeholder="Enter new token name"
                  data-testid="input-metadata-name"
                />
              </div>
              <div>
                <Label className="text-white">Token Symbol</Label>
                <Input
                  value={metadataSymbol}
                  onChange={(e) => setMetadataSymbol(e.target.value)}
                  placeholder="Enter new token symbol"
                  data-testid="input-metadata-symbol"
                />
              </div>
              <div>
                <Label className="text-white">Metadata URI</Label>
                <Input
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                  placeholder="Enter metadata URI (IPFS or Arweave)"
                  data-testid="input-metadata-uri"
                />
              </div>
              <Button onClick={handleUpdateMetadata} disabled={loading || !isConnected} className="w-full disabled:opacity-50" data-testid="button-update-metadata">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Metadata...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet to Update Metadata
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Update Metadata
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
