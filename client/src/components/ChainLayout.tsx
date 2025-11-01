import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChainConfig } from "@/config/chains";
import { Home, Coins, Settings, Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChainLayoutProps {
  chain: ChainConfig;
  children: React.ReactNode;
  activeTab: 'overview' | 'create' | 'manage' | 'tools';
}

export function ChainLayout({ chain, children, activeTab }: ChainLayoutProps) {
  const [location, setLocation] = useLocation();
  const IconComponent = chain.icon;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home, route: chain.routes.overview },
    { id: 'create', label: 'Create Token', icon: Coins, route: chain.routes.create },
    { id: 'manage', label: 'Manage Tokens', icon: Settings, route: chain.routes.manage },
    { id: 'tools', label: 'Advanced Tools', icon: Wrench, route: chain.routes.tools },
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Header with Chain Branding */}
      <div className="relative py-12 px-6 bg-gray-900 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative max-w-7xl mx-auto">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-6 text-gray-400 hover:text-white hover:bg-gray-800"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 p-0.5">
              <div className="h-full w-full rounded-lg bg-[#00d4ff]/20 flex items-center justify-center">
                <IconComponent className="h-10 w-10 text-[#00d4ff]" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">
                {chain.displayName}
              </h1>
              <p className="text-gray-400 text-lg">
                {chain.network}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <Link key={tab.id} href={tab.route}>
                    <TabsTrigger 
                      value={tab.id} 
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full"
                      data-testid={`tab-${tab.id}`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  </Link>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
