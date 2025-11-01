import { useParams, Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import { getChainConfig } from "@/config/chains";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

// Import existing tools pages
import ToolsSolana from "@/pages/tools-solana";
import EvmTools from "@/pages/tools-evm";

export default function ChainTools() {
  const params = useParams();
  const chainId = params.chainId as string;
  const chain = getChainConfig(chainId);

  if (!chain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Blockchain Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The blockchain you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Render the appropriate tools page based on chain type
  if (chain.blockchainType === 'Solana') {
    return (
      <MainLayout currentChainId={chainId}>
        <ToolsSolana />
      </MainLayout>
    );
  }

  // All EVM chains use the unified EVM tools page
  return (
    <MainLayout currentChainId={chainId}>
      <EvmTools 
        chainId={chainId}
        chainName={chain.displayName}
        gradient={chain.gradient}
      />
    </MainLayout>
  );
}
