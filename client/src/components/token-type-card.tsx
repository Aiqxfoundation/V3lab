import { EVM_TOKEN_TYPES, type EvmTokenType } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TokenTypeCardProps {
  type: EvmTokenType;
  selected: boolean;
  onSelect: () => void;
}

export function TokenTypeCard({ type, selected, onSelect }: TokenTypeCardProps) {
  const tokenInfo = EVM_TOKEN_TYPES[type];

  return (
    <Card
      className={`p-6 cursor-pointer transition-all hover-elevate relative ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
      data-testid={`card-token-type-${type}`}
    >
      {selected && (
        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{tokenInfo.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{tokenInfo.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {tokenInfo.features.map((feature) => (
          <Badge key={feature} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
