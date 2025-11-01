import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { getNetworkConfig, addNetwork, isChainSupported } from '@/config/networks';

export type EvmWalletProvider = 'metamask' | 'trustwallet' | 'okx' | 'bitget' | 'binance' | 'coinbase';

interface WalletInfo {
  name: string;
  provider: EvmWalletProvider;
  isInstalled: boolean;
  ethereum?: any;
}

interface EvmWalletContextType {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  networkName: string | null;
  isWrongNetwork: boolean;
  targetChainId: number | null;
  selectedWallet: EvmWalletProvider | null;
  availableWallets: WalletInfo[];
  connect: (walletProvider?: EvmWalletProvider) => Promise<void>;
  disconnect: () => void;
  switchChain: (targetChainId: number) => Promise<void>;
  signTransaction: (tx: any) => Promise<string>;
  setTargetChainId: (chainId: number | null) => void;
  isMetaMaskInstalled: boolean;
  addAndSwitchNetwork: (chainId: number) => Promise<void>;
}

const EvmWalletContext = createContext<EvmWalletContextType | undefined>(undefined);

// Global store for EIP-6963 announced providers
const eip6963Providers = new Map<string, any>();

function detectWallets(): WalletInfo[] {
  if (typeof window === 'undefined') return [];
  
  const wallets: WalletInfo[] = [];
  const detectedProviders = new Set<string>();
  
  // EIP-6963: Check announced providers first
  for (const [uuid, providerDetail] of eip6963Providers.entries()) {
    const info = providerDetail.info;
    const provider = providerDetail.provider;
    
    if (info.rdns?.includes('metamask') || info.name?.toLowerCase().includes('metamask')) {
      if (!detectedProviders.has('metamask')) {
        wallets.push({
          name: 'MetaMask',
          provider: 'metamask',
          isInstalled: true,
          ethereum: provider,
        });
        detectedProviders.add('metamask');
      }
    } else if (info.rdns?.includes('trust') || info.name?.toLowerCase().includes('trust')) {
      if (!detectedProviders.has('trustwallet')) {
        wallets.push({
          name: 'Trust Wallet',
          provider: 'trustwallet',
          isInstalled: true,
          ethereum: provider,
        });
        detectedProviders.add('trustwallet');
      }
    } else if (info.rdns?.includes('coinbase') || info.name?.toLowerCase().includes('coinbase')) {
      if (!detectedProviders.has('coinbase')) {
        wallets.push({
          name: 'Coinbase Wallet',
          provider: 'coinbase',
          isInstalled: true,
          ethereum: provider,
        });
        detectedProviders.add('coinbase');
      }
    } else if (info.rdns?.includes('okx') || info.rdns?.includes('okex') || info.name?.toLowerCase().includes('okx')) {
      if (!detectedProviders.has('okx')) {
        wallets.push({
          name: 'OKX Wallet',
          provider: 'okx',
          isInstalled: true,
          ethereum: provider,
        });
        detectedProviders.add('okx');
      }
    } else if (info.rdns?.includes('bitget') || info.rdns?.includes('bitkeep') || info.name?.toLowerCase().includes('bitget')) {
      if (!detectedProviders.has('bitget')) {
        wallets.push({
          name: 'Bitget Wallet',
          provider: 'bitget',
          isInstalled: true,
          ethereum: provider,
        });
        detectedProviders.add('bitget');
      }
    } else if (info.rdns?.includes('binance') || info.name?.toLowerCase().includes('binance')) {
      if (!detectedProviders.has('binance')) {
        wallets.push({
          name: 'Binance Wallet',
          provider: 'binance',
          isInstalled: true,
          ethereum: provider,
        });
        detectedProviders.add('binance');
      }
    }
  }
  
  // Fallback: Check window.ethereum properties
  if (window.ethereum) {
    if (window.ethereum.isMetaMask && !window.ethereum.isBraveWallet && !detectedProviders.has('metamask')) {
      wallets.push({
        name: 'MetaMask',
        provider: 'metamask',
        isInstalled: true,
        ethereum: window.ethereum,
      });
      detectedProviders.add('metamask');
    }
    
    if (window.ethereum.isTrust && !detectedProviders.has('trustwallet')) {
      wallets.push({
        name: 'Trust Wallet',
        provider: 'trustwallet',
        isInstalled: true,
        ethereum: window.ethereum,
      });
      detectedProviders.add('trustwallet');
    }
    
    if (window.ethereum.isCoinbaseWallet && !detectedProviders.has('coinbase')) {
      wallets.push({
        name: 'Coinbase Wallet',
        provider: 'coinbase',
        isInstalled: true,
        ethereum: window.ethereum,
      });
      detectedProviders.add('coinbase');
    }
  }
  
  // Check specific wallet objects - OKX with multiple detection patterns
  if (!detectedProviders.has('okx')) {
    // Try multiple OKX injection patterns
    const okxProvider = (window as any).okxwallet || 
                       (window as any).okex || 
                       ((window as any).ethereum?.isOkxWallet ? (window as any).ethereum : null);
    
    if (okxProvider) {
      wallets.push({
        name: 'OKX Wallet',
        provider: 'okx',
        isInstalled: true,
        ethereum: okxProvider,
      });
      detectedProviders.add('okx');
    }
  }
  
  if ((window as any).bitkeep?.ethereum && !detectedProviders.has('bitget')) {
    wallets.push({
      name: 'Bitget Wallet',
      provider: 'bitget',
      isInstalled: true,
      ethereum: (window as any).bitkeep.ethereum,
    });
    detectedProviders.add('bitget');
  }
  
  if ((window as any).BinanceChain && !detectedProviders.has('binance')) {
    wallets.push({
      name: 'Binance Wallet',
      provider: 'binance',
      isInstalled: true,
      ethereum: (window as any).BinanceChain,
    });
    detectedProviders.add('binance');
  }
  
  // Final fallback: if no wallets detected but window.ethereum exists
  if (wallets.length === 0 && window.ethereum) {
    wallets.push({
      name: 'MetaMask',
      provider: 'metamask',
      isInstalled: true,
      ethereum: window.ethereum,
    });
  }
  
  // Debug logging
  console.log('[Wallet Detection] Found wallets:', wallets.map(w => w.name));
  console.log('[Wallet Detection] EIP-6963 providers:', Array.from(eip6963Providers.keys()));
  console.log('[Wallet Detection] window.okxwallet:', !!(window as any).okxwallet);
  console.log('[Wallet Detection] window.okex:', !!(window as any).okex);
  console.log('[Wallet Detection] window.ethereum.isOkxWallet:', !!((window as any).ethereum?.isOkxWallet));
  
  return wallets;
}

