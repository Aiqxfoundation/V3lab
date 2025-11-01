import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type WalletProvider = 'phantom' | 'okx' | 'solflare' | 'backpack' | 'unknown';

interface SolanaWalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  walletProvider: WalletProvider | null;
  availableWallets: WalletProvider[];
  connect: (provider?: WalletProvider) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAndSendTransaction: (transaction: any) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(undefined);

interface SolanaProvider {
  isPhantom?: boolean;
  isOkxWallet?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: any;
  isConnected?: boolean;
  connect: () => Promise<any>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAndSendTransaction?: (transaction: any) => Promise<any>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeAllListeners?: () => void;
}

function getWalletProvider(provider: any): WalletProvider {
  if (provider?.isPhantom) return 'phantom';
  if (provider?.isOkxWallet) return 'okx';
  if (provider?.isSolflare) return 'solflare';
  if (provider?.isBackpack) return 'backpack';
  return 'unknown';
}

function getAvailableWallets(): WalletProvider[] {
  const wallets: WalletProvider[] = [];
  
  if (typeof window === 'undefined') return wallets;
  
  // Phantom
  if (window.solana?.isPhantom) {
    wallets.push('phantom');
  }
  
  // OKX Wallet - check multiple patterns
  if (window.okxwallet?.solana || (window as any).okex?.solana) {
    wallets.push('okx');
  }
  
  // Solflare
  if (window.solflare) {
    wallets.push('solflare');
  }
  
  // Backpack
  if (window.backpack) {
    wallets.push('backpack');
  }
  
  // Debug logging
  console.log('[Solana Wallet Detection] Found wallets:', wallets);
  console.log('[Solana Wallet Detection] window.solana:', !!window.solana);
  console.log('[Solana Wallet Detection] window.okxwallet.solana:', !!(window as any).okxwallet?.solana);
  console.log('[Solana Wallet Detection] window.okex:', !!(window as any).okex);
  console.log('[Solana Wallet Detection] window.solflare:', !!window.solflare);
  console.log('[Solana Wallet Detection] window.backpack:', !!window.backpack);
  
  return wallets;
}

