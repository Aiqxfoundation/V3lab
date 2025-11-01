import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export interface Transaction {
  id: string;
  hash: string;
  type: 'deployment' | 'transfer' | 'approval' | 'multisend' | 'mint' | 'burn' | 'pause' | 'unpause' | 'transfer_ownership' | 'revoke_authority' | 'other';
  status: 'pending' | 'confirmed' | 'failed';
  description: string;
  chainId: number;
  timestamp: number;
  from?: string;
  to?: string;
  value?: string;
  gasUsed?: string;
  blockNumber?: number;
  confirmations?: number;
  error?: string;
  explorerUrl?: string;
  metadata?: Record<string, any>;
}

interface TransactionContextType {
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  getTransaction: (id: string) => Transaction | undefined;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  watchTransaction: (hash: string, chainId: number) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const STORAGE_KEY = 'aiqx_transactions';
const MAX_TRANSACTIONS = 100;
const POLL_INTERVAL = 2500; // 2.5 seconds

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pollingHandles] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Transaction[];
        setTransactions(parsed);
        // Resume polling for pending transactions
        parsed.filter(tx => tx.status === 'pending').forEach(tx => {
          if (tx.hash && tx.chainId) {
            watchTransaction(tx.hash, tx.chainId);
          }
        });
      } catch (error) {
        console.error('Failed to load transaction history:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions.slice(0, MAX_TRANSACTIONS)));
    }
  }, [transactions]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>): string => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTx: Transaction = {
      ...tx,
      id,
      timestamp: Date.now(),
    };

    setTransactions(prev => [newTx, ...prev].slice(0, MAX_TRANSACTIONS));

    // Show toast notification based on status
    if (tx.status === 'pending') {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transaction Pending
          </div>
        ) as any,
        description: tx.description,
      });
      
      // Start polling if we have a hash
      if (tx.hash && tx.chainId) {
        watchTransaction(tx.hash, tx.chainId);
      }
    } else if (tx.status === 'confirmed') {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Transaction Confirmed
          </div>
        ) as any,
        description: tx.description,
      });
    } else if (tx.status === 'failed') {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Transaction Failed
          </div>
        ) as any,
        description: tx.error || tx.description,
        variant: 'destructive',
      });
    }

    return id;
  }, [toast]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id !== id) return tx;
      
      const updated = { ...tx, ...updates };
      
      // Show toast for status changes
      if (updates.status && updates.status !== tx.status) {
        if (updates.status === 'confirmed') {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Transaction Confirmed
              </div>
            ) as any,
            description: updated.description,
          });
          // Stop polling for this transaction
          const handle = pollingHandles.get(tx.hash);
          if (handle) {
            clearInterval(handle);
            pollingHandles.delete(tx.hash);
          }
        } else if (updates.status === 'failed') {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Transaction Failed
              </div>
            ) as any,
            description: updates.error || updated.description,
            variant: 'destructive',
          });
          // Stop polling for this transaction
          const handle = pollingHandles.get(tx.hash);
          if (handle) {
            clearInterval(handle);
            pollingHandles.delete(tx.hash);
          }
        }
      }
      
      return updated;
    }));
  }, [toast, pollingHandles]);

  const watchTransaction = useCallback(async (hash: string, chainId: number) => {
    if (!window.ethereum) return;
    
    // Don't start duplicate polling
    if (pollingHandles.has(hash)) return;

    const checkTransaction = async () => {
      try {
        if (!window.ethereum) return;
        const provider = new (await import('ethers')).BrowserProvider(window.ethereum);
        const receipt = await provider.getTransactionReceipt(hash);
        
        if (receipt) {
          const tx = transactions.find(t => t.hash === hash);
          if (tx) {
            updateTransaction(tx.id, {
              status: receipt.status === 1 ? 'confirmed' : 'failed',
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString(),
              confirmations: 1,
            });
          }
          
          // Stop polling once confirmed/failed
          const handle = pollingHandles.get(hash);
          if (handle) {
            clearInterval(handle);
            pollingHandles.delete(hash);
          }
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
      }
    };

    // Start polling
    const handle = setInterval(checkTransaction, POLL_INTERVAL);
    pollingHandles.set(hash, handle);
    
    // Do an immediate check
    checkTransaction();
  }, [transactions, updateTransaction, pollingHandles]);

  const clearTransactions = useCallback(() => {
    // Clear all polling handles
    pollingHandles.forEach(handle => clearInterval(handle));
    pollingHandles.clear();
    
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [pollingHandles]);

  const getTransaction = useCallback((id: string) => {
    return transactions.find(tx => tx.id === id);
  }, [transactions]);

  const getTransactionsByType = useCallback((type: Transaction['type']) => {
    return transactions.filter(tx => tx.type === type);
  }, [transactions]);

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingHandles.forEach(handle => clearInterval(handle));
      pollingHandles.clear();
    };
  }, [pollingHandles]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        pendingTransactions,
        addTransaction,
        updateTransaction,
        clearTransactions,
        getTransaction,
        getTransactionsByType,
        watchTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
}