import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { CHAIN_DEFINITIONS } from "@/config/chains";
import { useChain } from "@/contexts/ChainContext";
import { 
  ArrowRight, Sparkles, Zap, Shield, TrendingUp, Users, Globe, 
  Rocket, Lock, Award, Coins, Target, BarChart3, CheckCircle2,
  Star, Gem
} from "lucide-react";
import { AnimatedPage, StaggerContainer, StaggerItem, FadeIn, AnimatedCard } from "@/components/animated-wrapper";
import { motion } from "framer-motion";
import { ChainId } from "@shared/schema";

export default function Home() {
  const mainnetChains = [
    CHAIN_DEFINITIONS['ethereum-mainnet'],
    CHAIN_DEFINITIONS['bsc-mainnet'],
    CHAIN_DEFINITIONS['solana-mainnet'],
  ];
  
  const { setSelectedChain } = useChain();
  const [, setLocation] = useLocation();

  const handleChainSelect = (chainId: ChainId) => {
    setSelectedChain(chainId);
    setLocation(`/chain/${chainId}/create`);
  };

  const platformFeatures = [
    {
      icon: Rocket,
      title: "No-Code Token Deployment",
      description: "Create professional tokens on Ethereum, BNB Chain, and Solana without writing a single line of code. Our enterprise-grade platform handles everything.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Institutional-Grade Security",
      description: "Built on OpenZeppelin standards with audited smart contracts. Your tokens are protected by the same security trusted by Fortune 500 companies.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Advanced Tokenomics",
      description: "Implement sophisticated features like transfer taxes, burn mechanisms, blacklisting, and supply caps. Full control at your fingertips.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Zap,
      title: "Instant Deployment",
      description: "Deploy your token to the blockchain in seconds. No waiting, no technical hurdles. Just click and launch.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { label: "Tokens Created", value: "10,000+", icon: Coins },
    { label: "Total Value Locked", value: "$500M+", icon: Lock },
    { label: "Active Users", value: "50,000+", icon: Users },
    { label: "Success Rate", value: "99.9%", icon: Target }
  ];

  const uniqueFeatures = [
    "Multi-Chain Support (ETH, BSC, Solana)",
    "Combine Multiple Token Features",
    "Real-Time Blockchain Analytics",
    "Advanced Authority Management",
    "Professional Token Metadata",
    "Automated Fee Distribution",
    "Emergency Pause Functionality",
    "Decentralized & Trustless"
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {/* Hero Section - Premium Design */}
        <div className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-gray-950 to-gray-950" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl rounded-full" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <AnimatedPage className="text-center">
              {/* Top Badge */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm font-medium mb-8"
              >
                <Star className="h-4 w-4 fill-current" />
                World's First Advanced Token Creation Platform
                <Gem className="h-4 w-4 fill-current" />
              </motion.div>

              {/* Main Title */}
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  AIQX Foundation's Lab
                </span>
              </motion.h1>

              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6"
              >
                Professional Token Creation & Management
              </motion.h2>

              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-10"
              >
                The most advanced platform for creating and managing blockchain tokens. 
                Deploy professional-grade tokens with exclusive features unavailable anywhere else. 
                Trusted by thousands of projects worldwide.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              >
                <Link href="/chain/ethereum-mainnet/create">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-10 py-7 text-lg font-semibold shadow-2xl shadow-cyan-500/25"
                    data-testid="button-create-token-hero"
                  >
                    <Rocket className="h-6 w-6 mr-2" />
                    Create Token Now
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                </Link>
                <Link href="/advanced-features">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 px-10 py-7 text-lg font-semibold"
                    data-testid="button-join-advanced"
                  >
                    <Gem className="h-6 w-6 mr-2" />
                    Join Advanced Features
                    <Star className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-cyan-500/10 rounded-xl p-6 backdrop-blur-sm">
                      <Icon className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatedPage>
          </div>
        </div>

        {/* Platform Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <FadeIn className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose AIQX Labs?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The most powerful and user-friendly token creation platform in the industry
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800 hover:border-cyan-500/30 transition-all h-full backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-white mb-3">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400 text-base leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Blockchain Selection */}
          <div id="blockchain-selection" className="mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-center">
              Deploy on Leading Blockchains
            </h2>
            <p className="text-lg text-gray-400 text-center mb-10">
              Choose from multiple blockchain networks
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mainnetChains.map((chain, index) => {
                const Icon = chain.icon;
                return (
                  <motion.div
                    key={chain.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card 
                      onClick={() => handleChainSelect(chain.id)}
                      className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer group h-full"
                    >
                      <CardHeader className="text-center">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all mb-4"
                        >
                          <Icon className="h-10 w-10 text-cyan-400" />
                        </motion.div>
                        <CardTitle className="text-2xl text-white mb-2">
                          {chain.displayName}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mb-4">
                          {chain.network}
                        </CardDescription>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-cyan-400 hover:bg-cyan-500/10 group-hover:bg-cyan-500/20"
                          data-testid={`button-select-${chain.id}`}
                        >
                          Start Building 
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Unique Features Grid */}
          <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/30 rounded-3xl p-8 lg:p-12 border border-cyan-500/20 mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">
              Exclusive Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {uniqueFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-12 lg:p-16">
            <Award className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Ready to Launch Your Token?
            </h2>
            <p className="text-xl text-cyan-50 mb-8 max-w-3xl mx-auto">
              Join thousands of successful projects using AIQX Foundation's Lab. 
              Create your professional token in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chain/ethereum-mainnet/create">
                <Button 
                  size="lg" 
                  className="bg-white text-cyan-600 hover:bg-gray-100 px-10 py-7 text-lg font-semibold"
                  data-testid="button-get-started-bottom"
                >
                  <Rocket className="h-6 w-6 mr-2" />
                  Get Started Now
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-10 py-7 text-lg font-semibold"
                data-testid="button-learn-more"
                onClick={() => {
                  const section = document.getElementById('blockchain-selection');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Globe className="h-6 w-6 mr-2" />
                Explore Features
              </Button>
            </div>
            <p className="text-cyan-100 mt-6">
              No credit card required • Deploy in minutes • Trusted by 50,000+ users
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
