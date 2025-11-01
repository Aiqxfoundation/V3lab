import { useParams, Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import { getChainConfig } from "@/config/chains";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import existing manage pages
import ManageSolana from "@/pages/manage-solana";
import ManageEvm from "@/pages/manage-evm";
import { getChainType } from "@/config/chains";

export default function ChainManage() {
  const params = useParams();
  const chainId = params.chainId as string;
  const chain = getChainConfig(chainId);
  const chainType = getChainType(chainId);

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

  // Render the appropriate manage page based on chain type
  let ManageComponent;
  if (chainType === 'solana') {
    ManageComponent = ManageSolana;
  } else if (chainType === 'evm') {
    ManageComponent = ManageEvm;
  } else {
    return (
      <MainLayout currentChainId={chainId}>
        <div className="text-center py-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Token management for {chain.displayName} is coming soon!
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentChainId={chainId}>
      <ManageComponent />
    </MainLayout>
  );
}
