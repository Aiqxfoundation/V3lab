import { type ChainId } from '@shared/schema';
import { Connection } from '@solana/web3.js';

// Use global Buffer polyfill from main.tsx
declare const Buffer: typeof import('buffer').Buffer;

export interface SolanaDeploymentResult {
  mintAddress: string;
  transactionSignature: string;
  networkFee?: number;
}

export interface FeeEstimate {
  totalFee: number;
  rentFee: number;
  transactionFee: number;
  networkName: string;
}

// Helper function to get absolute RPC URL from relative path
function getAbsoluteRpcUrl(relativePath: string): string {
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const origin = window.location.origin;
  return `${origin}${relativePath}`;
}

const RPC_URLS: Record<string, string> = {
  'solana-testnet': '/api/solana-rpc/testnet',
  'solana-mainnet': '/api/solana-rpc/mainnet',
};

const FALLBACK_RPC_URLS: Record<string, string[]> = {
  'solana-testnet': ['/api/solana-rpc/testnet', 'https://api.testnet.solana.com'],
  'solana-mainnet': [
    '/api/solana-rpc/mainnet',
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
  ],
};

// Helper to get Solana connection for a specific network
export function getSolanaConnection(network: 'testnet' | 'mainnet-beta'): Connection {
  let relativePath: string;
  
  switch (network) {
    case 'testnet':
      relativePath = RPC_URLS['solana-testnet'];
      break;
    case 'mainnet-beta':
      relativePath = RPC_URLS['solana-mainnet'];
      break;
  }
  
  return new Connection(getAbsoluteRpcUrl(relativePath), 'confirmed');
}

function getWalletProvider() {
  // Try different wallet providers
  if (window.solana?.isConnected) return window.solana;
  if (window.okxwallet?.solana?.isConnected) return window.okxwallet.solana;
  if (window.solflare?.isConnected) return window.solflare;
  if (window.backpack?.isConnected) return window.backpack;
  return null;
}

// Normalize social media URLs to full URLs
function normalizeSocialUrl(value: string | undefined, platform: 'twitter' | 'telegram'): string | undefined {
  if (!value || value.trim() === '') return undefined;
  
  const trimmed = value.trim();
  
  // Already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // Twitter normalization
  if (platform === 'twitter') {
    // Remove @ if present
    const handle = trimmed.replace(/^@/, '');
    return `https://twitter.com/${handle}`;
  }
  
  // Telegram normalization
  if (platform === 'telegram') {
    // Handle t.me/ format
    if (trimmed.startsWith('t.me/')) {
      return `https://${trimmed}`;
    }
    // Handle @username format
    if (trimmed.startsWith('@')) {
      return `https://t.me/${trimmed.substring(1)}`;
    }
    // Plain username
    return `https://t.me/${trimmed}`;
  }
  
  return undefined;
}

// Estimate network fees for token deployment
export async function estimateDeploymentFees(chainId: ChainId): Promise<FeeEstimate> {
  try {
    const { Connection } = await import('@solana/web3.js');
    const { getMinimumBalanceForRentExemptMint } = await import('@solana/spl-token');
    
    const connection = new Connection(getAbsoluteRpcUrl(RPC_URLS[chainId]), 'confirmed');
    
    // Get rent for mint account
    const rentFee = await getMinimumBalanceForRentExemptMint(connection);
    
    // Use a fixed estimate for transaction fees
    // Solana transaction fees are typically ~5000 lamports (0.000005 SOL)
    const transactionFee = 5000;
    
    const totalFee = rentFee + transactionFee;
    const totalFeeInSol = totalFee / 1e9;
    
    return {
      totalFee: totalFeeInSol,
      rentFee: rentFee / 1e9,
      transactionFee: transactionFee / 1e9,
      networkName: getNetworkName(chainId),
    };
  } catch (error) {
    console.error('Failed to estimate fees:', error);
    // Return default estimate if connection fails
    return {
      totalFee: 0.002,
      rentFee: 0.00144,
      transactionFee: 0.00005,
      networkName: getNetworkName(chainId),
    };
  }
}

