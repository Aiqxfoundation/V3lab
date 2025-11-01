import { useParams, Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getChainConfig } from "@/config/chains";
import { lazy, Suspense } from "react";

const EthereumOverview = lazy(() => import("@/pages/overviews/ethereum-overview"));
const BnbOverview = lazy(() => import("@/pages/overviews/bnb-overview"));
const SolanaOverview = lazy(() => import("@/pages/overviews/solana-overview"));

export default function ChainOverview() {
  const params = useParams();
  const chainId = params.chainId as string;
  const chain = getChainConfig(chainId);

  if (!chain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Card className="p-8 text-center border-gray-800 bg-gray-900">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Blockchain Not Found
          </h2>
          <p className="text-gray-400 mb-4">
            The blockchain you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button 
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Determine which overview component to render based on chain
  let OverviewComponent;
  const baseChain = chainId.split('-')[0]; // ethereum, bsc, solana
  
  if (baseChain === 'ethereum' || chainId.includes('sepolia')) {
    OverviewComponent = EthereumOverview;
  } else if (baseChain === 'bsc') {
    OverviewComponent = BnbOverview;
  } else if (baseChain === 'solana') {
    OverviewComponent = SolanaOverview;
  } else {
    // Fallback generic overview
    OverviewComponent = EthereumOverview;
  }

  return (
    <MainLayout currentChainId={chainId}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 w-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <div className="h-6 w-6 rounded-full bg-cyan-500"></div>
              </div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      }>
        <OverviewComponent chainId={chainId} chain={chain} />
      </Suspense>
    </MainLayout>
  );
}
