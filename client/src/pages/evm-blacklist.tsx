import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEvmWallet } from '@/contexts/EvmWalletContext';
import { ERC20_ADVANCED_ABI } from '@/utils/evmTools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { Ban, Loader2, Wallet, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useParams } from 'wouter';
import { SUPPORTED_CHAINS, type ChainId } from '@shared/schema';

export default function EvmBlacklistAccount() {
  const params = useParams();
  const chainId = params.chainId as string;
  const { address, isConnected, connect } = useEvmWallet();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [accountToBlacklist, setAccountToBlacklist] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isBlacklisted, setIsBlacklisted] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const currentChain = SUPPORTED_CHAINS[chainId as ChainId] ?? null;

  // Check if address is blacklisted
  const checkBlacklistStatus = async () => {
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) return;
    if (!accountToBlacklist || !ethers.isAddress(accountToBlacklist)) return;
    if (!window.ethereum) return;

    try {
      setCheckingStatus(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, provider);
      
      const [hasBlacklistFeature, blacklisted] = await Promise.all([
        contract.hasBlacklist(),
        contract.blacklisted(accountToBlacklist),
      ]);

      if (!hasBlacklistFeature) {
        toast({
          title: 'Feature Not Available',
          description: 'This token does not have blacklist functionality enabled',
          variant: 'destructive',
        });
        return;
      }

      setIsBlacklisted(blacklisted);
    } catch (error: any) {
      console.error('Error checking blacklist status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Load token info
  useEffect(() => {
    const loadTokenInfo = async () => {
      if (!tokenAddress || !ethers.isAddress(tokenAddress) || !window.ethereum) {
        setTokenInfo(null);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, provider);
        
        const [name, symbol, hasBlacklist] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.hasBlacklist(),
        ]);

        setTokenInfo({ name, symbol, hasBlacklist });
      } catch (error) {
        console.error('Failed to load token info:', error);
        setTokenInfo(null);
      }
    };

    loadTokenInfo();
  }, [tokenAddress]);

  // Check blacklist status when address changes
  useEffect(() => {
    if (tokenAddress && accountToBlacklist) {
      checkBlacklistStatus();
    } else {
      setIsBlacklisted(null);
    }
  }, [tokenAddress, accountToBlacklist]);

  const handleBlacklist = async (action: 'blacklist' | 'unblacklist') => {
    if (!isConnected || !address) {
      toast({ 
        title: 'Wallet not connected', 
        description: 'Please connect your wallet to continue',
        variant: 'destructive' 
      });
      return;
    }

    if (!ethers.isAddress(tokenAddress)) {
      toast({ 
        title: 'Invalid token address',
        variant: 'destructive' 
      });
      return;
    }

    if (!ethers.isAddress(accountToBlacklist)) {
      toast({ 
        title: 'Invalid account address',
        variant: 'destructive' 
      });
      return;
    }

    if (!window.ethereum) {
      toast({
        title: 'Wallet Not Found',
        description: 'Please install MetaMask or another Web3 wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);

      // Check if user is owner
      const owner = await contract.owner();
      if (owner.toLowerCase() !== address.toLowerCase()) {
        toast({
          title: 'Not Authorized',
          description: 'Only the token owner can manage the blacklist',
          variant: 'destructive',
        });
        return;
      }

      // Check if blacklist feature is enabled
      const hasBlacklist = await contract.hasBlacklist();
      if (!hasBlacklist) {
        toast({
          title: 'Feature Not Available',
          description: 'This token does not have blacklist functionality enabled',
          variant: 'destructive',
        });
        return;
      }

      // Execute blacklist/unblacklist
      const tx = action === 'blacklist' 
        ? await contract.blacklistAddress(accountToBlacklist)
        : await contract.unblacklistAddress(accountToBlacklist);

      toast({
        title: 'Transaction Submitted',
        description: 'Waiting for confirmation...',
      });

      await tx.wait();

      toast({
        title: `Account ${action}ed successfully!`,
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });

      // Refresh blacklist status
      await checkBlacklistStatus();
      
      setAccountToBlacklist('');
    } catch (error: any) {
      console.error(`${action} error:`, error);
      toast({
        title: `${action} failed`,
        description: error.message || `Failed to ${action} address`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been connected successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout currentChainId={chainId}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            Blacklist Management
          </h1>
          <p className="text-gray-400">
            Block or unblock specific addresses from token transfers (requires owner permissions)
          </p>
        </div>

        {!isConnected && (
          <Alert className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              Please connect your wallet to manage blacklist settings
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Blacklist/Unblacklist Address
            </CardTitle>
            <CardDescription className="text-gray-400">
              Control which addresses can interact with your token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
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
                {tokenInfo && (
                  <p className="text-sm text-gray-400 mt-1">
                    {tokenInfo.name} ({tokenInfo.symbol})
                    {!tokenInfo.hasBlacklist && (
                      <span className="text-yellow-500 ml-2">⚠️ Blacklist not enabled</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <Tabs defaultValue="blacklist" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
                <TabsTrigger value="unblacklist">Unblacklist</TabsTrigger>
              </TabsList>
              
              <TabsContent value="blacklist" className="space-y-4">
                <div>
                  <Label htmlFor="blacklist-account" className="text-white">Address to Blacklist</Label>
                  <Input
                    id="blacklist-account"
                    value={accountToBlacklist}
                    onChange={(e) => setAccountToBlacklist(e.target.value)}
                    placeholder="0x..."
                    className="bg-gray-900 border-gray-700 text-white"
                    data-testid="input-blacklist-account"
                  />
                  {accountToBlacklist && ethers.isAddress(accountToBlacklist) && isBlacklisted !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      {isBlacklisted ? (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">Already blacklisted</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">Not blacklisted</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleBlacklist('blacklist')}
                  disabled={loading || !isConnected || !tokenAddress || !accountToBlacklist || isBlacklisted === true}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  data-testid="button-blacklist"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Blacklisting Address...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet to Blacklist
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2 h-4 w-4" />
                      Blacklist Address
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="unblacklist" className="space-y-4">
                <div>
                  <Label htmlFor="unblacklist-account" className="text-white">Address to Unblacklist</Label>
                  <Input
                    id="unblacklist-account"
                    value={accountToBlacklist}
                    onChange={(e) => setAccountToBlacklist(e.target.value)}
                    placeholder="0x..."
                    className="bg-gray-900 border-gray-700 text-white"
                    data-testid="input-unblacklist-account"
                  />
                  {accountToBlacklist && ethers.isAddress(accountToBlacklist) && isBlacklisted !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      {isBlacklisted ? (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">Currently blacklisted</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">Not blacklisted</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleBlacklist('unblacklist')}
                  disabled={loading || !isConnected || !tokenAddress || !accountToBlacklist || isBlacklisted === false}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  data-testid="button-unblacklist"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unblacklisting Address...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet to Unblacklist
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Unblacklist Address
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <Alert className="mt-6 border-blue-500/20 bg-blue-500/5">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-500 text-sm">
                <strong>Note:</strong> Blacklisted addresses cannot send or receive tokens. Only the token owner can manage the blacklist.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
