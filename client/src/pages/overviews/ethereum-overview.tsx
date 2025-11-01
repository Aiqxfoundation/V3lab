import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, Zap, Shield, Flame, Plus, Settings,
  Send, Ban, ShieldOff, ArrowRight, CheckCircle2,
  Code, Lock, Layers, TrendingUp, Rocket,
  FileText, Users, Cpu, Target, Globe
} from "lucide-react";

export default function EthereumOverview({ chainId, chain }: any) {
  const isTestnet = chainId.includes('testnet');
  const chainPath = `/chain/${chainId}`;

  const platformFeatures = [
    {
      icon: Rocket,
      title: "No-Code Token Creation",
      description: "Launch professional ERC-20 tokens in minutes without writing a single line of code. Our intuitive interface handles all the complexity for you."
    },
    {
      icon: Shield,
      title: "Advanced Security Features",
      description: "Built-in pausable transfers, blacklist controls, and capped supply protection. Your token security is our priority with OpenZeppelin standards."
    },
    {
      icon: TrendingUp,
      title: "Tokenomics Management",
      description: "Implement transfer taxes, treasury wallets, and automated fee distribution. Perfect for project funding and sustainable token economics."
    },
    {
      icon: Cpu,
      title: "Smart Contract Automation",
      description: "Automated minting, burning, and authority management. Control your token lifecycle with simple clicks, no blockchain expertise needed."
    }
  ];

  const tokenFeatures = [
    { 
      name: "Mintable Tokens", 
      icon: Plus, 
      desc: "Create new tokens after deployment",
      guide: "Enable minting to expand your token supply on-demand for rewards, partnerships, or ecosystem growth."
    },
    { 
      name: "Burnable Supply", 
      icon: Flame, 
      desc: "Permanently reduce token supply",
      guide: "Implement deflationary mechanics by allowing token holders to burn their tokens, increasing scarcity over time."
    },
    { 
      name: "Pausable Transfers", 
      icon: Ban, 
      desc: "Emergency stop functionality",
      guide: "Protect your community during security incidents by pausing all token transfers until threats are resolved."
    },
    { 
      name: "Transfer Tax System", 
      icon: TrendingUp, 
      desc: "Automated transaction fees",
      guide: "Set up automatic tax collection on transfers to fund development, marketing, or liquidity pools."
    },
    { 
      name: "Blacklist Control", 
      icon: ShieldOff, 
      desc: "Block malicious addresses",
      guide: "Prevent bad actors from participating in your token ecosystem by restricting specific wallet addresses."
    },
    { 
      name: "Capped Supply", 
      icon: Shield, 
      desc: "Fixed maximum token limit",
      guide: "Set an immutable maximum supply cap to guarantee token scarcity and protect against inflation."
    },
  ];

  const creationSteps = [
    {
      step: "1",
      title: "Connect Your Wallet",
      desc: "Link your Ethereum wallet to AIQX Labs platform"
    },
    {
      step: "2",
      title: "Configure Token Details",
      desc: "Set name, symbol, supply, and select your desired features"
    },
    {
      step: "3",
      title: "Deploy to Blockchain",
      desc: "Review and deploy your token contract instantly"
    },
    {
      step: "4",
      title: "Manage & Grow",
      desc: "Use our advanced tools to manage your token ecosystem"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/30 to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-blue-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <chain.icon className="h-20 w-20 text-blue-400" />
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold text-white">
                  {chain.displayName}
                </h1>
                {isTestnet && (
                  <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm">
                    Safe Testing Environment
                  </Badge>
                )}
              </div>
            </div>
            
            <h2 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-6">
              Professional Token Creation Platform
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              AIQX Labs is the world's first advanced token creation platform offering features no one else provides. 
              Create, manage, and grow your token ecosystem with enterprise-grade tools - all without writing code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={`${chainPath}/create`}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg"
                  data-testid="button-create-token"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Create Your Token
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href={`${chainPath}/tools`}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 px-8 py-6 text-lg"
                  data-testid="button-view-tools"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Explore Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Why Choose AIQX Labs?
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            The most comprehensive token creation platform with exclusive features unavailable anywhere else
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {platformFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="bg-gray-900/50 border-gray-800 hover:border-blue-500/30 transition-all backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white mb-2">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Token Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Token Features
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Mix and match advanced features to create the perfect token for your project. 
              All features work seamlessly together and can be combined.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="bg-gray-900/40 border-gray-800 hover:border-blue-500/20 transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <CardTitle className="text-lg text-white">
                        {feature.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-400 mb-3">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500 border-l-2 border-blue-500/30 pl-3">
                      <span className="font-semibold text-blue-400">How to use:</span> {feature.guide}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How to Create Your Token
            </h2>
            <p className="text-lg text-gray-400">
              Launch your professional token in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creationSteps.map((item, index) => (
              <div key={index} className="relative">
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl font-bold">
                        {item.step}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                    </div>
                    <CardTitle className="text-lg text-white mb-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Unique Value Proposition */}
        <div className="text-center bg-gradient-to-r from-blue-950/50 to-cyan-950/50 rounded-2xl p-8 lg:p-12 border border-blue-500/20">
          <Globe className="h-16 w-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            World's First Advanced Token Platform
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            AIQX Labs provides exclusive features and capabilities not available on any other platform. 
            Our enterprise-grade infrastructure combines security, flexibility, and ease-of-use to make professional token creation accessible to everyone.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              No Coding Required
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-4 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Instant Deployment
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              OpenZeppelin Security
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Advanced Management Tools
            </Badge>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Link href={`${chainPath}/create`}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-6 text-xl"
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
