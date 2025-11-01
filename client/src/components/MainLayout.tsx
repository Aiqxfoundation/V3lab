import { useState } from "react";
import { Link, useLocation } from "wouter";
import MobileMenu from "./MobileMenu";
import DesktopSidebar from "./DesktopSidebar";
import { ThemeToggle } from "./theme-toggle";
import { ChainSwitcher } from "./chain-switcher";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Menu, Settings, Wallet, Check, LogOut, AlertCircle, Loader2, Wrench, BookOpen, BarChart3 } from "lucide-react";
import { getChainConfig, getChainType } from "@/config/chains";
import { useEvmWallet } from "@/contexts/EvmWalletContext";
import { useSolanaWallet } from "@/contexts/SolanaWalletContext";
import { NetworkSwitcher } from "./network-switcher";
import { UnifiedWalletModal } from "./unified-wallet-modal";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
  currentChainId?: string;
}

export default function MainLayout({ children, currentChainId }: MainLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const chain = currentChainId ? getChainConfig(currentChainId) : null;
  const chainType = currentChainId ? getChainType(currentChainId) : null;
  
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const { toast } = useToast();

  const isConnected = chainType === 'evm' ? evmWallet.isConnected : 
                     chainType === 'solana' ? solanaWallet.isConnected : 
                     false;

  const address = chainType === 'evm' ? evmWallet.address : 
                 chainType === 'solana' ? solanaWallet.publicKey : 
                 null;

  const walletProvider = chainType === 'solana' ? solanaWallet.walletProvider : null;

  const handleDisconnect = () => {
    if (chainType === 'evm') {
      evmWallet.disconnect();
    } else if (chainType === 'solana') {
      solanaWallet.disconnect();
    }
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getWalletName = () => {
    if (chainType === 'evm') return 'MetaMask';
    if (chainType === 'solana' && walletProvider) {
      return walletProvider.charAt(0).toUpperCase() + walletProvider.slice(1);
    }
    return 'Wallet';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Slide-out Menu */}
      <MobileMenu 
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentChainId={currentChainId}
      />

      {/* Unified Wallet Modal */}
      {chainType && (
        <UnifiedWalletModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          chainType={chainType}
        />
      )}

      {/* Full Width Layout */}
      <div className="w-full">
        {/* Professional Header Bar with Glass Effect */}
        <div className="h-16 dark:bg-card/80 bg-card/95 border-b dark:border-border border-border/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-xl backdrop-saturate-150 premium-shadow">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-xl dark:hover:bg-primary/10 hover:bg-primary/5 transition-all hover:scale-105 active:scale-95"
              data-testid="button-open-menu"
            >
              <Menu className="h-5 w-5 dark:text-foreground text-foreground" />
            </button>

            {/* Premium Logo with Gradient */}
            <Link href="/">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="h-9 w-9 rounded-xl gradient-ai flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" opacity="0.7" />
                  </svg>
                </div>
                <span className="text-base font-bold gradient-ai-text hidden sm:block">
                  AIQX Labs
                </span>
              </div>
            </Link>

            {/* Chain Switcher */}
            {!chain && (
              <>
                <div className="h-5 w-px bg-border mx-2 hidden lg:block" />
                <div className="hidden lg:block">
                  <ChainSwitcher />
                </div>
              </>
            )}
            
            {/* Chain Info - only on chain pages */}
            {chain && (
              <>
                <div className="h-5 w-px bg-border mx-2 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2">
                  <chain.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {chain.displayName}
                  </span>
                </div>
                
                {/* Chain Tools Dropdown */}
                {chain.tools && chain.tools.length > 0 && (
                  <>
                    <div className="h-5 w-px bg-border mx-2 hidden md:block" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden md:flex gap-2 text-foreground hover:text-primary hover:bg-primary/10"
                          data-testid="button-tools-menu"
                        >
                          <Wrench className="h-4 w-4" />
                          Tools
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>
                          {chain.displayName} Tools
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {chain.tools.map((tool) => 
                          tool.available ? (
                            <Link key={tool.id} href={tool.route}>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                data-testid={`tool-${tool.id}`}
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{tool.name}</span>
                                    {tool.comingSoon && (
                                      <Badge variant="secondary" className="text-xs">
                                        Coming Soon
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {tool.description}
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            </Link>
                          ) : (
                            <DropdownMenuItem
                              key={tool.id}
                              className="cursor-not-allowed opacity-50"
                              disabled={true}
                              data-testid={`tool-${tool.id}`}
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tool.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    Coming Soon
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {tool.description}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Help & Manage Links */}
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex gap-2 text-foreground hover:text-primary hover:bg-primary/10"
                data-testid="button-dashboard"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/help">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex gap-2 text-foreground hover:text-primary hover:bg-primary/10"
                data-testid="button-help"
              >
                <BookOpen className="h-4 w-4" />
                Help
              </Button>
            </Link>

            {/* Network Switcher - shows when connected to EVM */}
            {chainType === 'evm' && isConnected && <NetworkSwitcher />}

            {/* Wrong Network Warning - EVM only */}
            {chainType === 'evm' && evmWallet.isWrongNetwork && (
              <Badge 
                variant="destructive" 
                className="gap-1 animate-pulse hidden sm:flex"
                data-testid="badge-network-warning"
              >
                <AlertCircle className="h-3 w-3" />
                Wrong Network
              </Badge>
            )}

            {/* Wallet Connection Button */}
            {!isConnected ? (
              <Button 
                className="gradient-ai text-white hover:opacity-90 text-sm font-bold px-4 transition-all hover:scale-105 active:scale-95 shadow-lg"
                size="sm"
                onClick={() => setShowWalletModal(true)}
                disabled={!chainType}
                data-testid="button-connect-wallet"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 font-mono hover:scale-105 active:scale-95 transition-all"
                    data-testid="button-wallet-menu"
                  >
                    <div className="relative">
                      <Wallet className="h-4 w-4" />
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    {formatAddress(address!)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Connected via {getWalletName()}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatAddress(address!)}
                      </p>
                      {chainType === 'evm' && evmWallet.networkName && (
                        <p className="text-xs text-muted-foreground">
                          {evmWallet.networkName}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(address!);
                      toast({
                        title: "Address copied",
                        description: "Wallet address copied to clipboard",
                      });
                    }}
                    className="cursor-pointer"
                    data-testid="menu-item-copy-address"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="cursor-pointer text-destructive"
                    data-testid="menu-item-disconnect"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex hover:bg-primary/10 transition-all hover:scale-105 active:scale-95"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content Area with Optional Sidebar */}
        <div className="flex w-full">
          {/* Desktop Sidebar - only shown on chain pages */}
          {chain && <DesktopSidebar chain={chain} />}
          
          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
