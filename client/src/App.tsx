import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ChainProvider } from "@/contexts/ChainContext";
import { EvmWalletProvider } from "@/contexts/EvmWalletContext";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { ChainSwitchHandler } from "@/components/ChainSwitchHandler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Lazy load all chain-specific pages to optimize bundle size
const ChainOverview = lazy(() => import("@/pages/chain-overview"));
const ChainCreate = lazy(() => import("@/pages/chain-create"));
const ChainManage = lazy(() => import("@/pages/chain-manage"));
const ChainTools = lazy(() => import("@/pages/chain-tools"));
const ManageAuthorities = lazy(() => import("@/pages/manage-authorities"));
const HelpPage = lazy(() => import("@/pages/help"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const WalletDiagnostics = lazy(() => import("@/pages/wallet-diagnostics"));

// Solana-specific tool pages
const SolanaMint = lazy(() => import("@/pages/solana-mint"));
const SolanaBurn = lazy(() => import("@/pages/solana-burn"));
const SolanaFreeze = lazy(() => import("@/pages/solana-freeze"));
const SolanaAuthority = lazy(() => import("@/pages/solana-authority"));
const SolanaMetadata = lazy(() => import("@/pages/solana-metadata"));
const SolanaMultisender = lazy(() => import("@/pages/solana-multisender"));

// EVM-specific tool pages
const EvmMint = lazy(() => import("@/pages/evm-mint"));
const EvmBurn = lazy(() => import("@/pages/evm-burn"));
const EvmPause = lazy(() => import("@/pages/evm-pause"));
const EvmBlacklist = lazy(() => import("@/pages/evm-blacklist"));
const EvmRevokeAuthority = lazy(() => import("@/pages/evm-revoke-authority"));
const EvmMultisender = lazy(() => import("@/pages/evm-multisender"));

// Import chain-aware route creator
import { createChainAwareRoute } from "@/components/ChainAwareRoute";

// Create chain-aware routes that render different pages based on chain type
const MintRoute = createChainAwareRoute(EvmMint, SolanaMint);
const BurnRoute = createChainAwareRoute(EvmBurn, SolanaBurn);
const MultisendRoute = createChainAwareRoute(EvmMultisender, SolanaMultisender);

// Loading component
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Help & Management */}
        <Route path="/help" component={HelpPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/wallet-diagnostics" component={WalletDiagnostics} />
        
        {/* Authority Management */}
        <Route path="/manage-authorities" component={ManageAuthorities} />
        
        {/* Chain-Based Routes - All chains use unified routing */}
        <Route path="/chain/:chainId" component={ChainOverview} />
        <Route path="/chain/:chainId/create" component={ChainCreate} />
        <Route path="/chain/:chainId/manage" component={ChainManage} />
        <Route path="/chain/:chainId/tools" component={ChainTools} />
        
        {/* Chain-aware shared routes - renders EVM or Solana page based on chain type */}
        <Route path="/chain/:chainId/mint" component={MintRoute} />
        <Route path="/chain/:chainId/burn" component={BurnRoute} />
        <Route path="/chain/:chainId/multisend" component={MultisendRoute} />
        
        {/* EVM-only Tool Pages */}
        <Route path="/chain/:chainId/pause" component={EvmPause} />
        <Route path="/chain/:chainId/blacklist" component={EvmBlacklist} />
        <Route path="/chain/:chainId/revoke" component={EvmRevokeAuthority} />
        
        {/* Solana-only Tool Pages */}
        <Route path="/chain/:chainId/freeze" component={SolanaFreeze} />
        <Route path="/chain/:chainId/authority" component={SolanaAuthority} />
        <Route path="/chain/:chainId/metadata" component={SolanaMetadata} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <ChainProvider>
              <TransactionProvider>
                <EvmWalletProvider>
                  <SolanaWalletProvider>
                    <ChainSwitchHandler />
                    <Router />
                    <Toaster />
                  </SolanaWalletProvider>
                </EvmWalletProvider>
              </TransactionProvider>
            </ChainProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
