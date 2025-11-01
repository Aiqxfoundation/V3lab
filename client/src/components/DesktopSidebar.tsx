import { Link, useLocation } from "wouter";
import { ChainConfig } from "@/config/chains";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { 
  Coins, Settings, Plus, Flame, Pause, Shield, Send, Snowflake, Image, UserPlus, UserX
} from "lucide-react";

interface DesktopSidebarProps {
  chain: ChainConfig;
}

const iconMap: Record<string, any> = {
  'Coins': Coins,
  'Settings': Settings,
  'Plus': Plus,
  'Flame': Flame,
  'Pause': Pause,
  'Shield': Shield,
  'Send': Send,
  'Snowflake': Snowflake,
  'Image': Image,
  'UserPlus': UserPlus,
  'UserX': UserX,
};

export default function DesktopSidebar({ chain }: DesktopSidebarProps) {
  const [location] = useLocation();

  return (
    <div className="hidden lg:block w-64 bg-gray-900 border-r border-gray-800 h-[calc(100vh-4rem)] sticky top-16 left-0 overflow-y-auto">
      <div className="p-4">
        {/* Chain Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <chain.icon className="h-5 w-5" style={{ color: chain.color }} />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              {chain.displayName} Tools
            </h2>
          </div>
          <div className="h-px bg-gray-800" />
        </div>

        {/* Tools List */}
        <nav className="space-y-1">
          {chain.tools.map((tool) => {
            const Icon = iconMap[tool.icon] || Coins;
            const isActive = location === tool.route || location.includes(tool.route.split('#')[0]);
            
            if (!tool.available) {
              return (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed opacity-50"
                  data-testid={`sidebar-${tool.id}`}
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 truncate">{tool.name}</p>
                  </div>
                  {tool.comingSoon && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Soon
                    </Badge>
                  )}
                </div>
              );
            }

            return (
              <Link key={tool.id} href={tool.route}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
                    isActive
                      ? "bg-cyan-900/20 text-cyan-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                  data-testid={`sidebar-${tool.id}`}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors",
                      isActive ? "text-cyan-400" : "text-gray-300 group-hover:text-white"
                    )}>
                      {tool.name}
                    </p>
                  </div>
                  {tool.comingSoon && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Soon
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
