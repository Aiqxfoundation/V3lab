import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, ShieldOff, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { SUPPORTED_CHAINS, ChainConfig, getChainConfig } from "@/config/chains";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

interface DeployedToken {
  id: number;
  name: string;
  symbol: string;
  contractAddress: string;
  chain: string;
  tokenType: string;
}

export default function ManageAuthorities() {
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [revokeOwnership, setRevokeOwnership] = useState(false);
  const [revokeMint, setRevokeMint] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokePause, setRevokePause] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: tokens, isLoading } = useQuery<DeployedToken[]>({
    queryKey: ["/api/tokens"],
    enabled: !!selectedChain,
  });

  const filteredTokens = tokens?.filter(t => t.chain === selectedChain) || [];
  const selectedTokenData = filteredTokens.find(t => t.contractAddress === selectedToken);
  
  // Correctly detect chain type - Solana is the only non-EVM chain
  const isSolana = selectedChain === "solana";
  const isEVM = selectedChain && !isSolana;

  const handleRevokeAuthorities = async () => {
    if (!selectedToken || !selectedTokenData) {
      toast({
        title: "Error",
        description: "Please select a token first",
        variant: "destructive",
      });
      return;
    }

    if (!revokeOwnership && !revokeMint && !revokeFreeze && !revokePause) {
      toast({
        title: "Error",
        description: "Please select at least one authority to revoke",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (isEVM) {
        await revokeEVMAuthorities();
      } else if (isSolana) {
        await revokeSolanaAuthorities();
      }
    } catch (error: any) {
      toast({
        title: "Revocation Failed",
        description: error.message || "Failed to revoke authorities",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const revokeEVMAuthorities = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Build ABI based on what the user wants to revoke
    const abi = [
      "function renounceOwnership() public",
      "function renouncePauser() public",
      "function renounceMinter() public",
    ];
    
    const contract = new ethers.Contract(selectedToken, abi, signer);

    // Execute each selected revocation
    if (revokeOwnership) {
      try {
        const tx = await contract.renounceOwnership();
        await tx.wait();
        toast({
          title: "Ownership Revoked",
          description: "Successfully renounced contract ownership",
        });
      } catch (error: any) {
        toast({
          title: "Ownership Revocation Failed",
          description: error.message || "Failed to renounce ownership",
          variant: "destructive",
        });
      }
    }

    if (revokeMint && selectedTokenData?.tokenType.includes('mintable')) {
      try {
        const tx = await contract.renounceMinter();
        await tx.wait();
        toast({
          title: "Mint Authority Revoked",
          description: "Successfully revoked minting capability",
        });
      } catch (error: any) {
        toast({
          title: "Mint Revocation Failed",
          description: error.message || "Failed to revoke mint authority",
          variant: "destructive",
        });
      }
    }

    if (revokePause && selectedTokenData?.tokenType.includes('pausable')) {
      try {
        const tx = await contract.renouncePauser();
        await tx.wait();
        toast({
          title: "Pause Authority Revoked",
          description: "Successfully revoked pause capability",
        });
      } catch (error: any) {
        toast({
          title: "Pause Revocation Failed",
          description: error.message || "Failed to revoke pause authority",
          variant: "destructive",
        });
      }
    }

    // Check if at least one action was taken
    if (!revokeOwnership && !revokeMint && !revokePause) {
      throw new Error("No valid authorities selected for this token type");
    }
  };

  const revokeSolanaAuthorities = async () => {
    // TODO: Implement Solana authority revocation using @solana/spl-token
    // This requires:
    // 1. Get user's Solana wallet
    // 2. Load mint account
    // 3. Call setAuthority with null for mint/freeze authorities
    
    toast({
      title: "Coming Soon",
      description: "Solana authority revocation will be implemented in the next update",
    });
    
    throw new Error("Solana authority revocation not yet implemented");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldOff className="h-8 w-8 text-orange-500" />
          Manage Token Authorities
        </h1>
        <p className="text-gray-400">
          Revoke specific authorities from your deployed tokens for enhanced security
        </p>
      </div>

      <Alert className="mb-6 border-orange-500/20 bg-orange-500/5">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-sm text-gray-300">
          <strong>Warning:</strong> Revoking authorities is permanent and cannot be undone. Only revoke authorities you no longer need.
        </AlertDescription>
      </Alert>

      <Card className="border-gray-800 bg-gray-900/50 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-500" />
            Select Token
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose the blockchain and token to manage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blockchain Network
            </label>
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger 
                className="bg-gray-800 border-gray-700 text-white"
                data-testid="select-chain"
              >
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem 
                    key={chain.id} 
                    value={chain.id}
                    className="text-white hover:bg-gray-700"
                  >
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChain && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token
              </label>
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading tokens...
                </div>
              ) : filteredTokens.length === 0 ? (
                <Alert className="border-gray-700 bg-gray-800">
                  <AlertDescription className="text-gray-400">
                    No tokens found on this chain. Deploy a token first.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger 
                    className="bg-gray-800 border-gray-700 text-white"
                    data-testid="select-token"
                  >
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {filteredTokens.map((token) => (
                      <SelectItem 
                        key={token.id} 
                        value={token.contractAddress}
                        className="text-white hover:bg-gray-700"
                      >
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {selectedTokenData && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract:</span>
                <span className="text-white font-mono text-sm">
                  {selectedTokenData.contractAddress.slice(0, 6)}...{selectedTokenData.contractAddress.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-cyan-400 capitalize">{selectedTokenData.tokenType}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTokenData && (
        <Card className="border-gray-800 bg-gray-900/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Revoke Authorities</CardTitle>
            <CardDescription className="text-gray-400">
              Select which authorities to permanently revoke
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEVM && (
              <>
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <Checkbox
                    id="revoke-ownership"
                    checked={revokeOwnership}
                    onCheckedChange={(checked) => setRevokeOwnership(checked as boolean)}
                    data-testid="checkbox-revoke-ownership"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="revoke-ownership"
                      className="text-sm font-medium text-white cursor-pointer"
                    >
                      Renounce Ownership
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Permanently give up contract ownership. No one will be able to manage this contract.
                    </p>
                  </div>
                </div>

                {selectedTokenData.tokenType.includes('mintable') && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <Checkbox
                      id="revoke-mint"
                      checked={revokeMint}
                      onCheckedChange={(checked) => setRevokeMint(checked as boolean)}
                      data-testid="checkbox-revoke-mint"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="revoke-mint"
                        className="text-sm font-medium text-white cursor-pointer"
                      >
                        Disable Minting
                      </label>
                      <p className="text-xs text-gray-400 mt-1">
                        Permanently disable the ability to mint new tokens.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTokenData.tokenType.includes('pausable') && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <Checkbox
                      id="revoke-pause"
                      checked={revokePause}
                      onCheckedChange={(checked) => setRevokePause(checked as boolean)}
                      data-testid="checkbox-revoke-pause"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="revoke-pause"
                        className="text-sm font-medium text-white cursor-pointer"
                      >
                        Disable Pause Function
                      </label>
                      <p className="text-xs text-gray-400 mt-1">
                        Permanently disable the pause/unpause functionality.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {isSolana && (
              <>
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <Checkbox
                    id="revoke-mint-solana"
                    checked={revokeMint}
                    onCheckedChange={(checked) => setRevokeMint(checked as boolean)}
                    data-testid="checkbox-revoke-mint-solana"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="revoke-mint-solana"
                      className="text-sm font-medium text-white cursor-pointer"
                    >
                      Revoke Mint Authority
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Permanently disable minting new tokens on Solana.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <Checkbox
                    id="revoke-freeze-solana"
                    checked={revokeFreeze}
                    onCheckedChange={(checked) => setRevokeFreeze(checked as boolean)}
                    data-testid="checkbox-revoke-freeze-solana"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="revoke-freeze-solana"
                      className="text-sm font-medium text-white cursor-pointer"
                    >
                      Revoke Freeze Authority
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Permanently disable the ability to freeze token accounts.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTokenData && (
        <Button
          onClick={handleRevokeAuthorities}
          disabled={isProcessing || (!revokeOwnership && !revokeMint && !revokeFreeze && !revokePause)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          data-testid="button-revoke-authorities"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Revoking Authorities...
            </>
          ) : (
            <>
              <ShieldOff className="mr-2 h-4 w-4" />
              Revoke Selected Authorities
            </>
          )}
        </Button>
      )}

      {selectedTokenData && (
        <Alert className="mt-6 border-green-500/20 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm text-gray-300">
            After revoking authorities, your token will be more decentralized and trustless. Users can verify on blockchain explorers that these authorities have been revoked.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
