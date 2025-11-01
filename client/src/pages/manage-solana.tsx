import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Wallet, ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react';
import { getTokenAuthorities, revokeMintAuthority, revokeFreezeAuthority, isWalletAuthority } from '@/utils/solanaAuthority';
import { getSolanaConnection } from '@/utils/solanaDeployer';
import { PublicKey } from '@solana/web3.js';
import type { DeployedToken } from '@shared/schema';

type SolanaNetwork = 'testnet' | 'mainnet-beta';

export default function ManageSolanaPage() {
  const { publicKey, isConnected, connect, signTransaction } = useSolanaWallet();
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState<SolanaNetwork>('testnet');
  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean;
    tokenId: string;
    tokenName: string;
    authorityType: 'mint' | 'freeze';
    mintAddress: string;
  } | null>(null);

  // Fetch tokens from backend
  const { data: tokens, isLoading: tokensLoading, refetch } = useQuery<DeployedToken[]>({
    queryKey: ['/api/tokens'],
  });

  // Filter Solana tokens by selected network
  const solanaTokens = tokens?.filter(
    (token) => token.blockchain === 'solana' && token.network === selectedNetwork
  ) || [];

  // Token authorities state
  const [tokenAuthorities, setTokenAuthorities] = useState<Record<string, {
    mintAuthority: string | null;
    freezeAuthority: string | null;
    loading: boolean;
  }>>({});

  // Fetch authorities for all tokens
  useEffect(() => {
    if (solanaTokens.length === 0) return;

    const fetchAuthorities = async () => {
      const connection = getSolanaConnection(selectedNetwork);
      
      for (const token of solanaTokens) {
        if (!token.contractAddress) continue;
        
        setTokenAuthorities(prev => ({
          ...prev,
          [token.id]: { ...prev[token.id], loading: true },
        }));

        try {
          const authorities = await getTokenAuthorities(connection, token.contractAddress);
          setTokenAuthorities(prev => ({
            ...prev,
            [token.id]: {
              mintAuthority: authorities.mintAuthority,
              freezeAuthority: authorities.freezeAuthority,
              loading: false,
            },
          }));
        } catch (error) {
          console.error(`Error fetching authorities for token ${token.id}:`, error);
          setTokenAuthorities(prev => ({
            ...prev,
            [token.id]: {
              mintAuthority: null,
              freezeAuthority: null,
              loading: false,
            },
          }));
        }
      }
    };

    fetchAuthorities();
  }, [solanaTokens, selectedNetwork]);

  // Revoke authority mutation
  const revokeMutation = useMutation({
    mutationFn: async ({ 
      mintAddress, 
      authorityType 
    }: { 
      mintAddress: string; 
      authorityType: 'mint' | 'freeze' 
    }) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected');
      }

      const connection = getSolanaConnection(selectedNetwork);
      const currentAuthority = new PublicKey(publicKey);

      if (authorityType === 'mint') {
        return await revokeMintAuthority(
          connection,
          mintAddress,
          currentAuthority,
          signTransaction
        );
      } else {
        return await revokeFreezeAuthority(
          connection,
          mintAddress,
          currentAuthority,
          signTransaction
        );
      }
    },
    onSuccess: (signature, variables) => {
      toast({
        title: 'Authority Revoked Successfully!',
        description: `${variables.authorityType === 'mint' ? 'Mint' : 'Freeze'} authority has been permanently revoked.`,
      });
      
      // Refresh token authorities
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Revoke Authority',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRevokeAuthority = (
    tokenId: string,
    tokenName: string,
    mintAddress: string,
    authorityType: 'mint' | 'freeze'
  ) => {
    setRevokeDialog({
      open: true,
      tokenId,
      tokenName,
      authorityType,
      mintAddress,
    });
  };

  const confirmRevoke = () => {
    if (!revokeDialog) return;

    revokeMutation.mutate({
      mintAddress: revokeDialog.mintAddress,
      authorityType: revokeDialog.authorityType,
    });

    setRevokeDialog(null);
  };

  const getExplorerUrl = (mintAddress: string) => {
    const baseUrl = selectedNetwork === 'mainnet-beta' 
      ? 'https://explorer.solana.com' 
      : `https://explorer.solana.com?cluster=${selectedNetwork}`;
    return `${baseUrl}/address/${mintAddress}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-background to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Manage Solana Tokens
          </h1>
          <p className="text-muted-foreground">
            View and manage authorities for your deployed SPL tokens
          </p>
        </div>

        {/* Network Selector */}
        <Card className="mb-6 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Select Network</CardTitle>
            <CardDescription>Choose the Solana network to manage tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as SolanaNetwork)}>
              <SelectTrigger className="w-full md:w-64" data-testid="select-network">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devnet" data-testid="option-devnet">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Devnet
                  </div>
                </SelectItem>
                <SelectItem value="testnet" data-testid="option-testnet">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Testnet
                  </div>
                </SelectItem>
                <SelectItem value="mainnet-beta" data-testid="option-mainnet">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Mainnet Beta
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Wallet Connection Notice */}
        {!isConnected && (
          <Alert className="mb-6 border-purple-500/50 bg-purple-500/10">
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              <span>Connect your wallet using the button in the top-right corner to manage token authorities</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Alert */}
        <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            <strong>Warning:</strong> Revoking authorities is <strong>irreversible</strong>. Once revoked, you cannot:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Mint Authority:</strong> Mint additional tokens (supply becomes fixed)</li>
              <li><strong>Freeze Authority:</strong> Freeze or unfreeze token accounts</li>
            </ul>
            Only revoke authorities when you're certain you won't need them again.
          </AlertDescription>
        </Alert>

        {/* Tokens List */}
        {tokensLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : solanaTokens.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No tokens found on {selectedNetwork}.
                <br />
                Create a token first to manage its authorities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {solanaTokens.map((token) => {
              const authorities = tokenAuthorities[token.id];
              const isOwner = publicKey && authorities?.mintAuthority 
                ? isWalletAuthority(publicKey, authorities.mintAuthority)
                : false;

              return (
                <Card key={token.id} className="border-purple-500/20" data-testid={`card-token-${token.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {token.name}
                          <Badge variant="outline" className="font-mono text-xs">
                            {token.symbol}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {token.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={selectedNetwork === 'mainnet-beta' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {selectedNetwork}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Contract Address */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Mint Address</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate" data-testid={`text-address-${token.id}`}>
                            {token.contractAddress}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getExplorerUrl(token.contractAddress!), '_blank')}
                            data-testid={`button-explorer-${token.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Authorities Status */}
                      {authorities?.loading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading authorities...
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Mint Authority */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {authorities?.mintAuthority ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium text-sm">Mint Authority</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {authorities?.mintAuthority 
                                ? 'Can mint additional tokens' 
                                : 'Revoked - Supply is fixed'}
                            </p>
                            {authorities?.mintAuthority && isOwner && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevokeAuthority(
                                  token.id,
                                  token.name,
                                  token.contractAddress!,
                                  'mint'
                                )}
                                disabled={revokeMutation.isPending}
                                data-testid={`button-revoke-mint-${token.id}`}
                              >
                                <ShieldAlert className="h-3 w-3 mr-2" />
                                Revoke Mint Authority
                              </Button>
                            )}
                            {authorities?.mintAuthority && !isOwner && (
                              <Badge variant="secondary" className="text-xs">
                                Not the authority owner
                              </Badge>
                            )}
                          </div>

                          {/* Freeze Authority */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {authorities?.freezeAuthority ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium text-sm">Freeze Authority</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {authorities?.freezeAuthority 
                                ? 'Can freeze token accounts' 
                                : 'Revoked - Cannot freeze accounts'}
                            </p>
                            {authorities?.freezeAuthority && isOwner && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevokeAuthority(
                                  token.id,
                                  token.name,
                                  token.contractAddress!,
                                  'freeze'
                                )}
                                disabled={revokeMutation.isPending}
                                data-testid={`button-revoke-freeze-${token.id}`}
                              >
                                <ShieldAlert className="h-3 w-3 mr-2" />
                                Revoke Freeze Authority
                              </Button>
                            )}
                            {authorities?.freezeAuthority && !isOwner && (
                              <Badge variant="secondary" className="text-xs">
                                Not the authority owner
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Revoke Confirmation Dialog */}
        <Dialog open={revokeDialog?.open || false} onOpenChange={(open) => !open && setRevokeDialog(null)}>
          <DialogContent data-testid="dialog-revoke-confirm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Revoke {revokeDialog?.authorityType === 'mint' ? 'Mint' : 'Freeze'} Authority?
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-4">
                <p>
                  You are about to permanently revoke the{' '}
                  <strong>{revokeDialog?.authorityType === 'mint' ? 'Mint' : 'Freeze'} Authority</strong>{' '}
                  for token <strong>{revokeDialog?.tokenName}</strong>.
                </p>
                
                {revokeDialog?.authorityType === 'mint' ? (
                  <Alert className="border-orange-500/50 bg-orange-500/10">
                    <AlertDescription className="text-sm">
                      After revoking mint authority:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>You will <strong>never</strong> be able to mint additional tokens</li>
                        <li>The total supply will be permanently fixed</li>
                        <li>This action <strong>cannot be undone</strong></li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-orange-500/50 bg-orange-500/10">
                    <AlertDescription className="text-sm">
                      After revoking freeze authority:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>You will <strong>never</strong> be able to freeze token accounts</li>
                        <li>You will <strong>never</strong> be able to unfreeze frozen accounts</li>
                        <li>This action <strong>cannot be undone</strong></li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-sm font-medium pt-2">
                  Are you absolutely sure you want to proceed?
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRevokeDialog(null)}
                disabled={revokeMutation.isPending}
                data-testid="button-cancel-revoke"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRevoke}
                disabled={revokeMutation.isPending}
                data-testid="button-confirm-revoke"
              >
                {revokeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Yes, Revoke Authority
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
