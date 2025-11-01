import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { evmTokenCreationSchema, type EvmTokenCreationForm, type ChainId, EVM_TOKEN_FEATURES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Rocket, 
  Plus, 
  Flame, 
  Pause, 
  Shield, 
  Percent,
  Info,
  Check,
  Ban,
  Upload,
  Image as ImageIcon,
  Wallet
} from "lucide-react";

interface EvmTokenCreationFormProps {
  onSubmit: (data: EvmTokenCreationForm) => void;
  isLoading?: boolean;
  isConnected?: boolean;
  defaultChainId?: ChainId;
  allowedChainIds?: ChainId[];
}

const featureIcons = {
  mintable: Plus,
  burnable: Flame,
  pausable: Pause,
  capped: Shield,
  taxable: Percent,
};

export function EvmTokenCreationForm({ 
  onSubmit, 
  isLoading,
  isConnected = true,
  defaultChainId = "ethereum-mainnet",
  allowedChainIds 
}: EvmTokenCreationFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const form = useForm<EvmTokenCreationForm>({
    resolver: zodResolver(evmTokenCreationSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 18,
      totalSupply: "",
      chainId: defaultChainId,
      isMintable: true,
      isBurnable: true,
      isPausable: true,
      isCapped: false,
      hasTax: false,
      hasBlacklist: false,
      maxSupply: "",
      taxPercentage: 5,
      treasuryWallet: "",
      logoUrl: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedFeatures = {
    isMintable: form.watch("isMintable"),
    isBurnable: form.watch("isBurnable"),
    isPausable: form.watch("isPausable"),
    isCapped: form.watch("isCapped"),
    hasTax: form.watch("hasTax"),
    hasBlacklist: form.watch("hasBlacklist"),
  };

  const handleSelectAll = () => {
    form.setValue("isMintable", true, { shouldValidate: true, shouldDirty: true });
    form.setValue("isBurnable", true, { shouldValidate: true, shouldDirty: true });
    form.setValue("isPausable", true, { shouldValidate: true, shouldDirty: true });
    form.setValue("isCapped", true, { shouldValidate: true, shouldDirty: true });
    form.setValue("hasTax", true, { shouldValidate: true, shouldDirty: true });
    form.setValue("hasBlacklist", true, { shouldValidate: true, shouldDirty: true });
  };

  const handleDeselectAll = () => {
    form.setValue("isMintable", false, { shouldValidate: true, shouldDirty: true });
    form.setValue("isBurnable", false, { shouldValidate: true, shouldDirty: true });
    form.setValue("isPausable", false, { shouldValidate: true, shouldDirty: true });
    form.setValue("isCapped", false, { shouldValidate: true, shouldDirty: true });
    form.setValue("hasTax", false, { shouldValidate: true, shouldDirty: true });
    form.setValue("hasBlacklist", false, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Token Identity Card */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Rocket className="h-5 w-5 text-cyan-500" />
              Token Identity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Basic information about your token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Token Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Awesome Token"
                        {...field}
                        data-testid="input-token-name"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Token Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MAT"
                        {...field}
                        data-testid="input-token-symbol"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Initial Supply</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1000000"
                        {...field}
                        data-testid="input-total-supply"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Number of tokens minted at creation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decimals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Decimals</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-decimals"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Usually 18 (like ETH, USDC)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Logo Upload */}
            <div className="mt-4">
              <FormLabel className="text-gray-200">Token Logo (Optional)</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative w-20 h-20 rounded-lg border-2 border-cyan-500 overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center bg-gray-800">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md border border-gray-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Logo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    data-testid="input-logo"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a logo for your token. Will be stored on IPFS automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Token Features Card */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Token Features</CardTitle>
                <CardDescription className="text-gray-400">
                  Select which features you want to enable for your token
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  data-testid="button-select-all-features"
                  className="text-xs border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  data-testid="button-deselect-all-features"
                  className="text-xs border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-cyan-500/20 bg-cyan-500/5">
              <Info className="h-4 w-4 text-cyan-500" />
              <AlertDescription className="text-sm text-gray-300">
                <strong>All features are independently selectable!</strong> You can enable or disable any combination of features. Use the "Select All" or "Clear All" buttons for quick control, or toggle individual features as needed.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mintable Feature */}
              <FormField
                control={form.control}
                name="isMintable"
                render={({ field }) => {
                  const handleToggle = (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    field.onChange(!field.value);
                  };
                  
                  return (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        field.value 
                          ? "border-cyan-500 bg-cyan-500/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={handleToggle}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              handleToggle();
                            }}
                            data-testid="checkbox-mintable"
                          />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Plus className="h-4 w-4 text-cyan-500" />
                            <label className="text-sm font-medium text-white cursor-pointer">
                              {EVM_TOKEN_FEATURES.mintable.name}
                            </label>
                          </div>
                          <p className="text-xs text-gray-400">
                            {EVM_TOKEN_FEATURES.mintable.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }}
              />

              {/* Burnable Feature */}
              <FormField
                control={form.control}
                name="isBurnable"
                render={({ field }) => {
                  const handleToggle = (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    field.onChange(!field.value);
                  };
                  
                  return (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        field.value 
                          ? "border-orange-500 bg-orange-500/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={handleToggle}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              handleToggle();
                            }}
                            data-testid="checkbox-burnable"
                          />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <label className="text-sm font-medium text-white cursor-pointer">
                              {EVM_TOKEN_FEATURES.burnable.name}
                            </label>
                          </div>
                          <p className="text-xs text-gray-400">
                            {EVM_TOKEN_FEATURES.burnable.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }}
              />

              {/* Pausable Feature */}
              <FormField
                control={form.control}
                name="isPausable"
                render={({ field }) => {
                  const handleToggle = (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    field.onChange(!field.value);
                  };
                  
                  return (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        field.value 
                          ? "border-purple-500 bg-purple-500/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={handleToggle}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              handleToggle();
                            }}
                            data-testid="checkbox-pausable"
                          />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Pause className="h-4 w-4 text-purple-500" />
                            <label className="text-sm font-medium text-white cursor-pointer">
                              {EVM_TOKEN_FEATURES.pausable.name}
                            </label>
                          </div>
                          <p className="text-xs text-gray-400">
                            {EVM_TOKEN_FEATURES.pausable.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }}
              />

              {/* Capped Feature */}
              <FormField
                control={form.control}
                name="isCapped"
                render={({ field }) => {
                  const handleToggle = (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    field.onChange(!field.value);
                  };
                  
                  return (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        field.value 
                          ? "border-blue-500 bg-blue-500/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={handleToggle}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              handleToggle();
                            }}
                            data-testid="checkbox-capped"
                          />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <label className="text-sm font-medium text-white cursor-pointer">
                              {EVM_TOKEN_FEATURES.capped.name}
                            </label>
                          </div>
                          <p className="text-xs text-gray-400">
                            {EVM_TOKEN_FEATURES.capped.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }}
              />

              {/* Tax Feature */}
              <FormField
                control={form.control}
                name="hasTax"
                render={({ field }) => {
                  const handleToggle = (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    field.onChange(!field.value);
                  };
                  
                  return (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        field.value 
                          ? "border-green-500 bg-green-500/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={handleToggle}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              handleToggle();
                            }}
                            data-testid="checkbox-taxable"
                          />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Percent className="h-4 w-4 text-green-500" />
                            <label className="text-sm font-medium text-white cursor-pointer">
                              {EVM_TOKEN_FEATURES.taxable.name}
                            </label>
                          </div>
                          <p className="text-xs text-gray-400">
                            {EVM_TOKEN_FEATURES.taxable.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }}
              />

              {/* Blacklist Feature */}
              <FormField
                control={form.control}
                name="hasBlacklist"
                render={({ field }) => {
                  const handleToggle = (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    field.onChange(!field.value);
                  };
                  
                  return (
                    <Card 
                      className={`cursor-pointer transition-all ${
                        field.value 
                          ? "border-red-500 bg-red-500/10" 
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={handleToggle}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={() => {
                              handleToggle();
                            }}
                            data-testid="checkbox-blacklist"
                          />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Ban className="h-4 w-4 text-red-500" />
                            <label className="text-sm font-medium text-white cursor-pointer">
                              {EVM_TOKEN_FEATURES.blacklist.name}
                            </label>
                          </div>
                          <p className="text-xs text-gray-400">
                            {EVM_TOKEN_FEATURES.blacklist.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Capped Supply Configuration */}
        {selectedFeatures.isCapped && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Capped Supply Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="maxSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Maximum Supply</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10000000"
                        {...field}
                        data-testid="input-max-supply"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Maximum number of tokens that can ever exist (including initial supply)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Tax Configuration */}
        {selectedFeatures.hasTax && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-green-500" />
                Transfer Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Tax Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={25}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-tax-percentage"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Percentage of each transfer sent to treasury (0-25%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treasuryWallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Treasury Wallet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0x..."
                          {...field}
                          data-testid="input-treasury-wallet"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Address to receive tax fees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Features Summary */}
        {Object.values(selectedFeatures).some(v => v) && (
          <Alert className="border-cyan-500/20 bg-cyan-500/5">
            <Check className="h-4 w-4 text-cyan-500" />
            <AlertDescription className="text-sm text-gray-300">
              <strong className="text-white">Selected Features:</strong>{" "}
              {Object.entries(selectedFeatures)
                .filter(([_, enabled]) => enabled)
                .map(([feature]) => {
                  const featureName = feature.replace(/^is|^has/, '');
                  return featureName.charAt(0).toUpperCase() + featureName.slice(1);
                })
                .join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !isConnected}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
          data-testid="button-create-token"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating Token...
            </>
          ) : !isConnected ? (
            <>
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet to Create Token
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Create Token
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
