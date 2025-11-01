import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, Zap, Shield, Flame, Plus, Settings,
  Send, Ban, ArrowRight, CheckCircle2,
  Code, Lock, Layers, TrendingUp, Rocket,
  FileText, Users, Cpu, Target, Snowflake, ImageIcon,
  Award, Gem, Star, AlertTriangle, DollarSign, BarChart3
} from "lucide-react";

interface UnifiedChainOverviewProps {
  chainId: string;
  chain: any;
}

export default function UnifiedChainOverview({ chainId, chain }: UnifiedChainOverviewProps) {
  const isTestnet = chainId.includes('testnet') || chainId.includes('devnet');
  const chainPath = `/chain/${chainId}`;
  const isSolana = chain.blockchainType === 'Solana';
  const isEVM = chain.blockchainType === 'EVM';

  const platformFeatures = [
    {
      icon: Rocket,
      title: "No-Code Token Creation",
      description: `Launch professional ${isSolana ? 'SPL' : 'ERC-20'} tokens in minutes without writing a single line of code. Our intuitive interface handles all the technical complexity for you.`,
      highlight: "Create tokens instantly"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Built with industry-leading security standards. Your tokens are protected with the same technology trusted by Fortune 500 companies and major DeFi protocols.",
      highlight: "Audited & Secure"
    },
    {
      icon: TrendingUp,
      title: "Advanced Tokenomics Control",
      description: "Implement sophisticated features like transfer fees, burn mechanisms, supply caps, and automated treasury management. Full control at your fingertips.",
      highlight: "Professional Features"
    },
    {
      icon: Cpu,
      title: "Smart Contract Automation",
      description: "Automated minting, burning, and authority management. Control your entire token lifecycle with simple clicks—no blockchain expertise needed.",
      highlight: "Zero Coding Required"
    }
  ];

  const tokenCreationGuide = [
    {
      step: "1",
      title: "Connect Your Wallet",
      description: `Connect your ${isSolana ? 'Solana wallet (Phantom, Solflare)' : 'Web3 wallet (MetaMask, WalletConnect)'} to get started. We support all major wallets.`,
      icon: Lock
    },
    {
      step: "2",
      title: "Configure Token Settings",
      description: "Enter your token name, symbol, supply, and decimals. Choose from our advanced features to customize your tokenomics perfectly.",
      icon: Settings
    },
    {
      step: "3",
      title: "Select Advanced Features",
      description: "Enable features like minting, burning, transfer fees, pausability, and more. Mix and match to create your ideal token.",
      icon: Layers
    },
    {
      step: "4",
      title: "Deploy to Blockchain",
      description: `Click deploy and your token goes live on ${chain.displayName}. Get your contract address instantly and start managing your token.`,
      icon: Zap
    }
  ];

  const availableFeatures = isSolana ? [
    { 
      name: "Mint Authority Control", 
      icon: Plus, 
      desc: "Full supply control",
      guide: "Keep or revoke mint authority to control future token supply. Enable minting for rewards programs or create fixed-supply tokens.",
      advanced: true
    },
    { 
      name: "Freeze Authority", 
      icon: Snowflake, 
      desc: "Account security control",
      guide: "Freeze specific token accounts to prevent malicious activity or comply with regulations. Essential for compliance and security.",
      advanced: true
    },
    { 
      name: "Transfer Fees (Token-2022)", 
      icon: DollarSign, 
      desc: "Native revenue generation",
      guide: "Set up automatic transfer fees that go directly to your treasury. Built into the token program—no external contracts needed.",
      advanced: true
    },
    { 
      name: "Metadata Management", 
      icon: ImageIcon, 
      desc: "On-chain information",
      guide: "Add and update token name, symbol, logo, and description directly on-chain. Full professional metadata control.",
      advanced: false
    },
    { 
      name: "Authority Transfer", 
      icon: Send, 
      desc: "Ownership management",
      guide: "Transfer mint, freeze, or update authorities to different wallets. Perfect for DAO governance or team management.",
      advanced: false
    },
    { 
      name: "Burn Tokens", 
      icon: Flame, 
      desc: "Deflationary mechanics",
      guide: "Implement token burning to reduce supply and increase scarcity. Create deflationary tokenomics for long-term value.",
      advanced: false
    }
  ] : [
    { 
      name: "Mintable Tokens", 
      icon: Plus, 
      desc: "Expand supply on-demand",
      guide: "Enable minting to create new tokens after deployment. Perfect for rewards, partnerships, or ecosystem growth strategies.",
      advanced: false
    },
    { 
      name: "Burnable Supply", 
      icon: Flame, 
      desc: "Deflationary mechanics",
      guide: "Allow token holders to burn their tokens permanently. Implement deflationary economics to increase scarcity over time.",
      advanced: false
    },
    { 
      name: "Pausable Transfers", 
      icon: Ban, 
      desc: "Emergency protection",
      guide: "Pause all token transfers during security incidents or maintenance. Resume when safe. Essential for protecting your community.",
      advanced: true
    },
    { 
      name: "Transfer Tax System", 
      icon: DollarSign, 
      desc: "Automated revenue",
      guide: "Set automatic transaction fees on every transfer. Funds go to your treasury for development, marketing, or liquidity.",
      advanced: true
    },
    { 
      name: "Blacklist Control", 
      icon: AlertTriangle, 
      desc: "Address blocking",
      guide: "Block malicious addresses from receiving or sending tokens. Protect your community from scammers and bad actors.",
      advanced: true
    },
    { 
      name: "Capped Supply", 
      icon: Shield, 
      desc: "Maximum supply limit",
      guide: "Set a hard cap on total supply that can never be exceeded. Build trust with guaranteed scarcity and no inflation.",
      advanced: false
    }
  ];

  const whyChoose = [
    {
      icon: Star,
      title: "World's First Advanced Platform",
      description: "Unique features and capabilities not available anywhere else in the industry",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Code,
      title: "Professional Smart Contracts",
      description: `Optimized ${isSolana ? 'Solana programs' : 'Solidity contracts'} with gas-efficient code and best practices`,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Over 10,000 tokens created and $500M+ in total value managed on our platform",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your token performance, holders, and transactions in real-time with professional dashboards",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const themeColors = isSolana 
    ? { primary: 'purple', gradient: 'from-purple-600 to-pink-600', light: 'purple-300', border: 'purple-500' }
    : chain.id.includes('bsc')
    ? { primary: 'yellow', gradient: 'from-yellow-600 to-amber-600', light: 'yellow-300', border: 'yellow-500' }
    : { primary: 'blue', gradient: 'from-blue-600 to-indigo-600', light: 'blue-300', border: 'blue-500' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className={`relative overflow-hidden bg-gradient-to-br from-${themeColors.primary}-950/40 via-gray-950 to-gray-950 border-b border-${themeColors.border}/20`}>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-l ${themeColors.gradient} opacity-10 blur-3xl`} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-center justify-center mb-6">
            <Badge className={`bg-${themeColors.primary}-500/20 text-${themeColors.light} border-${themeColors.border}/30 px-6 py-2 text-sm`}>
              {isTestnet ? (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {chain.network} - Test Environment
                </>
              ) : (
                <>
                  <Gem className="h-4 w-4 mr-2" />
                  {chain.network} - Production Ready
                </>
              )}
            </Badge>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-center mb-6">
            <span className={`bg-gradient-to-r ${themeColors.gradient} bg-clip-text text-transparent`}>
              Create Professional Tokens
            </span>
          </h1>
          
          <h2 className="text-2xl lg:text-3xl font-semibold text-white text-center mb-6">
            {chain.displayName} • {isTestnet ? 'Test & Deploy Safely' : 'Production Deployment'}
          </h2>

          <p className="text-lg text-gray-300 text-center max-w-4xl mx-auto mb-10">
            {isTestnet 
              ? `Test your token concepts risk-free on ${chain.displayName}. Perfect for development, testing advanced features, and ensuring everything works before mainnet deployment.`
              : `Deploy production-ready tokens on ${chain.displayName} with enterprise-grade features. Join thousands of successful projects using AIQX Foundation's Lab.`
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href={`${chainPath}/create`}>
              <Button 
                size="lg" 
                className={`bg-gradient-to-r ${themeColors.gradient} hover:opacity-90 text-white px-12 py-7 text-xl shadow-2xl shadow-${themeColors.primary}-500/25`}
                data-testid="button-create-token-hero"
              >
                <Rocket className="h-6 w-6 mr-3" />
                Create Token Now
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
            <Link href={`${chainPath}/manage`}>
              <Button 
                size="lg" 
                variant="outline" 
                className={`border-${themeColors.border}/30 bg-${themeColors.primary}-500/5 text-${themeColors.light} hover:bg-${themeColors.primary}-500/10 px-12 py-7 text-xl`}
                data-testid="button-manage-tokens"
              >
                <Settings className="h-6 w-6 mr-3" />
                Manage Tokens
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Deploy Time", value: "<30 sec", icon: Zap },
              { label: "Features", value: "20+", icon: Layers },
              { label: "Security", value: "Audited", icon: Shield },
              { label: "Success Rate", value: "99.9%", icon: Target }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center backdrop-blur-sm">
                  <Icon className={`h-6 w-6 text-${themeColors.light} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">How AIQX Labs Works</h2>
          <p className="text-xl text-gray-400">Four simple steps to launch your professional token</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {tokenCreationGuide.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="bg-gray-900/80 border-gray-800 hover:border-cyan-500/30 transition-all">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-cyan-400 mb-2">Step {step.step}</div>
                  <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Available Token Features</h2>
            <p className="text-xl text-gray-400">Professional features to customize your token perfectly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className={`bg-gray-900/80 border-gray-800 hover:border-${themeColors.border}/50 transition-all`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${themeColors.gradient} bg-opacity-10`}>
                        <Icon className={`h-6 w-6 text-${themeColors.light}`} />
                      </div>
                      {feature.advanced && (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Advanced
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white mb-2">{feature.name}</CardTitle>
                    <CardDescription className="text-gray-500 text-sm mb-3">{feature.desc}</CardDescription>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.guide}</p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose AIQX Foundation's Lab?</h2>
            <p className="text-xl text-gray-400">The most advanced token creation platform in the industry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChoose.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800 hover:border-cyan-500/30 transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color}`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white mb-3">{item.title}</CardTitle>
                        <CardDescription className="text-gray-400 text-base">{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-cyan-500/20 rounded-3xl p-8 lg:p-12 mb-20">
          <h3 className="text-3xl font-bold text-white mb-6">Platform Guarantees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Instant Deployment (<30 seconds)",
              "OpenZeppelin Security Standards",
              "Advanced Management Tools",
              "No Coding Knowledge Required",
              "Professional Smart Contracts",
              "Lifetime Token Control",
              "Multi-Wallet Support",
              "24/7 Platform Availability",
              "Real-Time Blockchain Updates"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href={`${chainPath}/create`}>
            <Button 
              size="lg" 
              className={`bg-gradient-to-r ${themeColors.gradient} hover:opacity-90 text-white px-12 py-6 text-xl`}
              data-testid="button-get-started-bottom"
            >
              <Rocket className="h-6 w-6 mr-3" />
              Start Creating Now
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </Link>
          <p className="text-gray-500 mt-4">
            {isTestnet ? "Test on " : "Deploy on "}{chain.displayName} • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
