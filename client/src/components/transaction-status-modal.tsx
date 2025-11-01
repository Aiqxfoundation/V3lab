import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export type TransactionStatus = 'processing' | 'confirming' | 'success' | 'failed';

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TransactionStatus;
  txHash?: string;
  contractAddress?: string;
  explorerUrl?: string;
  chainName?: string;
  errorMessage?: string;
}

export function TransactionStatusModal({
  isOpen,
  onClose,
  status,
  txHash,
  contractAddress,
  explorerUrl,
  chainName,
  errorMessage
}: TransactionStatusModalProps) {
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyToClipboard = async (text: string, type: 'hash' | 'address') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'hash') {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
      toast({
        title: 'Copied to clipboard',
        description: `${type === 'hash' ? 'Transaction hash' : 'Contract address'} copied`,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        variant: 'destructive'
      });
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="h-16 w-16 text-cyan-400 animate-spin" />,
          title: 'Processing Transaction',
          description: 'Please sign the transaction in your wallet...'
        };
      case 'confirming':
        return {
          icon: <Loader2 className="h-16 w-16 text-cyan-400 animate-spin" />,
          title: 'Confirming Transaction',
          description: 'Waiting for blockchain confirmation...'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-400" />,
          title: 'Transaction Successful!',
          description: `Your token has been deployed on ${chainName || 'the blockchain'}`
        };
      case 'failed':
        return {
          icon: <XCircle className="h-16 w-16 text-red-400" />,
          title: 'Transaction Failed',
          description: errorMessage || 'The transaction was rejected or failed'
        };
    }
  };

  const content = getStatusContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="transaction-modal">
        <DialogHeader>
          <DialogTitle className="text-center">{content.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {content.icon}
          <p className="text-center text-sm text-gray-400">{content.description}</p>

          {status === 'success' && (
            <div className="w-full space-y-3">
              {contractAddress && (
                <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-500 uppercase">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-cyan-400 break-all font-mono">
                      {contractAddress}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(contractAddress, 'address')}
                      data-testid="copy-address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {txHash && (
                <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-gray-500 uppercase">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-gray-300 break-all font-mono">
                      {txHash.slice(0, 20)}...{txHash.slice(-20)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(txHash, 'hash')}
                      data-testid="copy-hash"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {explorerUrl && txHash && (
                <Button
                  className="w-full"
                  onClick={() => window.open(`${explorerUrl}/tx/${txHash}`, '_blank')}
                  data-testid="view-explorer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
              )}
            </div>
          )}

          {status === 'failed' && (
            <Button onClick={onClose} className="w-full" data-testid="close-modal">
              Close
            </Button>
          )}

          {status === 'success' && (
            <Button onClick={onClose} className="w-full" data-testid="close-modal">
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
