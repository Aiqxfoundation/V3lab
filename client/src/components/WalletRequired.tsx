import { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wallet } from 'lucide-react';
import { useSolanaWallet } from '@/contexts/SolanaWalletContext';

interface WalletRequiredProps {
  children: ReactNode;
  message?: string;
}

export function WalletRequired({ 
  children, 
  message = "Connect your wallet to use this feature"
}: WalletRequiredProps) {
  const { isConnected } = useSolanaWallet();

  return (
    <>
      {!isConnected && (
        <Alert className="bg-amber-900/20 border-amber-500/50 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-amber-200 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {message}. Use the "Connect Wallet" button in the top navigation.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
}