export function EvmWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<EvmWalletProvider | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [currentProvider, setCurrentProvider] = useState<any>(null);

  const isWrongNetwork = targetChainId !== null && chainId !== null && targetChainId !== chainId;
  const isMetaMaskInstalled = availableWallets.some(w => w.provider === 'metamask');

  useEffect(() => {
    // Listen for EIP-6963 announcements
    const handleEIP6963Announce = (event: any) => {
      if (event.detail) {
        const { info, provider } = event.detail;
        // Store provider with UUID
        const uuid = info.uuid || info.rdns || crypto.randomUUID();
        eip6963Providers.set(uuid, { info, provider });
        
        // Re-detect wallets with new provider
        const wallets = detectWallets();
        setAvailableWallets(wallets);
      }
    };
    
    window.addEventListener('eip6963:announceProvider', handleEIP6963Announce);
    
    // Request wallet announcements
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    
    let retryCount = 0;
    const maxRetries = 10;
    
    const detectWalletsWithRetry = () => {
      const wallets = detectWallets();
      setAvailableWallets(wallets);
      
      if (wallets.length === 0 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(detectWalletsWithRetry, 300);
      }
    };
    
    setTimeout(detectWalletsWithRetry, 100);
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        const wallets = detectWallets();
        setAvailableWallets(wallets);
      }, 500);
    });
    
    const wallets = detectWallets();
    setAvailableWallets(wallets);

    const checkConnection = async () => {
      const savedWallet = localStorage.getItem('evmWalletProvider') as EvmWalletProvider;
      const savedConnection = localStorage.getItem('evmWalletConnected');
      
      if (savedConnection === 'true' && savedWallet) {
        const wallet = wallets.find(w => w.provider === savedWallet);
        if (wallet?.ethereum) {
          try {
            const accounts = await wallet.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              setSelectedWallet(savedWallet);
              setCurrentProvider(wallet.ethereum);
              const chainIdHex = await wallet.ethereum.request({ method: 'eth_chainId' });
              setChainId(parseInt(chainIdHex, 16));
            }
          } catch (error) {
            console.error('Error checking wallet connection:', error);
            localStorage.removeItem('evmWalletConnected');
            localStorage.removeItem('evmWalletProvider');
          }
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
        setSelectedWallet(null);
        localStorage.removeItem('evmWalletConnected');
        localStorage.removeItem('evmWalletProvider');
      } else {
        setAddress(accounts[0]);
        localStorage.setItem('evmWalletConnected', 'true');
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
    };

    wallets.forEach(wallet => {
      if (wallet.ethereum) {
        wallet.ethereum.on?.('accountsChanged', handleAccountsChanged);
        wallet.ethereum.on?.('chainChanged', handleChainChanged);
      }
    });

    return () => {
      wallets.forEach(wallet => {
        if (wallet.ethereum) {
          wallet.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
          wallet.ethereum.removeListener?.('chainChanged', handleChainChanged);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (chainId !== null) {
      const network = getNetworkConfig(chainId);
      setNetworkName(network?.displayName || 'Unknown Network');
    } else {
      setNetworkName(null);
    }
  }, [chainId]);

  const connect = async (walletProvider?: EvmWalletProvider) => {
    const targetWallet = walletProvider || availableWallets[0]?.provider;
    if (!targetWallet) {
      throw new Error('No wallet available. Please install a Web3 wallet.');
    }

    const wallet = availableWallets.find(w => w.provider === targetWallet);
    if (!wallet || !wallet.ethereum) {
      throw new Error(`${targetWallet} wallet not found. Please install it.`);
    }

    try {
      const accounts = await wallet.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setSelectedWallet(targetWallet);
      setCurrentProvider(wallet.ethereum);
      
      const chainIdHex = await wallet.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));
      
      localStorage.setItem('evmWalletConnected', 'true');
      localStorage.setItem('evmWalletProvider', targetWallet);
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
    setSelectedWallet(null);
    setCurrentProvider(null);
    localStorage.removeItem('evmWalletConnected');
    localStorage.removeItem('evmWalletProvider');
  };

  const switchChain = async (targetChainId: number) => {
    if (!currentProvider) {
      throw new Error('Wallet not connected');
    }

    try {
      await currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await addAndSwitchNetwork(targetChainId);
      } else if (error.code === 4001) {
        throw new Error('User rejected the request');
      } else {
        throw error;
      }
    }
  };

  const addAndSwitchNetwork = async (chainId: number) => {
    if (!currentProvider) {
      throw new Error('Wallet not connected');
    }

    if (!isChainSupported(chainId)) {
      throw new Error('This network is not supported');
    }
    
    try {
      await addNetwork(chainId);
      await currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected adding the network');
      }
      throw error;
    }
  };

  const signTransaction = async (tx: any) => {
    if (!currentProvider || !address) {
      throw new Error('Wallet not connected');
    }

    const provider = new ethers.BrowserProvider(currentProvider);
    const signer = await provider.getSigner();
    const txResponse = await signer.sendTransaction(tx);
    await txResponse.wait();
    return txResponse.hash;
  };

  return (
    <EvmWalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        chainId,
        networkName,
        isWrongNetwork,
        targetChainId,
        selectedWallet,
        availableWallets,
        connect,
        disconnect,
        switchChain,
        signTransaction,
        setTargetChainId,
        isMetaMaskInstalled,
        addAndSwitchNetwork,
      }}
    >
      {children}
    </EvmWalletContext.Provider>
  );
}

export function useEvmWallet() {
  const context = useContext(EvmWalletContext);
  if (!context) {
    throw new Error('useEvmWallet must be used within EvmWalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any & {
      isMetaMask?: boolean;
      isBraveWallet?: boolean;
      isTrust?: boolean;
      isCoinbaseWallet?: boolean;
    };
    okxwallet?: any;
    bitkeep?: any;
    BinanceChain?: any;
  }
}
