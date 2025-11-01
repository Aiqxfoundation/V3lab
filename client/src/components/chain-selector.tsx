import { SUPPORTED_CHAINS, type ChainId } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ChainSelectorProps {
  value: ChainId;
  onChange: (chain: ChainId) => void;
  allowedChainIds?: ChainId[];
}

export function ChainSelector({ value, onChange, allowedChainIds }: ChainSelectorProps) {
  const selectedChain = SUPPORTED_CHAINS[value];
  
  // Filter chains based on allowedChainIds
  const availableChains = allowedChainIds
    ? Object.entries(SUPPORTED_CHAINS).filter(([key]) => allowedChainIds.includes(key as ChainId))
    : Object.entries(SUPPORTED_CHAINS);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChainId)}>
      <SelectTrigger className="w-full" data-testid="select-blockchain">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `hsl(${selectedChain.color})` }}
            />
            <span>{selectedChain.name}</span>
            <Badge variant="secondary" className="ml-auto">
              {selectedChain.symbol}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableChains.map(([key, chain]) => (
          <SelectItem key={key} value={key} data-testid={`option-chain-${key}`}>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `hsl(${chain.color})` }}
              />
              <span>{chain.name}</span>
              <Badge variant="secondary" className="ml-2">
                {chain.symbol}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
