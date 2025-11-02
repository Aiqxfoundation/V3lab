import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins } from 'lucide-react';
import { TokenSelectionModal } from '@/components/TokenSelectionModal';
import { getWalletTokens, type WalletToken } from '@/utils/solanaTools';
import { getSolanaConnection } from '@/utils/solanaDeployer';

interface SolanaTokenPickerProps {
  value: string;
  onChange: (mintAddress: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  publicKey: string | null;
  network: 'testnet' | 'mainnet-beta';
  testId?: string;
  description?: string;
}

export function SolanaTokenPicker({
  value,
  onChange,
  label,
  placeholder = 'Enter token mint address or select from wallet',
  disabled = false,
  publicKey,
  network,
  testId = 'input-mint',
  description,
}: SolanaTokenPickerProps) {
  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTokens = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const connection = getSolanaConnection(network);
      const walletTokens = await getWalletTokens(
        connection,
        new PublicKey(publicKey)
      );
      setTokens(walletTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalOpen && publicKey) {
      fetchTokens();
    }
  }, [modalOpen, publicKey, network]);

  return (
    <div className="space-y-2">
      <Label htmlFor={testId} className="text-white">
        {label}
      </Label>
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
      <div className="flex gap-2">
        <Input
          id={testId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-gray-900 border-gray-700 text-white"
          disabled={disabled}
          data-testid={testId}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setModalOpen(true)}
          disabled={disabled || !publicKey}
          className="flex-shrink-0"
          data-testid={`${testId}-picker-button`}
          title="Select from wallet"
        >
          <Coins className="h-4 w-4" />
        </Button>
      </div>

      <TokenSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tokens={tokens}
        selectedMint={value}
        onSelectToken={onChange}
        loading={loading}
      />
    </div>
  );
}
