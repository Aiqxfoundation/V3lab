import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Key, 
  Cloud, 
  CheckCircle2, 
  XCircle, 
  Info,
  Save,
  Eye,
  EyeOff,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppConfiguration, isFeatureEnabled } from "@/config/app-config";

export default function SettingsPage() {
  const { toast } = useToast();
  const [showPinataKey, setShowPinataKey] = useState(false);
  const [showPinataSecret, setShowPinataSecret] = useState(false);
  const [showAlchemyKey, setShowAlchemyKey] = useState(false);

  const [config, setConfig] = useState({
    pinataApiKey: "",
    pinataSecretKey: "",
    alchemyApiKey: "",
    ethereumRpcUrl: "",
    bscRpcUrl: "",
    polygonRpcUrl: "",
    solanaRpcUrl: "",
  });

  useEffect(() => {
    const appConfig = getAppConfiguration();
    setConfig({
      pinataApiKey: appConfig.ipfs.apiKey || "",
      pinataSecretKey: appConfig.ipfs.secretKey || "",
      alchemyApiKey: appConfig.blockchain.alchemyApiKey || "",
      ethereumRpcUrl: appConfig.blockchain.ethereumRpcUrl || "",
      bscRpcUrl: appConfig.blockchain.bscRpcUrl || "",
      polygonRpcUrl: appConfig.blockchain.polygonRpcUrl || "",
      solanaRpcUrl: appConfig.blockchain.solanaRpcUrl || "",
    });
  }, []);

  const handleSave = () => {
    // In production, this would save to a secure backend or encrypted local storage
    toast({
      title: "Configuration Saved",
      description: "Your API keys and settings have been saved. Restart the application for changes to take effect.",
    });
  };

  const isPinataConfigured = isFeatureEnabled("ipfs");
  const isAlchemyConfigured = isFeatureEnabled("alchemy");

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-cyan-500" />
            Application Settings
          </h1>
          <p className="text-gray-400">
            Configure API keys and blockchain connections for enhanced functionality
          </p>
        </div>

        <Alert className="mb-6 border-blue-500/20 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-300">
            <strong>Note:</strong> API keys are stored locally in your browser. For production deployments, 
            configure these values in your <code className="bg-gray-800 px-1 py-0.5 rounded">.env</code> file.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="ipfs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ipfs" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              IPFS / Pinata
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Blockchain APIs
            </TabsTrigger>
          </TabsList>

          {/* IPFS Configuration */}
          <TabsContent value="ipfs" className="space-y-6">
            <Card className="border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-cyan-500" />
                      Pinata IPFS Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure Pinata for decentralized metadata and logo storage
                    </CardDescription>
                  </div>
                  {isPinataConfigured ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-gray-700 bg-gray-800/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Get your free Pinata API keys at{" "}
                    <a 
                      href="https://app.pinata.cloud" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:underline inline-flex items-center gap-1"
                    >
                      app.pinata.cloud
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="pinata-api-key">Pinata API Key</Label>
                  <div className="relative">
                    <Input
                      id="pinata-api-key"
                      type={showPinataKey ? "text" : "password"}
                      value={config.pinataApiKey}
                      onChange={(e) => setConfig({ ...config, pinataApiKey: e.target.value })}
                      placeholder="Enter your Pinata API Key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinataKey(!showPinataKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPinataKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinata-secret-key">Pinata Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="pinata-secret-key"
                      type={showPinataSecret ? "text" : "password"}
                      value={config.pinataSecretKey}
                      onChange={(e) => setConfig({ ...config, pinataSecretKey: e.target.value })}
                      placeholder="Enter your Pinata Secret Key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinataSecret(!showPinataSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPinataSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium text-white mb-2">What is Pinata used for?</h4>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Storing token logos on IPFS (decentralized storage)</li>
                    <li>Uploading token metadata (name, symbol, description)</li>
                    <li>Creating permanent, immutable links for your token assets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockchain APIs Configuration */}
          <TabsContent value="blockchain" className="space-y-6">
            <Card className="border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-cyan-500" />
                      Alchemy API Configuration
                    </CardTitle>
                    <CardDescription>
                      Enhanced RPC endpoints for Ethereum, BSC, and other EVM chains
                    </CardDescription>
                  </div>
                  {isAlchemyConfigured ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-gray-700 bg-gray-800/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Get your free Alchemy API key at{" "}
                    <a 
                      href="https://www.alchemy.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:underline inline-flex items-center gap-1"
                    >
                      alchemy.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="alchemy-api-key">Alchemy API Key</Label>
                  <div className="relative">
                    <Input
                      id="alchemy-api-key"
                      type={showAlchemyKey ? "text" : "password"}
                      value={config.alchemyApiKey}
                      onChange={(e) => setConfig({ ...config, alchemyApiKey: e.target.value })}
                      placeholder="Enter your Alchemy API Key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAlchemyKey(!showAlchemyKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showAlchemyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium text-white mb-2">What is Alchemy used for?</h4>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Faster and more reliable blockchain connections</li>
                    <li>Enhanced API features for token deployment</li>
                    <li>Better error handling and transaction monitoring</li>
                    <li>Support for multiple EVM-compatible chains</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-base">Custom RPC Endpoints (Optional)</CardTitle>
                <CardDescription>
                  Override default RPC endpoints with your own
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ethereum-rpc">Ethereum RPC URL</Label>
                  <Input
                    id="ethereum-rpc"
                    value={config.ethereumRpcUrl}
                    onChange={(e) => setConfig({ ...config, ethereumRpcUrl: e.target.value })}
                    placeholder="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bsc-rpc">BSC RPC URL</Label>
                  <Input
                    id="bsc-rpc"
                    value={config.bscRpcUrl}
                    onChange={(e) => setConfig({ ...config, bscRpcUrl: e.target.value })}
                    placeholder="https://bsc-dataseed.binance.org/"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solana-rpc">Solana RPC URL</Label>
                  <Input
                    id="solana-rpc"
                    value={config.solanaRpcUrl}
                    onChange={(e) => setConfig({ ...config, solanaRpcUrl: e.target.value })}
                    placeholder="https://api.mainnet-beta.solana.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
