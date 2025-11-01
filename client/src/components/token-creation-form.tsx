import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { evmTokenCreationSchema, type EvmTokenCreationForm, type ChainId, type EvmTokenType } from "@shared/schema";
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
import { ChainSelector } from "./chain-selector";
import { TokenTypeCard } from "./token-type-card";
import { Card } from "@/components/ui/card";
import { Rocket } from "lucide-react";

interface TokenCreationFormProps {
  onSubmit: (data: EvmTokenCreationForm) => void;
  isLoading?: boolean;
  defaultChainId?: ChainId;
  allowedChainIds?: ChainId[];
}

export function TokenCreationFormComponent({ 
  onSubmit, 
  isLoading,
  defaultChainId = "ethereum-mainnet",
  allowedChainIds 
}: TokenCreationFormProps) {
  const form = useForm<EvmTokenCreationForm>({
    resolver: zodResolver(evmTokenCreationSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 18,
      totalSupply: "",
      tokenType: "standard",
      chainId: defaultChainId,
      taxPercentage: 5,
      treasuryWallet: "",
    },
  });

  const selectedType = form.watch("tokenType");
  const isTaxable = selectedType === "taxable";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Token Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Awesome Token"
                      {...field}
                      data-testid="input-token-name"
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
                  <FormLabel>Token Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MAT"
                      {...field}
                      data-testid="input-token-symbol"
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
                  <FormLabel>Total Supply</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1000000"
                      {...field}
                      data-testid="input-total-supply"
                    />
                  </FormControl>
                  <FormDescription>
                    Number of tokens to create
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
                  <FormLabel>Decimals</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-decimals"
                    />
                  </FormControl>
                  <FormDescription>
                    Usually 18 (like ETH)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Token Type</h2>
          <FormField
            control={form.control}
            name="tokenType"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(["standard", "mintable", "burnable", "taxable"] as EvmTokenType[]).map((type) => (
                    <TokenTypeCard
                      key={type}
                      type={type}
                      selected={field.value === type}
                      onSelect={() => field.onChange(type)}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isTaxable && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Tax Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="taxPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={25}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-tax-percentage"
                      />
                    </FormControl>
                    <FormDescription>
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
                    <FormLabel>Treasury Wallet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        {...field}
                        data-testid="input-treasury-wallet"
                      />
                    </FormControl>
                    <FormDescription>
                      Address to receive tax fees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Blockchain Network</h2>
          <FormField
            control={form.control}
            name="chainId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Network</FormLabel>
                <FormControl>
                  <ChainSelector
                    value={field.value}
                    onChange={field.onChange}
                    allowedChainIds={allowedChainIds}
                  />
                </FormControl>
                <FormDescription>
                  Choose the blockchain network to deploy your token
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2"
          disabled={isLoading}
          data-testid="button-deploy-token"
        >
          <Rocket className="h-5 w-5" />
          {isLoading ? "Deploying..." : "Deploy Token"}
        </Button>
      </form>
    </Form>
  );
}
