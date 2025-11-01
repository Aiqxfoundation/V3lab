import { useParams } from "wouter";
import { getChainConfig } from "@/config/chains";
import { useQuery } from "@tanstack/react-query";
import { useEvmWallet } from "@/contexts/EvmWalletContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  ExternalLink, 
  Plus, 
  Flame, 
  Pause,
  Ban,
  Percent,
  Shield,
  Copy,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { DeployedToken } from "@shared/schema";

export default function ManageEvmPage() {
  const params = useParams();
  const chainId = params.chainId as string;
  const chain = getChainConfig(chainId);
  const { address, isConnected } = useEvmWallet();
  const { toast } = useToast();
  const [selectedToken, setSelectedToken] = useState<DeployedToken | null>(null);

  if (!chain) {
    return <div>Chain not found</div>;
  }

  // Fetch deployed tokens for this chain and user
  const { data: allTokens, isLoading } = useQuery<DeployedToken[]>({
    queryKey: ['/api/tokens'],
    enabled: isConnected,
  });

  const tokens = allTokens?.filter(
    (token) => 
      token.blockchain === 'evm' && 
      token.network?.startsWith(chainId) &&
      token.deployerAddress?.toLowerCase() === address?.toLowerCase() &&
      token.status === 'deployed'
  ) || [];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getExplorerUrl = (contractAddress: string) => {
    return `${chain.explorer}/address/${contractAddress}`;
  };

  if (!isConnected) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert className="border-yellow-500/20 bg-yellow-500/5">
          <Wallet className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            Connect your wallet using the button in the top-right corner to view and manage your tokens
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="border-gray-800">
          <CardContent className="py-12 text-center">
            <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tokens Found</h3>
            <p className="text-gray-400 mb-6">
              You haven't deployed any tokens on {chain.displayName} yet
            </p>
            <Button 
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={() => window.location.href = `/chain/${chainId}/create`}
            >
              Create Your First Token
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Manage {chain.displayName} Tokens</h1>
        <p className="text-gray-400">View and manage your deployed tokens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Your Tokens ({tokens.length})</h2>
          {tokens.map((token) => (
            <Card
              key={token.id}
              className={`border-gray-800 bg-gray-900/50 cursor-pointer transition-all hover:border-cyan-500/50 ${
                selectedToken?.id === token.id ? "border-cyan-500" : ""
              }`}
              onClick={() => setSelectedToken(token)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-base">{token.name}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      ${token.symbol}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-cyan-500 border-cyan-500/20 text-xs">
                    {chain.displayName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supply:</span>
                    <span className="text-white font-mono">{token.totalSupply}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {token.isMintable && (
                      <Badge variant="secondary" className="text-xs bg-cyan-500/10 text-cyan-500">
                        <Plus className="h-3 w-3 mr-1" /> Mintable
                      </Badge>
                    )}
                    {token.isBurnable && (
                      <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500">
                        <Flame className="h-3 w-3 mr-1" /> Burnable
                      </Badge>
                    )}
                    {token.isPausable && (
                      <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500">
                        <Pause className="h-3 w-3 mr-1" /> Pausable
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Token Details */}
        <div className="lg:col-span-2">
          {selectedToken ? (
            <div className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-500" />
                    {selectedToken.name} Control Panel
                  </CardTitle>
                  <CardDescription>
                    Manage features and settings for your token
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contract Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Contract Address</h3>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-800 px-3 py-2 rounded border border-gray-700 text-cyan-400 flex-1 font-mono overflow-x-auto">
                        {selectedToken.contractAddress}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700"
                        onClick={() => copyToClipboard(selectedToken.contractAddress!, "Contract address")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700"
                        onClick={() => window.open(getExplorerUrl(selectedToken.contractAddress!), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Token Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Total Supply</p>
                      <p className="text-lg font-semibold text-white font-mono">{selectedToken.totalSupply}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Decimals</p>
                      <p className="text-lg font-semibold text-white">{selectedToken.decimals}</p>
                    </div>
                  </div>

                  {/* Active Features */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Active Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedToken.isMintable && (
                        <Card className="border-cyan-500/20 bg-cyan-500/5">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Plus className="h-4 w-4 text-cyan-500" />
                              <span className="text-sm font-medium text-white">Mintable</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Can create new tokens</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-700 text-gray-300 text-xs"
                              onClick={() => window.location.href = `/chain/${chainId}/tools#mint`}
                            >
                              Mint Tokens
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {selectedToken.isBurnable && (
                        <Card className="border-orange-500/20 bg-orange-500/5">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium text-white">Burnable</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Can destroy tokens</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-700 text-gray-300 text-xs"
                              onClick={() => window.location.href = `/chain/${chainId}/tools#burn`}
                            >
                              Burn Tokens
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {selectedToken.isPausable && (
                        <Card className="border-purple-500/20 bg-purple-500/5">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Pause className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium text-white">Pausable</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Can pause transfers</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-700 text-gray-300 text-xs"
                              onClick={() => window.location.href = `/chain/${chainId}/tools#pause`}
                            >
                              Manage Pause
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {selectedToken.hasTax && (
                        <Card className="border-green-500/20 bg-green-500/5">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Percent className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-white">Transfer Tax</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{selectedToken.taxPercentage}% tax on transfers</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-700 text-gray-300 text-xs"
                              onClick={() => window.location.href = `/chain/${chainId}/tools#tax`}
                            >
                              Update Tax
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {selectedToken.hasBlacklist && (
                        <Card className="border-red-500/20 bg-red-500/5">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Ban className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-white">Blacklist</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Can block addresses</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-700 text-gray-300 text-xs"
                              onClick={() => window.location.href = `/chain/${chainId}/tools#blacklist`}
                            >
                              Manage Blacklist
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {selectedToken.isCapped && (
                        <Card className="border-blue-500/20 bg-blue-500/5">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-white">Capped Supply</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">Max: {selectedToken.maxSupply}</p>
                            <Badge variant="outline" className="w-full justify-center text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => window.location.href = `/chain/${chainId}/tools`}
                      >
                        Open Tools
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => window.open(getExplorerUrl(selectedToken.contractAddress!), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-gray-800 bg-gray-900/50">
              <CardContent className="py-16 text-center">
                <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Token</h3>
                <p className="text-gray-400">
                  Choose a token from the list to view details and manage features
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