export async function deploySolanaToken(
  name: string,
  symbol: string,
  decimals: number,
  totalSupply: string,
  chainId: ChainId,
  enableMintAuthority: boolean,
  enableFreezeAuthority: boolean,
  enableUpdateAuthority: boolean,
  logoUrl?: string,
  description?: string,
  socialLinks?: {
    website?: string;
    twitter?: string;
    telegram?: string;
  }
): Promise<SolanaDeploymentResult> {
  console.log('deploySolanaToken called with:', {
    name,
    symbol,
    decimals,
    totalSupply,
    chainId,
    enableMintAuthority,
    enableFreezeAuthority,
    enableUpdateAuthority,
  });

  const wallet = getWalletProvider();
  
  if (!wallet) {
    throw new Error('No Solana wallet connected. Please connect your wallet first.');
  }

  if (!wallet.publicKey) {
    throw new Error('Wallet is connected but no public key found. Please reconnect your wallet.');
  }

  const walletName = wallet.isPhantom ? 'Phantom' : wallet.isOkxWallet ? 'OKX' : wallet.isSolflare ? 'Solflare' : wallet.isBackpack ? 'Backpack' : 'Unknown';
  console.log('Using wallet:', walletName);
  console.log('Wallet public key:', wallet.publicKey.toString());

  try {
    await ensureCorrectNetwork(wallet, chainId);
  } catch (error: any) {
    console.error('Network switch failed:', error);
    throw new Error(`Please switch to ${getNetworkName(chainId)} in your wallet settings`);
  }

  try {
    const { Connection, Keypair, SystemProgram, Transaction, PublicKey } = await import('@solana/web3.js');
    const { 
      createInitializeMintInstruction,
      createAssociatedTokenAccountInstruction,
      createMintToInstruction,
      createSetAuthorityInstruction,
      AuthorityType,
      getMinimumBalanceForRentExemptMint,
      MINT_SIZE,
      TOKEN_PROGRAM_ID,
      getAssociatedTokenAddress,
    } = await import('@solana/spl-token');

    const { Metaplex, walletAdapterIdentity } = await import('@metaplex-foundation/js');

    const rpcUrl = getAbsoluteRpcUrl(RPC_URLS[chainId]);
    const connection = new Connection(rpcUrl, 'confirmed');
    const payer = wallet.publicKey;
    console.log('Connected to RPC:', rpcUrl);
    console.log('Payer address:', payer.toString());
    
    const mintKeypair = Keypair.generate();
    console.log('Generated mint address:', mintKeypair.publicKey.toString());
    
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);
    console.log('Mint rent:', mintRent);

    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      payer,
    );
    console.log('Associated token account:', associatedTokenAccount.toString());
    
    let metadataUri = '';
    
    if (logoUrl) {
      console.log('Processing logo URL for metadata...');
      if (logoUrl.startsWith('data:')) {
        console.log('📤 Logo is base64 data URI, uploading to Pinata via backend...');
        
        try {
          const { apiRequest } = await import('@/lib/queryClient');
          
          console.log('Step 1: Uploading image to Pinata...');
          const imageResponse = await apiRequest('POST', '/api/upload-image', {
            imageData: logoUrl,
          });
          const imageResult = await imageResponse.json();
          const imageUrl = imageResult.imageUrl;
          const imageContentType = imageResult.contentType;
          
          console.log('✅ Image uploaded to Pinata:', imageUrl);
          console.log('   IPFS Hash:', imageResult.ipfsHash);
          console.log('   Content Type:', imageContentType);
          
          // Normalize social URLs to full URLs
          const normalizedTwitter = normalizeSocialUrl(socialLinks?.twitter, 'twitter');
          const normalizedTelegram = normalizeSocialUrl(socialLinks?.telegram, 'telegram');
          
          const socialLinksForMetadata = {
            website: socialLinks?.website,
            twitter: normalizedTwitter,
            telegram: normalizedTelegram,
          };
          
          console.log('Step 2: Creating and uploading metadata JSON to Pinata...');
          const metadataResponse = await apiRequest('POST', '/api/create-metadata', {
            name,
            symbol,
            description,
            imageUrl,
            imageContentType,
            socialLinks: socialLinksForMetadata,
          });
          const metadataResult = await metadataResponse.json();
          metadataUri = metadataResult.metadataUri;
          
          console.log('✅ Metadata uploaded to Pinata:', metadataUri);
          console.log('   IPFS Hash:', metadataResult.ipfsHash);
          console.log('   Metadata:', JSON.stringify(metadataResult.metadata, null, 2));
        } catch (uploadError: any) {
          console.error('❌ Failed to upload to Pinata:', uploadError.message);
          throw new Error(`Failed to upload image and metadata to Pinata: ${uploadError.message}`);
        }
      } else if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
        console.log('📤 Logo is HTTP(S) URL, creating metadata with external logo...');
        try {
          const { apiRequest } = await import('@/lib/queryClient');
          
          // Normalize social URLs to full URLs
          const normalizedTwitter = normalizeSocialUrl(socialLinks?.twitter, 'twitter');
          const normalizedTelegram = normalizeSocialUrl(socialLinks?.telegram, 'telegram');
          
          const socialLinksForMetadata = {
            website: socialLinks?.website,
            twitter: normalizedTwitter,
            telegram: normalizedTelegram,
          };
          
          console.log('Creating and uploading metadata JSON to Pinata with external logo...');
          const metadataResponse = await apiRequest('POST', '/api/create-metadata', {
            name,
            symbol,
            description,
            imageUrl: logoUrl,
            socialLinks: socialLinksForMetadata,
          });
          const metadataResult = await metadataResponse.json();
          metadataUri = metadataResult.metadataUri;
          
          console.log('✅ Metadata with external logo uploaded to Pinata:', metadataUri);
          console.log('   IPFS Hash:', metadataResult.ipfsHash);
        } catch (uploadError: any) {
          console.error('❌ Failed to upload metadata to Pinata:', uploadError.message);
          throw new Error(`Failed to upload metadata to Pinata: ${uploadError.message}`);
        }
      }
    }
    
    console.log('Final metadata URI:', metadataUri || '(none)');
    
    const transaction = new Transaction();
    console.log('Building transaction...');

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        payer,
        enableFreezeAuthority ? payer : null,
        TOKEN_PROGRAM_ID
      )
    );

    const { createCreateMetadataAccountV3Instruction } = await import('@metaplex-foundation/mpl-token-metadata');
    
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log('Metadata PDA:', metadataPDA.toString());
    
    transaction.add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mintKeypair.publicKey,
          mintAuthority: payer,
          payer: payer,
          updateAuthority: payer,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: name.slice(0, 32),
              symbol: symbol.slice(0, 10),
              uri: metadataUri || '',
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: enableUpdateAuthority,
            collectionDetails: null,
          },
        }
      )
    );
    console.log('Added Metaplex metadata instruction');

    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mintKeypair.publicKey,
      )
    );
    
    console.log(`Creating token. Name: ${name}, Symbol: ${symbol}`);

    const supplyStr = totalSupply.trim() === '' ? '0' : totalSupply;
    const supply = parseTokenAmount(supplyStr, decimals);
    if (supply > BigInt(0)) {
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAccount,
          payer,
          supply,
        )
      );
    }

    if (!enableMintAuthority) {
      transaction.add(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          payer,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;
    console.log('Transaction prepared, blockhash:', blockhash, 'lastValidBlockHeight:', lastValidBlockHeight);

    transaction.partialSign(mintKeypair);
    console.log('Transaction partially signed with mint keypair');

    console.log('Requesting signature from wallet...');
    const signed = await wallet.signTransaction(transaction);
    console.log('Transaction signed by wallet');
    
    console.log('Sending transaction to network...');
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    console.log('✅ Transaction sent! Signature:', signature);
    console.log('🔗 Explorer link:', `https://solscan.io/tx/${signature}${chainId === 'solana-mainnet' ? '' : '?cluster=' + chainId.replace('solana-', '')}`);
    console.log('📝 Transaction Details:', {
      signature,
      mintAddress: mintKeypair.publicKey.toString(),
      network: chainId,
      rpcEndpoint: RPC_URLS[chainId].includes('alchemy') ? 'Alchemy (Premium)' : 'Public RPC'
    });
    
    await confirmTransactionWithRetry(connection, signature, blockhash, lastValidBlockHeight, 'finalized', 3);

    const result = {
      mintAddress: mintKeypair.publicKey.toString(),
      transactionSignature: signature,
    };
    console.log('Deployment successful:', result);

    return result;
  } catch (error: any) {
    console.error('Solana deployment error:', error);
    
    if (error.message?.includes('User rejected') || error.message?.includes('rejected the request')) {
      throw new Error('Transaction rejected by user in wallet');
    }
    
    if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
      throw new Error('Insufficient SOL balance to pay for transaction fees. Please add SOL to your wallet and try again.');
    }
    
    if (error.message?.includes('Blockhash not found') || error.message?.includes('block height exceeded')) {
      throw new Error('Transaction expired before confirmation. This can happen on congested networks. Please try again.');
    }
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error('RPC rate limit exceeded. Please wait a moment and try again, or use a custom RPC endpoint.');
    }
    
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      throw new Error('Transaction confirmation timed out. The token may have been created successfully. Please check the explorer before trying again.');
    }
    
    if (error.message?.includes('already in use')) {
      throw new Error('Token mint address already exists (rare collision). Please try again.');
    }
    
    throw new Error(`Deployment failed: ${error.message || 'Unknown error'}. Please check your wallet and network connection.`);
  }
}

