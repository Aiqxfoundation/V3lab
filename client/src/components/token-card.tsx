import { type DeployedToken, SUPPORTED_CHAINS } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenCardProps {
  token: DeployedToken;
}

export function TokenCard({ token }: TokenCardProps) {
  const { toast } = useToast();
  const chain = SUPPORTED_CHAINS[token.chainId as keyof typeof SUPPORTED_CHAINS];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const getStatusIcon = () => {
    switch (token.status) {
      case "deployed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      deployed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[token.status] || "secondary"} className="gap-1">
        {getStatusIcon()}
        {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card
      className="p-6 hover-elevate transition-all"
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: `hsl(${chain.color})`,
      }}
      data-testid={`card-token-${token.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold" data-testid="text-token-name">
              {token.name}
            </h3>
            <Badge variant="secondary">{token.symbol}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `hsl(${chain.color})` }}
            />
            <span>{chain.name}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Supply</span>
          <span className="font-mono font-medium" data-testid="text-total-supply">
            {parseFloat(token.totalSupply).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <span className="capitalize">{token.tokenType}</span>
        </div>
        {token.contractAddress && (
          <div className="flex justify-between text-sm items-center gap-2">
            <span className="text-muted-foreground">Contract</span>
            <div className="flex items-center gap-1">
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded" data-testid="text-contract-address">
                {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyAddress(token.contractAddress!)}
                data-testid="button-copy-address"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {token.contractAddress && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => {
              const chainConfig = SUPPORTED_CHAINS[token.chainId as keyof typeof SUPPORTED_CHAINS];
              let explorerLink = 'https://etherscan.io/address/' + token.contractAddress;
              
              if (chainConfig) {
                if (token.chainId.startsWith('solana')) {
                  // Solana explorer format: https://explorer.solana.com/address/{ADDRESS}?cluster={CLUSTER}
                  if (token.chainId === 'solana-mainnet') {
                    explorerLink = `https://explorer.solana.com/address/${token.contractAddress}`;
                  } else {
                    const cluster = token.chainId.replace('solana-', '');
                    explorerLink = `https://explorer.solana.com/address/${token.contractAddress}?cluster=${cluster}`;
                  }
                } else {
                  // EVM chains: {explorerUrl}/address/{ADDRESS}
                  explorerLink = `${chainConfig.explorerUrl}/address/${token.contractAddress}`;
                }
              }
              
              window.open(explorerLink, "_blank");
            }}
            data-testid="button-view-explorer"
          >
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </Button>
        </div>
      )}
    </Card>
  );
}
