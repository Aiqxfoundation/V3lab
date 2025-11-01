import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CHAIN_DEFINITIONS, getChainType } from "@/config/chains";
import { useChain } from "@/contexts/ChainContext";
import { ChainSwitcher } from "./chain-switcher";
import { 
  Home, X, ChevronRight,
  Coins, Send, UserPlus, ShieldOff, Plus, Flame, Snowflake, Image as ImageIcon, BarChart3, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentChainId?: string;
}

export default function MobileMenu({ isOpen, onClose, currentChainId }: MobileMenuProps) {
  const [location] = useLocation();
  const [authorityToolsExpanded, setAuthorityToolsExpanded] = useState(false);
  const { selectedChain } = useChain();
  const chains = Object.values(CHAIN_DEFINITIONS);
  const selectedChainConfig = CHAIN_DEFINITIONS[selectedChain];
  const chainType = selectedChain ? getChainType(selectedChain) : null;

  const MenuItem = ({ href, icon: Icon, label, onClick, testId }: any) => (
    <Link href={href} onClick={onClick || onClose}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors rounded-md",
          location === href
            ? "bg-cyan-500/10 text-cyan-500"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
        data-testid={testId}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );

  const ExpandableMenu = ({ label, expanded, setExpanded, icon: Icon, children }: any) => (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium flex-1 text-left">{label}</span>
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform",
          expanded && "rotate-90"
        )} />
      </button>
      {expanded && (
        <div className="ml-7 space-y-0.5 border-l border-gray-200 dark:border-gray-800 pl-3 py-1">
          {children}
        </div>
      )}
    </div>
  );

  const SubMenuItem = ({ href, label }: any) => (
    <Link href={href} onClick={onClose}>
      <div
        className={cn(
          "px-3 py-2 text-sm cursor-pointer transition-colors rounded-md",
          location === href
            ? "text-cyan-500 font-medium"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        )}
      >
        {label}
      </div>
    </Link>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
          data-testid="menu-backdrop"
        />
      )}

      {/* Menu */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-out overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" opacity="0.7" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">AIQX Labs</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            data-testid="button-close-menu"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-3 space-y-1">
          <MenuItem href="/" icon={Home} label="Home" testId="link-home-menu" />

          {/* Chain Switcher (Mobile) */}
          <div className="py-2">
            <ChainSwitcher />
          </div>

          {/* Unified Chain Tools - Use chain configuration for all routes */}
          {selectedChainConfig && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {selectedChainConfig.displayName} Tools
              </div>
              
              {/* Dynamically render all tools from chain configuration */}
              {selectedChainConfig.tools.map((tool) => {
                const iconMapping: Record<string, any> = {
                  'Coins': Coins,
                  'Settings': Settings,
                  'Plus': Plus,
                  'Flame': Flame,
                  'Pause': Settings,
                  'Snowflake': Snowflake,
                  'Shield': ShieldOff,
                  'Image': ImageIcon,
                  'Send': Send,
                };
                
                const Icon = iconMapping[tool.icon] || Coins;
                
                if (!tool.available) {
                  return null;
                }
                
                return (
                  <MenuItem 
                    key={tool.id}
                    href={tool.route} 
                    icon={Icon} 
                    label={tool.name} 
                    testId={`link-${tool.id}`} 
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
