import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  Shield, Wallet, CheckCircle2, Lock, Star, Gem,
  AlertCircle, DollarSign, Zap, Award, ArrowRight
} from "lucide-react";
import { useEvmWallet } from "@/contexts/EvmWalletContext";
import { useSolanaWallet } from "@/contexts/SolanaWalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"username" | "wallet" | "verification" | "complete">("username");
  const [selectedNetwork, setSelectedNetwork] = useState<"evm" | "solana" | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setAccessKey } = useAuth();
  
  const { 
    address: evmAddress, 
    connect: connectEvm, 
    isConnected: isEvmConnected 
  } = useEvmWallet();
  
  const { 
    publicKey: solanaAddress, 
    connect: connectSolana, 
    isConnected: isSolanaConnected 
  } = useSolanaWallet();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; walletAddress: string }) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (data: any) => {
      if (data.accessKey) {
        setAccessKey(data.accessKey);
      }
      setStep("complete");
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting...",
      });
      setTimeout(() => {
        setLocation("/advanced-features");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "User not found or wallet mismatch",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; walletAddress: string; network: string }) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: (data: any) => {
      if (data.accessKey) {
        setAccessKey(data.accessKey);
      }
      setStep("complete");
      toast({
        title: "Registration Complete!",
        description: "You now have access to advanced features.",
      });
      setTimeout(() => {
        setLocation("/advanced-features");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Username may already exist",
        variant: "destructive",
      });
    }
  });

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to continue",
        variant: "destructive",
      });
      return;
    }
    if (username.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }
    setStep("wallet");
  };

  const handleWalletConnect = async (network: "evm" | "solana") => {
    setSelectedNetwork(network);
    try {
      if (network === "evm") {
        await connectEvm();
      } else {
        await connectSolana();
      }
      setStep("verification");
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please try connecting your wallet again",
        variant: "destructive",
      });
    }
  };

  const handleVerification = () => {
    const walletAddress = selectedNetwork === "evm" ? evmAddress : solanaAddress;
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({
        username,
        walletAddress
      });
    } else {
      registerMutation.mutate({
        username,
        walletAddress,
        network: selectedNetwork || "evm"
      });
    }
  };

  const walletAddress = selectedNetwork === "evm" ? evmAddress : solanaAddress;
  const isConnected = selectedNetwork === "evm" ? isEvmConnected : isSolanaConnected;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-6 py-2 text-sm mb-4">
              <Star className="h-4 w-4 mr-2" />
              Advanced Features Access
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {mode === "login" ? "Welcome Back" : "Get Started"}
            </h1>
            <p className="text-lg text-gray-400">
              {mode === "login" ? "Login to access your advanced features" : "Register to unlock airdrops, presales, and premium tools"}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => setMode("login")}
                className={mode === "login" ? "bg-purple-600" : ""}
                data-testid="button-switch-login"
              >
                Login
              </Button>
              <Button
                variant={mode === "register" ? "default" : "outline"}
                onClick={() => setMode("register")}
                className={mode === "register" ? "bg-purple-600" : ""}
                data-testid="button-switch-register"
              >
                Register
              </Button>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                {step === "username" && (mode === "login" ? "Step 1: Enter Username" : "Step 1: Create Username")}
                {step === "wallet" && "Step 2: Connect Wallet"}
                {step === "verification" && (mode === "login" ? "Step 3: Verify Identity" : "Step 3: Verify Transaction")}
                {step === "complete" && (mode === "login" ? "Login Complete!" : "Registration Complete!")}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {step === "username" && (mode === "login" ? "Enter your registered username" : "Choose a unique username for your account")}
                {step === "wallet" && "Connect your wallet to verify ownership"}
                {step === "verification" && (mode === "login" ? "Verify with your registered wallet" : "Complete $1 USDT verification to get access")}
                {step === "complete" && "Redirecting to advanced features..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === "username" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      data-testid="input-username"
                      onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                    />
                    <p className="text-sm text-gray-500">Minimum 3 characters</p>
                  </div>
                  <Button
                    onClick={handleUsernameSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="button-continue-username"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {step === "wallet" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      onClick={() => handleWalletConnect("evm")}
                      className="h-auto p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500/50 transition-all"
                      variant="outline"
                      data-testid="button-connect-evm"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                          <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-white text-lg">Ethereum / BSC</div>
                          <div className="text-sm text-gray-400">MetaMask, WalletConnect, etc.</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleWalletConnect("solana")}
                      className="h-auto p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500/50 transition-all"
                      variant="outline"
                      data-testid="button-connect-solana"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                          <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-white text-lg">Solana</div>
                          <div className="text-sm text-gray-400">Phantom, Solflare, etc.</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Button>
                  </div>
                  <Button
                    onClick={() => setStep("username")}
                    variant="ghost"
                    className="w-full text-gray-400"
                    data-testid="button-back"
                  >
                    ← Back
                  </Button>
                </div>
              )}

              {step === "verification" && (
                <div className="space-y-6">
                  {isConnected && walletAddress && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-semibold">Wallet Connected</span>
                        </div>
                        <p className="text-sm text-gray-400 font-mono break-all">{walletAddress}</p>
                      </div>

                      {mode === "register" && (
                        <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                              <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white text-lg">Verification (Optional)</h3>
                              <p className="text-sm text-gray-400">USDT verification coming soon</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Status:</span>
                              <span className="text-cyan-400 font-semibold">Auto-Verified for Beta</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Network:</span>
                              <span className="text-white">{selectedNetwork === "evm" ? "Ethereum / BSC" : "Solana"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-300">
                            <p className="font-semibold mb-1">Security Note:</p>
                            <p className="text-blue-200/80">
                              Your verification key is securely hashed and stored. We never store your private keys or seed phrases.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleVerification}
                        disabled={loginMutation.isPending || registerMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        data-testid="button-verify"
                      >
                        {(loginMutation.isPending || registerMutation.isPending) ? (
                          <>{mode === "login" ? "Logging in..." : "Processing Verification..."}</>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-2" />
                            {mode === "login" ? "Login" : "Complete Verification"}
                            <Zap className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <Button
                    onClick={() => setStep("wallet")}
                    variant="ghost"
                    className="w-full text-gray-400"
                    disabled={loginMutation.isPending || registerMutation.isPending}
                    data-testid="button-back-verification"
                  >
                    ← Back
                  </Button>
                </div>
              )}

              {step === "complete" && (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="p-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 animate-pulse">
                      <Award className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Access Granted!</h3>
                    <p className="text-gray-400">Redirecting to advanced features...</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              )}

              {step !== "complete" && (
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Your account is secured with wallet-based authentication. 
                      The verification fee prevents spam and ensures platform quality.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {step === "username" && (
            <div className="mt-8">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Gem className="h-5 w-5 text-purple-400" />
                    What You'll Get
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Create Airdrop Campaigns",
                      "Launch Token Presales",
                      "Community Management Tools",
                      "Advanced Analytics Dashboard",
                      "Priority Support",
                      "Early Access to New Features"
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