function getProviderByType(type: WalletProvider): SolanaProvider | null {
  if (typeof window === 'undefined') return null;
  
  switch (type) {
    case 'phantom':
      return window.solana?.isPhantom ? window.solana : null;
    case 'okx':
      return window.okxwallet?.solana || (window as any).okex?.solana || null;
    case 'solflare':
      return window.solflare || null;
    case 'backpack':
      return window.backpack || null;
    default:
      return null;
  }
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);
  const [currentProvider, setCurrentProvider] = useState<SolanaProvider | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    
    const detectWalletsWithRetry = () => {
      const wallets = getAvailableWallets();
      setAvailableWallets(wallets);
      
      if (wallets.length === 0 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(detectWalletsWithRetry, 300);
      }
    };
    
    detectWalletsWithRetry();
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        const wallets = getAvailableWallets();
        setAvailableWallets(wallets);
      }, 500);
    });
    
    // Auto-connect to previously connected wallet
    const checkAutoConnect = async () => {
      const savedProvider = localStorage.getItem('solanaWalletProvider');
      const savedConnected = localStorage.getItem('solanaWalletConnected');
      
      if (savedConnected === 'true' && savedProvider) {
        const provider = getProviderByType(savedProvider as WalletProvider);
        if (provider?.isConnected && provider?.publicKey) {
          setPublicKey(provider.publicKey.toString());
          setWalletProvider(savedProvider as WalletProvider);
          setCurrentProvider(provider);
          
          // Set up event listeners
          provider.on?.('connect', () => {
            if (provider.publicKey) {
              setPublicKey(provider.publicKey.toString());
            }
          });
          
          provider.on?.('disconnect', () => {
            setPublicKey(null);
            setWalletProvider(null);
            setCurrentProvider(null);
            localStorage.removeItem('solanaWalletConnected');
            localStorage.removeItem('solanaWalletProvider');
          });
        }
      }
    };
    
    setTimeout(checkAutoConnect, 500);
  }, []);

  const connect = async (provider?: WalletProvider) => {
    let selectedProvider: SolanaProvider | null = null;
    let providerType: WalletProvider;
    
    if (provider) {
      selectedProvider = getProviderByType(provider);
      providerType = provider;
    } else {
      // Try to connect to the first available wallet
      const available = getAvailableWallets();
      if (available.length === 0) {
        throw new Error('No Solana wallet detected. Please install Phantom, OKX, Solflare, or Backpack wallet.');
      }
      providerType = available[0];
      selectedProvider = getProviderByType(providerType);
    }
    
    if (!selectedProvider) {
      const walletName = providerType.charAt(0).toUpperCase() + providerType.slice(1);
      throw new Error(`${walletName} wallet not found. Please install it to continue.`);
    }

    try {
      console.log(`Connecting to ${providerType} wallet...`);
      const response = await selectedProvider.connect();
      const pubKey = response?.publicKey || selectedProvider.publicKey;
      
      if (!pubKey) {
        throw new Error('Failed to get public key from wallet. Please try again.');
      }
      
      console.log(`Successfully connected to ${providerType} wallet:`, pubKey.toString());
      
      setPublicKey(pubKey.toString());
      setWalletProvider(providerType);
      setCurrentProvider(selectedProvider);
      localStorage.setItem('solanaWalletConnected', 'true');
      localStorage.setItem('solanaWalletProvider', providerType);
      
      // Set up event listeners
      selectedProvider.on('connect', () => {
        if (selectedProvider.publicKey) {
          setPublicKey(selectedProvider.publicKey.toString());
        }
      });
      
      selectedProvider.on('disconnect', () => {
        setPublicKey(null);
        setWalletProvider(null);
        setCurrentProvider(null);
        localStorage.removeItem('solanaWalletConnected');
        localStorage.removeItem('solanaWalletProvider');
      });
      
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // User rejected the connection
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw new Error('You canceled the wallet connection. Please try again and approve the connection in your wallet.');
      }
      
      // Wallet locked
      if (error.message?.includes('locked')) {
        throw new Error('Please unlock your wallet and try again.');
      }
      
      // Network or timeout errors
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      }
      
      // Generic error with original message
      throw new Error(error.message || 'Failed to connect wallet. Please try again.');
    }
  };

  const disconnect = async () => {
    if (currentProvider) {
      try {
        await currentProvider.disconnect();
      } catch (error) {
        console.error('Error disconnecting Solana wallet:', error);
        throw error;
      } finally {
        // Clear state and localStorage even if disconnect fails
        setPublicKey(null);
        setWalletProvider(null);
        setCurrentProvider(null);
        localStorage.removeItem('solanaWalletConnected');
        localStorage.removeItem('solanaWalletProvider');
      }
    }
  };

  const signTransaction = async (transaction: any) => {
    if (!currentProvider || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTx = await currentProvider.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  };

  const signAndSendTransaction = async (transaction: any) => {
    if (!currentProvider || !publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentProvider.signAndSendTransaction) {
      throw new Error('Wallet does not support signAndSendTransaction');
    }

    try {
      const { signature } = await currentProvider.signAndSendTransaction(transaction);
      return signature;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!currentProvider || !publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentProvider.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    try {
      const result = await currentProvider.signMessage(message);
      
      if (result instanceof Uint8Array) {
        return result;
      }
      
      if (result && typeof result === 'object' && 'signature' in result) {
        return result.signature;
      }
      
      throw new Error('Unexpected signMessage response format');
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  };

  return (
    <SolanaWalletContext.Provider
      value={{
        publicKey,
        isConnected: !!publicKey,
        walletProvider,
        availableWallets,
        connect,
        disconnect,
        signTransaction,
        signAndSendTransaction,
        signMessage,
      }}
    >
      {children}
    </SolanaWalletContext.Provider>
  );
}

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext);
  if (!context) {
    throw new Error('useSolanaWallet must be used within SolanaWalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
    okxwallet?: any;
    solflare?: SolanaProvider;
    backpack?: SolanaProvider;
  }
}
