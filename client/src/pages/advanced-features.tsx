import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, TrendingUp, Users, Award, Rocket, Shield, Star,
  CheckCircle2, Gem, Lock, Zap, Target, BarChart3, Globe,
  Twitter, Send, Heart, Share2, DollarSign, Coins, Calendar
} from "lucide-react";

export default function AdvancedFeatures() {
  const { isAuthenticated, accessKey, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: verifyData, isLoading, isError } = useQuery({
    queryKey: ['/api/auth/verify', accessKey],
    enabled: !!accessKey,
    retry: false,
    queryFn: async () => {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${accessKey}`
        }
      });
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth/login");
    } else if (isError || (verifyData && !verifyData.success)) {
      logout();
      setLocation("/auth/login");
    }
  }, [isAuthenticated, isError, verifyData, setLocation, logout]);

  if (!isAuthenticated || isLoading || !verifyData || !verifyData.success) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">
              {!isAuthenticated ? "Redirecting to login..." : "Verifying access..."}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const features = [
    {
      icon: Gift,
      title: "Airdrop System",
      description: "Create and manage professional airdrop campaigns for your tokens",
      features: [
        "Task-Based Distribution",
        "Social Media Integration",
        "Automated Verification",
        "Multi-Tier Rewards",
        "Analytics Dashboard"
      ],
      color: "from-purple-500 to-pink-500",
      comingSoon: false
    },
    {
      icon: TrendingUp,
      title: "Token Presale Platform",
      description: "Launch fair and transparent presales for your projects",
      features: [
        "Customizable Sale Terms",
        "Vesting Schedules",
        "Whitelist Management",
        "Auto-Distribution",
        "Refund Protection"
      ],
      color: "from-blue-500 to-cyan-500",
      comingSoon: false
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Build and manage your token community effectively",
      features: [
        "Holder Analytics",
        "Engagement Rewards",
        "Community Tasks",
        "Leaderboards",
        "Achievement System"
      ],
      color: "from-green-500 to-emerald-500",
      comingSoon: false
    },
    {
      icon: Award,
      title: "Staking Programs",
      description: "Create staking mechanisms to incentivize long-term holders",
      features: [
        "Flexible Staking Pools",
        "APY Calculators",
        "Reward Distribution",
        "Lock Periods",
        "Early Unstake Penalties"
      ],
      color: "from-amber-500 to-orange-500",
      comingSoon: true
    }
  ];

  const airdropTasks = [
    { icon: Twitter, label: "Follow on Twitter", points: 100 },
    { icon: Heart, label: "Like & Retweet", points: 50 },
    { icon: Send, label: "Join Telegram", points: 75 },
    { icon: Share2, label: "Share Project", points: 150 },
    { icon: Users, label: "Invite Friends", points: 200 }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-gray-950 to-gray-950 border-b border-purple-500/20">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-l from-purple-600 to-pink-600 opacity-10 blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center mb-8">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-6 py-2 text-sm mb-6">
                <Star className="h-4 w-4 mr-2" />
                Exclusive Advanced Features
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Advanced Features Hub
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-10">
                Unlock powerful tools for airdrops, presales, and community engagement. 
                Build thriving token ecosystems with professional-grade features.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/login">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-7 text-xl shadow-2xl shadow-purple-500/25"
                    data-testid="button-access-features"
                  >
                    <Lock className="h-6 w-6 mr-3" />
                    Access Advanced Features
                    <Gem className="h-6 w-6 ml-3" />
                  </Button>
                </Link>
              </div>

              <p className="text-gray-400 mt-4 flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Secure authentication required • Verified users only
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Available Advanced Tools</h2>
            <p className="text-xl text-gray-400">Professional features to grow your token project</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800 hover:border-purple-500/30 transition-all relative overflow-hidden">
                  {feature.comingSoon && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        <Calendar className="h-3 w-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.color}`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-white mb-3">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-400 text-base mb-4">
                          {feature.description}
                        </CardDescription>
                        <div className="space-y-2">
                          {feature.features.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                              <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">How Airdrops Work</h2>
              <p className="text-xl text-gray-400">Grow your community with engaging task-based campaigns</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-white mb-4">For Project Owners</CardTitle>
                  <div className="space-y-4">
                    {[
                      { step: "1", text: "Create airdrop campaign with token allocation" },
                      { step: "2", text: "Set up tasks (follow, like, share, etc.)" },
                      { step: "3", text: "Configure reward tiers and distribution" },
                      { step: "4", text: "Launch and track participation in real-time" },
                      { step: "5", text: "Automated distribution to verified participants" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{item.step}</span>
                        </div>
                        <p className="text-gray-300 pt-1">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-white mb-4">Example Airdrop Tasks</CardTitle>
                  <div className="space-y-3">
                    {airdropTasks.map((task, idx) => {
                      const Icon = task.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-purple-400" />
                            <span className="text-gray-300">{task.label}</span>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            +{task.points} pts
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 rounded-3xl p-8 lg:p-12 border border-purple-500/20 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Zap, label: "Instant Setup", value: "< 5 min" },
                { icon: Users, label: "Participants", value: "Unlimited" },
                { icon: BarChart3, label: "Success Rate", value: "98%" }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx}>
                    <Icon className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 lg:p-16 text-center">
            <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Ready to Access Advanced Features?
            </h2>
            <p className="text-xl text-purple-50 mb-8 max-w-3xl mx-auto">
              Join verified users and unlock powerful tools for airdrops, presales, and community management.
            </p>
            <Link href="/auth/login">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-7 text-xl font-semibold"
                data-testid="button-get-verified"
              >
                <Shield className="h-6 w-6 mr-3" />
                Get Verified Access
                <Gem className="h-6 w-6 ml-3" />
              </Button>
            </Link>
            <p className="text-purple-100 mt-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Simple verification • Secure authentication • Full access
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
