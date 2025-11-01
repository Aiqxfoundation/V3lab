import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Rocket, Shield, Cog, Info } from "lucide-react";

interface HelpPage {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const helpPages: HelpPage[] = [
  {
    id: 1,
    title: "Getting Started",
    icon: <BookOpen className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Welcome to Token Creator Platform</h3>
        <p className="text-gray-300">
          This platform allows you to create professional tokens on Ethereum, Binance Smart Chain, and Solana blockchains with advanced features.
        </p>
        
        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-white">Quick Start Guide:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Connect your wallet (MetaMask for EVM chains, Phantom/Solflare for Solana)</li>
            <li>Select your blockchain (Ethereum or BSC)</li>
            <li>Fill in token details (name, symbol, supply)</li>
            <li>Upload a logo (optional, stored on IPFS)</li>
            <li>Configure features (all enabled by default)</li>
            <li>Deploy your token</li>
          </ol>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mt-6">
          <p className="text-sm text-cyan-300">
            <strong>Note:</strong> All token features are enabled by default. You can uncheck any feature you don't need before deployment.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Token Features",
    icon: <Rocket className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Available Token Features</h3>
        
        <div className="space-y-4 mt-4">
          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="text-cyan-500">✓</span> Mintable
            </h4>
            <p className="text-sm text-gray-400 mt-2">
              Allows the owner to create additional tokens after initial deployment. Useful for controlled supply growth.
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="text-orange-500">✓</span> Burnable
            </h4>
            <p className="text-sm text-gray-400 mt-2">
              Allows token holders to permanently destroy their tokens, reducing total supply.
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="text-purple-500">✓</span> Pausable
            </h4>
            <p className="text-sm text-gray-400 mt-2">
              Allows the owner to pause all token transfers in emergencies or during maintenance.
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="text-blue-500">✓</span> Capped Supply
            </h4>
            <p className="text-sm text-gray-400 mt-2">
              Sets a maximum supply limit that cannot be exceeded, even with minting enabled.
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="text-green-500">✓</span> Transfer Tax
            </h4>
            <p className="text-sm text-gray-400 mt-2">
              Automatically deducts a percentage from each transfer and sends it to a treasury wallet (0-25%).
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white flex items-center gap-2">
              <span className="text-red-500">✓</span> Blacklist
            </h4>
            <p className="text-sm text-gray-400 mt-2">
              Allows blocking specific addresses from sending or receiving tokens. Useful for compliance and security.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Managing Features",
    icon: <Cog className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Post-Deployment Management</h3>
        <p className="text-gray-300">
          After deploying your token, you can manage and revoke features from the Management Panel.
        </p>

        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-white">Available Actions:</h4>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">•</span>
              <div>
                <strong className="text-white">Disable Minting:</strong> Permanently or temporarily stop creating new tokens.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">•</span>
              <div>
                <strong className="text-white">Pause/Unpause:</strong> Temporarily halt all token transfers.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">•</span>
              <div>
                <strong className="text-white">Manage Blacklist:</strong> Add or remove addresses from the blacklist.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">•</span>
              <div>
                <strong className="text-white">Update Tax:</strong> Modify tax percentage or treasury wallet.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500 mt-1">•</span>
              <div>
                <strong className="text-white">Renounce Ownership:</strong> Permanently give up control (irreversible!).
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-300">
            <strong>Warning:</strong> Renouncing ownership is permanent and cannot be undone. After renouncing, no one can modify the contract.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Network & Security",
    icon: <Shield className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Supported Networks</h3>
        
        <div className="space-y-4 mt-4">
          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white">Ethereum</h4>
            <p className="text-sm text-gray-400 mt-2">
              • Mainnet: Production network with real ETH<br />
              • Testnet (Sepolia): Free testing environment
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white">Binance Smart Chain (BSC)</h4>
            <p className="text-sm text-gray-400 mt-2">
              • Mainnet: Production network with real BNB<br />
              • Testnet: Free testing environment
            </p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white">Solana</h4>
            <p className="text-sm text-gray-400 mt-2">
              • Mainnet: Production network with real SOL<br />
              • Devnet/Testnet: Free testing environments
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-white">Security Best Practices:</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Always test on testnet before deploying to mainnet</li>
            <li>• Keep your private keys secure and never share them</li>
            <li>• Double-check all token parameters before deployment</li>
            <li>• Consider auditing your token contract for production use</li>
            <li>• Be cautious when renouncing ownership - it's permanent</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "IPFS & Metadata",
    icon: <Info className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Logo Upload & IPFS Storage</h3>
        <p className="text-gray-300">
          When you upload a logo for your token, it's automatically stored on IPFS (InterPlanetary File System) via Pinata.
        </p>

        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-white">What is IPFS?</h4>
          <p className="text-sm text-gray-400">
            IPFS is a decentralized storage network that ensures your token logo is permanently accessible and cannot be taken down or modified. Each file gets a unique content identifier (CID).
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-white">Metadata Structure:</h4>
          <div className="bg-gray-800 rounded-lg p-4 mt-2">
            <pre className="text-xs text-gray-300">
{`{
  "name": "Your Token Name",
  "symbol": "TKN",
  "description": "Token description",
  "image": "ipfs://Qm...",
  "decimals": 18
}`}
            </pre>
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mt-6">
          <p className="text-sm text-cyan-300">
            <strong>Tip:</strong> Your token logo will be visible on block explorers (Etherscan, BscScan) and wallet applications after deployment.
          </p>
        </div>
      </div>
    ),
  },
];

export default function HelpPage() {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < helpPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = helpPages[currentPage];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Help & Documentation</h1>
          <p className="text-gray-400">Learn how to create and manage your tokens</p>
        </div>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  {page.icon}
                </div>
                {page.title}
              </CardTitle>
              <span className="text-sm text-gray-500">
                Page {currentPage + 1} of {helpPages.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {page.content}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
              <Button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {helpPages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPage
                        ? "bg-cyan-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    data-testid={`dot-page-${index}`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentPage === helpPages.length - 1}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                data-testid="button-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-2 justify-center flex-wrap">
          {helpPages.map((p, index) => (
            <button
              key={p.id}
              onClick={() => setCurrentPage(index)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                index === currentPage
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              data-testid={`tab-${p.id}`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
