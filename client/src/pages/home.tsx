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
      <div className="min-h-screen bg-background dark:bg-background">
        {/* Hero Section - Professional AI Platform Design */}
        <div className="relative overflow-hidden border-b dark:border-border">
          {/* Advanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background" />
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05] bg-[size:60px_60px]" />
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-purple-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-blue-500/10 to-cyan-500/10 blur-[100px] rounded-full" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
            <AnimatedPage className="text-center">
              {/* Premium Badge */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center gap-3 px-8 py-4 glass-card dark:glass-card premium-glow rounded-full mb-10"
              >
                <Star className="h-5 w-5 text-primary fill-current animate-pulse" />
                <span className="gradient-ai-text font-bold text-base tracking-wide">
                  WORLD'S FIRST ADVANCED AI-POWERED TOKEN CREATION PLATFORM
                </span>
                <Sparkles className="h-5 w-5 text-primary fill-current animate-pulse" />
              </motion.div>

              {/* Main Title */}
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className="mb-8"
              >
                <span className="block text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
                  <span className="gradient-ai-text">AIQX</span>{" "}
                  <span className="dark:text-white text-foreground">Foundation</span>
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-bold gradient-premium-text tracking-tight">
                  Advanced AI Lab
                </span>
              </motion.h1>

              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="text-xl md:text-2xl lg:text-3xl font-semibold dark:text-gray-200 text-gray-700 max-w-5xl mx-auto mb-6 leading-relaxed"
              >
                No-Code, Low-Cost Token Creation with{" "}
                <span className="text-gradient-gold">Advanced AI-Level Intelligence</span>
              </motion.p>

              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="text-lg md:text-xl dark:text-gray-400 text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed"
              >
                Deploy institutional-grade blockchain tokens with cutting-edge features never seen before. 
                Powered by advanced AI technology, trusted by industry leaders, and backed by the most sophisticated 
                tokenomics engine in the crypto ecosystem.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
              >
                <Link href="/chain/ethereum-mainnet/create">
                  <Button 
                    size="lg" 
                    className="gradient-ai hover:opacity-90 dark:text-background text-white px-12 py-8 text-xl font-bold shadow-2xl premium-glow hover:scale-105 transition-all duration-300"
                    data-testid="button-create-token-hero"
                  >
                    <Rocket className="h-7 w-7 mr-3" />
                    Launch Your Token
                    <ArrowRight className="h-7 w-7 ml-3" />
                  </Button>
                </Link>
                <Link href="/advanced-features">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="glass-card dark:glass-card dark:border-primary/30 border-primary/50 dark:text-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/10 px-12 py-8 text-xl font-bold hover:scale-105 transition-all duration-300"
                    data-testid="button-join-advanced"
                  >
                    <Sparkles className="h-7 w-7 mr-3" />
                    Explore AI Features
                    <Gem className="h-6 w-6 ml-3" />
                  </Button>
                </Link>
              </motion.div>

              {/* Professional Stats Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto"
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="glass-card dark:glass-card dark:border-primary/10 border-primary/20 rounded-2xl p-8 premium-shadow hover:premium-glow transition-all duration-300"
                    >
                      <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                      <div className="text-4xl lg:text-5xl font-black gradient-ai-text mb-2">{stat.value}</div>
                      <div className="text-sm lg:text-base font-medium dark:text-gray-400 text-gray-600 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatedPage>
          </div>
        </div>

        {/* Platform Features - Industry-Leading Capabilities */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <FadeIn className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-3 glass-card dark:glass-card rounded-full mb-6"
            >
              <Award className="h-5 w-5 text-primary" />
              <span className="dark:text-primary text-primary font-bold tracking-wide">INDUSTRY-LEADING TECHNOLOGY</span>
            </motion.div>
            <h2 className="text-5xl lg:text-6xl font-black dark:text-white text-foreground mb-6">
              Why <span className="gradient-ai-text">AIQX Labs</span> Leads the Industry
            </h2>
            <p className="text-xl lg:text-2xl dark:text-gray-400 text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Advanced AI-powered infrastructure with institutional-grade security and unprecedented feature depth
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-24">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="glass-card dark:glass-card dark:border-primary/10 border-primary/20 hover:dark:border-primary/30 hover:border-primary/40 transition-all duration-300 h-full premium-shadow hover:premium-glow overflow-hidden group">
                    <CardHeader className="p-8 lg:p-10">
                      <div className="flex items-start gap-6">
                        <motion.div 
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className={`p-5 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg flex-shrink-0`}
                        >
                          <Icon className="h-10 w-10 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl lg:text-3xl dark:text-white text-foreground mb-4 font-bold group-hover:text-primary dark:group-hover:text-primary transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="dark:text-gray-400 text-gray-600 text-base lg:text-lg leading-relaxed">
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

          {/* Multi-Chain Support Section */}
          <div id="blockchain-selection" className="mb-24">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-6 py-3 glass-card dark:glass-card rounded-full mb-6"
              >
                <Globe className="h-5 w-5 text-primary" />
                <span className="dark:text-primary text-primary font-bold tracking-wide">MULTI-CHAIN DEPLOYMENT</span>
              </motion.div>
              <h2 className="text-4xl lg:text-5xl font-black dark:text-white text-foreground mb-6">
                Deploy on Leading <span className="gradient-ai-text">Blockchain Networks</span>
              </h2>
              <p className="text-lg lg:text-xl dark:text-gray-400 text-gray-600 max-w-3xl mx-auto">
                Seamlessly launch tokens across multiple chains with unified interface and consistent experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {mainnetChains.map((chain, index) => {
                const Icon = chain.icon;
                return (
                  <motion.div
                    key={chain.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -10, scale: 1.03 }}
                  >
                    <Card 
                      onClick={() => handleChainSelect(chain.id)}
                      className="glass-card dark:glass-card dark:border-primary/10 border-primary/20 hover:dark:border-primary/40 hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full premium-shadow hover:premium-glow"
                    >
                      <CardHeader className="text-center p-10">
                        <motion.div 
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.7, ease: "easeInOut" }}
                          className="h-24 w-24 mx-auto rounded-3xl gradient-ai flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-primary/50 transition-all mb-6"
                        >
                          <Icon className="h-14 w-14 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl dark:text-white text-foreground mb-3 font-bold group-hover:text-primary dark:group-hover:text-primary transition-colors">
                          {chain.displayName}
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400 text-gray-600 mb-6 text-base">
                          {chain.network}
                        </CardDescription>
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="w-full text-primary hover:bg-primary/10 group-hover:bg-primary/20 font-bold text-lg"
                          data-testid={`button-select-${chain.id}`}
                        >
                          Start Building 
                          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                        </Button>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Exclusive AI-Powered Features */}
          <div className="glass-card dark:glass-card dark:border-primary/20 border-primary/30 rounded-3xl p-10 lg:p-16 mb-24 premium-shadow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10" />
            <div className="relative">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-6 py-3 glass-card dark:glass-card rounded-full mb-6"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="dark:text-primary text-primary font-bold tracking-wide">EXCLUSIVE CAPABILITIES</span>
                </motion.div>
                <h2 className="text-4xl lg:text-5xl font-black dark:text-white text-foreground mb-4">
                  <span className="gradient-ai-text">AI-Powered</span> Features Unavailable Elsewhere
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {uniqueFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-start gap-4 p-5 glass-card dark:glass-card rounded-2xl hover:premium-glow transition-all duration-300"
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="dark:text-gray-200 text-gray-700 font-medium leading-snug">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Final CTA */}
          <div className="relative overflow-hidden rounded-3xl premium-shadow">
            <div className="absolute inset-0 gradient-ai" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            <div className="relative text-center p-12 lg:p-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Award className="h-20 w-20 text-white mx-auto mb-8" />
                <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
                  Ready to Launch Your Token?
                </h2>
                <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed">
                  Join thousands of successful projects using AIQX Foundation Lab. 
                  Create your professional, AI-powered token in minutes with the industry's most advanced platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                  <Link href="/chain/ethereum-mainnet/create">
                    <Button 
                      size="lg" 
                      className="bg-white dark:text-background text-background hover:bg-gray-100 px-12 py-8 text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-300"
                      data-testid="button-get-started-bottom"
                    >
                      <Rocket className="h-7 w-7 mr-3" />
                      Get Started Now
                      <ArrowRight className="h-7 w-7 ml-3" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white/10 px-12 py-8 text-xl font-bold hover:scale-105 transition-all duration-300"
                    data-testid="button-learn-more"
                    onClick={() => {
                      const section = document.getElementById('blockchain-selection');
                      section?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Globe className="h-7 w-7 mr-3" />
                    Explore Features
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-base lg:text-lg">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    No credit card required
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Deploy in minutes
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Trusted by 50,000+ users
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
