import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, Loader2 } from "lucide-react";
import { type TokenCreationForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface GasEstimatorProps {
  formData: TokenCreationForm;
  deployerAddress: string;
}

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  estimatedCost: string;
  symbol: string;
}

export function GasEstimator({ formData, deployerAddress }: GasEstimatorProps) {
  const { data: estimate, isLoading } = useQuery<GasEstimate>({
    queryKey: ["/api/gas/estimate", formData],
    queryFn: async (): Promise<GasEstimate> => {
      const response = await apiRequest("POST", "/api/gas/estimate", {
        ...formData,
        deployerAddress,
      });
      return await response.json();
    },
    enabled: !!deployerAddress && !!formData.name && !!formData.symbol && !!formData.totalSupply,
    refetchInterval: 30000,
  });

  if (!deployerAddress) return null;

  return (
    <Card className="p-6 bg-card/50 border-l-4 border-l-warning">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-md bg-warning/10 flex items-center justify-center">
          <Fuel className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold">Gas Estimation</h3>
          <p className="text-sm text-muted-foreground">
            Estimated deployment cost
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : estimate ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gas Limit</span>
            <Badge variant="secondary" className="font-mono">
              {parseInt(estimate.gasLimit).toLocaleString()}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gas Price</span>
            <Badge variant="secondary" className="font-mono">
              {(parseInt(estimate.gasPrice) / 1e9).toFixed(2)} Gwei
            </Badge>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-semibold">Estimated Cost</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-warning" data-testid="text-gas-cost">
                ~{parseFloat(estimate.estimatedCost).toFixed(6)} {estimate.symbol}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Fill in token details to estimate gas
        </p>
      )}
    </Card>
  );
}
