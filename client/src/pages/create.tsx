import { EvmTokenCreationForm as EvmTokenForm } from "@/components/evm-token-creation-form";
import { type EvmTokenCreationForm, SUPPORTED_CHAINS } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEvmWallet } from "@/contexts/EvmWalletContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { handleWeb3Error, retryWithBackoff } from "@/utils/errorHandling";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionHistory } from "@/components/TransactionHistory";

export default function Create() {
  const { address, isConnected, connect, chainId: walletChainId } = useEvmWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { addTransaction, updateTransaction } = useTransactions();

  const deployMutation = useMutation({
    mutationFn: async (data: EvmTokenCreationForm) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      let tokenRecordId: string | null = null;
      let txId: string | null = null;
      
      // Find chain info
      const chainInfo = Object.values(SUPPORTED_CHAINS).find(
        chain => chain.name === data.chainId || 
        Object.keys(SUPPORTED_CHAINS).find(k => k === data.chainId)
      );

      try {
        // Add optimistic transaction
        txId = addTransaction({
          type: 'deployment',
          status: 'pending',
          description: `Deploying ${data.symbol} token on ${chainInfo?.name || data.chainId}`,
          chainId: chainInfo?.chainId || 1,
          hash: '',
          from: address,
        });

        // Step 1: Create pending token record
        const response = await retryWithBackoff(async () => 
          await apiRequest("POST", "/api/tokens/deploy", {
            ...data,
            blockchainType: "EVM",
            deployerAddress: address,
          })
        );
        const tokenRecord = await response.json();
        tokenRecordId = tokenRecord.id;

        // Step 2: Deploy contract using wallet
        const { deployEvmToken } = await import('@/utils/evmDeployer');
        const deploymentResult = await deployEvmToken(
          data.name,
          data.symbol,
          data.decimals,
          data.totalSupply,
          data.chainId,
          {
            isMintable: data.isMintable,
            isBurnable: data.isBurnable,
            isPausable: data.isPausable,
            isCapped: data.isCapped,
            hasTax: data.hasTax,
            hasBlacklist: data.hasBlacklist,
            maxSupply: data.maxSupply,
            taxPercentage: data.taxPercentage,
            treasuryWallet: data.treasuryWallet,
          }
        );

        // Update transaction with hash
        if (txId) {
          updateTransaction(txId, {
            hash: deploymentResult.transactionHash,
            to: deploymentResult.contractAddress,
          });
        }

        // Step 3: Update token record with deployment result
        await apiRequest("POST", `/api/tokens/${tokenRecordId}/status`, {
          status: "deployed",
          contractAddress: deploymentResult.contractAddress,
          transactionHash: deploymentResult.transactionHash,
        });

        // Mark transaction as confirmed
        if (txId) {
          updateTransaction(txId, {
            status: 'confirmed',
            description: `Successfully deployed ${data.symbol} token`,
            metadata: {
              contractAddress: deploymentResult.contractAddress,
              tokenName: data.name,
              tokenSymbol: data.symbol,
            },
          });
        }

        return { ...tokenRecord, ...deploymentResult };
      } catch (error: any) {
        // Mark transaction as failed
        if (txId) {
          updateTransaction(txId, {
            status: 'failed',
            error: error.message,
          });
        }

        // Mark the original pending record as failed
        if (tokenRecordId) {
          try {
            await apiRequest("POST", `/api/tokens/${tokenRecordId}/status`, {
              status: "failed",
            });
          } catch (updateError) {
            console.error('Failed to update token status:', updateError);
          }
        }
        
        await handleWeb3Error(error, {
          context: 'Token Deployment',
          showToast: false, // We'll handle the toast ourselves
        });
        
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Token Deployed Successfully!
          </div>
        ) as any,
        description: `Contract: ${data.contractAddress}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setTimeout(() => setLocation("/dashboard"), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: EvmTokenCreationForm) => {
    deployMutation.mutate(data);
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast({
        title: 'Wallet Connected',
        description: 'Your MetaMask wallet has been connected successfully',
      });
    } catch (error: any) {
      await handleWeb3Error(error, {
        context: 'Wallet Connection',
        showToast: true,
      });
    }
  };

  return (
    <div className="container max-w-5xl py-12 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">
          Create EVM Token
        </h1>
        <p className="text-gray-400">
          Deploy your custom ERC20 token on Ethereum and BSC (BEP-20)
        </p>
      </div>

      <EvmTokenForm
        onSubmit={handleSubmit}
        isLoading={deployMutation.isPending}
        isConnected={isConnected}
      />
    </div>
  );
}