// Helper function to parse token amount with exact precision using BigInt
function parseTokenAmount(amountStr: string, decimals: number): bigint {
  // Remove any whitespace
  const cleaned = amountStr.trim();
  
  // Split on decimal point
  const parts = cleaned.split('.');
  const wholePart = parts[0] || '0';
  const fracPart = parts[1] || '';
  
  // Pad or trim fractional part to match decimals
  const paddedFrac = fracPart.padEnd(decimals, '0').slice(0, decimals);
  
  // Combine whole and fractional parts
  const combined = wholePart + paddedFrac;
  
  // Convert to BigInt
  return BigInt(combined);
}

// Helper function to get network name from chainId
function getNetworkName(chainId: ChainId): string {
  switch (chainId) {
    case 'solana-testnet':
      return 'Testnet';
    case 'solana-mainnet':
      return 'Mainnet';
    default:
      return chainId;
  }
}

async function confirmTransactionWithRetry(
  connection: Connection,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
  commitment: 'processed' | 'confirmed' | 'finalized' = 'finalized',
  maxRetries: number = 3
): Promise<void> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      console.log(`Confirming transaction (attempt ${retries + 1}/${maxRetries})...`);
      
      // Add timeout to confirmTransaction to prevent hanging indefinitely
      const confirmationPromise = connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        commitment
      );
      
      // Create timeout promise (60 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Transaction confirmation timed out after 60 seconds'));
        }, 60000);
      });
      
      // Race between confirmation and timeout
      const confirmation = await Promise.race([confirmationPromise, timeoutPromise]);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ Transaction confirmed successfully!');
      console.log('📊 Final signature status:', signature);
      return;
    } catch (error: any) {
      lastError = error;
      retries++;

      if (error.message?.includes('block height exceeded') || error.message?.includes('Blockhash not found')) {
        throw new Error('Transaction expired. Please try again with a fresh transaction.');
      }

      if (error.message?.includes('timed out')) {
        console.error('Confirmation timeout, checking transaction status...');
        // Try to get transaction status before giving up
        try {
          const status = await connection.getSignatureStatus(signature);
          if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
            console.log('Transaction was actually confirmed!');
            return;
          }
        } catch (statusError) {
          console.warn('Could not check transaction status:', statusError);
        }
      }

      if (retries < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retries), 5000);
        console.log(`Confirmation failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Transaction confirmation failed after maximum retries');
}

// Helper function to ensure wallet is on correct network
async function ensureCorrectNetwork(wallet: any, chainId: ChainId): Promise<void> {
  const targetRpcUrl = getAbsoluteRpcUrl(RPC_URLS[chainId]);
  const networkName = getNetworkName(chainId);
  
  console.log(`Checking if wallet is on ${networkName}...`);
  
  // For Phantom wallet, we can check and request network switch
  if (wallet.isPhantom) {
    try {
      // Import Connection to test current network
      const { Connection } = await import('@solana/web3.js');
      
      // Create connection with wallet's current RPC
      const walletConnection = new Connection(targetRpcUrl, 'confirmed');
      
      // Test connection
      await walletConnection.getLatestBlockhash();
      console.log(`✓ Wallet is connected to ${networkName}`);
      
    } catch (error) {
      console.warn(`Wallet may not be on ${networkName}, attempting switch...`);
      
      // Request network switch via Phantom's API if available
      if (wallet.request) {
        try {
          await wallet.request({
            method: 'wallet_switchNetwork',
            params: { network: chainId.replace('solana-', '') },
          });
          console.log(`✓ Switched wallet to ${networkName}`);
          
          // Wait a bit for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (switchError: any) {
          console.warn('Automatic network switch not supported:', switchError.message);
          throw new Error(`Please manually switch your wallet to ${networkName}`);
        }
      }
    }
  } else {
    // For other wallets, just log a warning
    console.log(`Note: Using ${networkName}. If transaction fails, please switch your wallet network manually.`);
  }
}
