import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  createMintToInstruction,
  createBurnInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  getAccount,
  getMint,
  createFreezeAccountInstruction,
  createThawAccountInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
// import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';

/**
 * Multisender: Send tokens to multiple addresses in a single transaction
 */
export async function multisendTokens(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  recipients: { address: string; amount: number }[],
  decimals: number,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  const mint = new PublicKey(mintAddress);
  const transaction = new Transaction();

  // Get sender's token account
  const senderTokenAccount = await getAssociatedTokenAddress(mint, payer);

  for (const recipient of recipients) {
    const recipientPubkey = new PublicKey(recipient.address);
    const recipientTokenAccount = await getAssociatedTokenAddress(mint, recipientPubkey);

    // Check if recipient token account exists, if not create it
    try {
      await getAccount(connection, recipientTokenAccount);
    } catch {
      // Account doesn't exist, add instruction to create it
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer,
          recipientTokenAccount,
          recipientPubkey,
          mint
        )
      );
    }

    // Add transfer instruction
    const amount = BigInt(recipient.amount * Math.pow(10, decimals));
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        payer,
        amount
      )
    );
  }

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  // Sign and send
  const signedTx = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  console.log('✅ Multisend transaction sent! Signature:', signature);
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
  console.log('✅ Multisend transaction confirmed! Signature:', signature);

  return signature;
}

/**
 * Transfer Authority: Transfer mint or freeze authority to another wallet
 */
export async function transferAuthority(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  authorityType: 'mint' | 'freeze',
  newAuthority: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  const mint = new PublicKey(mintAddress);
  const newAuthorityPubkey = new PublicKey(newAuthority);
  const transaction = new Transaction();

  const authType = authorityType === 'mint' ? AuthorityType.MintTokens : AuthorityType.FreezeAccount;

  transaction.add(
    createSetAuthorityInstruction(
      mint,
      payer,
      authType,
      newAuthorityPubkey
    )
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  const signedTx = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  console.log(`✅ Transfer ${authorityType} authority transaction sent! Signature:`, signature);
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
  console.log(`✅ Transfer ${authorityType} authority confirmed! Signature:`, signature);

  return signature;
}

/**
 * Update Metadata: Update token metadata using Metaplex
 * Note: This feature is coming soon and requires proper Metaplex setup
 */
export async function updateTokenMetadata(
  connection: Connection,
  wallet: any,
  mintAddress: string,
  metadata: {
    name?: string;
    symbol?: string;
    description?: string;
    image?: string;
  }
): Promise<string> {
  // TODO: Implement when Metaplex browser compatibility is resolved
  throw new Error('Metadata update feature coming soon');
}

/**
 * Mint Tokens: Mint additional tokens to a wallet
 */
export async function mintTokens(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  destinationAddress: string,
  amount: number,
  decimals: number,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  const mint = new PublicKey(mintAddress);
  const destination = new PublicKey(destinationAddress);
  const transaction = new Transaction();

  // Get or create destination token account
  const destinationTokenAccount = await getAssociatedTokenAddress(mint, destination);

  try {
    await getAccount(connection, destinationTokenAccount);
  } catch {
    // Account doesn't exist, create it
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        destinationTokenAccount,
        destination,
        mint
      )
    );
  }

  // Add mint instruction
  const mintAmount = BigInt(amount * Math.pow(10, decimals));
  transaction.add(
    createMintToInstruction(
      mint,
      destinationTokenAccount,
      payer,
      mintAmount
    )
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  const signedTx = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  console.log(`✅ Mint ${amount} tokens transaction sent! Signature:`, signature);
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
  console.log(`✅ Mint ${amount} tokens confirmed! Signature:`, signature);

  return signature;
}

/**
 * Burn Tokens: Burn tokens from your wallet
 */
export async function burnTokens(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  amount: number,
  decimals: number,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  const mint = new PublicKey(mintAddress);
  const transaction = new Transaction();

  // Get token account
  const tokenAccount = await getAssociatedTokenAddress(mint, payer);

  // Add burn instruction
  const burnAmount = BigInt(amount * Math.pow(10, decimals));
  transaction.add(
    createBurnInstruction(
      tokenAccount,
      mint,
      payer,
      burnAmount
    )
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  const signedTx = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  console.log(`✅ Burn ${amount} tokens transaction sent! Signature:`, signature);
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
  console.log(`✅ Burn ${amount} tokens confirmed! Signature:`, signature);

  return signature;
}

/**
 * Freeze Account: Freeze a token account
 * @param accountToFreeze - Can be either a wallet address or token account address
 */
export async function freezeTokenAccount(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  accountToFreeze: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const mint = new PublicKey(mintAddress);
    let tokenAccountAddress: PublicKey;
    let isTokenAccount = false;
    
    // Validate the mint has freeze authority
    const mintInfo = await getMint(connection, mint);
    if (!mintInfo.freezeAuthority) {
      throw new Error('This token does not have freeze authority enabled');
    }
    
    if (mintInfo.freezeAuthority.toBase58() !== payer.toBase58()) {
      throw new Error(`You are not the freeze authority for this token. Freeze authority: ${mintInfo.freezeAuthority.toBase58().slice(0, 8)}...`);
    }
    
    // First, try to derive ATA assuming input is a wallet address
    const inputPubkey = new PublicKey(accountToFreeze);
    const derivedATA = await getAssociatedTokenAddress(mint, inputPubkey);
    
    console.log('🔍 Checking if input is wallet or token account...');
    console.log('Input address:', accountToFreeze);
    console.log('Derived ATA:', derivedATA.toBase58());
    
    // Try to fetch the derived ATA
    try {
      const ataInfo = await getAccount(connection, derivedATA);
      console.log('✅ Found token account at derived ATA');
      console.log('Token account mint:', ataInfo.mint.toBase58());
      console.log('Is frozen:', ataInfo.isFrozen);
      
      if (ataInfo.isFrozen) {
        throw new Error('Token account is already frozen');
      }
      tokenAccountAddress = derivedATA;
      isTokenAccount = true;
    } catch (ataError: any) {
      console.log('❌ Could not find account at derived ATA:', ataError.message);
      
      // If ATA doesn't exist, try the input address directly
      try {
        const directAccountInfo = await getAccount(connection, inputPubkey);
        console.log('✅ Found token account at input address directly');
        console.log('Token account mint:', directAccountInfo.mint.toBase58());
        
        if (directAccountInfo.mint.toBase58() !== mint.toBase58()) {
          throw new Error('Token account does not belong to the specified mint');
        }
        if (directAccountInfo.isFrozen) {
          throw new Error('Token account is already frozen');
        }
        tokenAccountAddress = inputPubkey;
        isTokenAccount = true;
      } catch (directError: any) {
        console.log('❌ Could not find account at input address:', directError.message);
        throw new Error('Could not find token account. Please verify:\n1. The holder has tokens from this mint\n2. The address is correct\n3. The token account is initialized');
      }
    }

    if (!isTokenAccount) {
      throw new Error('No valid token account found');
    }

    console.log('🎯 Using token account:', tokenAccountAddress.toBase58());

    const transaction = new Transaction();

    transaction.add(
      createFreezeAccountInstruction(
        tokenAccountAddress,
        mint,
        payer
      )
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;

    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    console.log('✅ Freeze account transaction sent! Signature:', signature);
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    console.log('✅ Freeze account confirmed! Signature:', signature);

    return signature;
  } catch (error: any) {
    console.error('❌ Error freezing account:', error);
    throw new Error(error.message || 'Failed to freeze token account');
  }
}

/**
 * Unfreeze Account: Unfreeze a token account
 * @param accountToUnfreeze - Can be either a wallet address or token account address
 */
export async function unfreezeTokenAccount(
  connection: Connection,
  payer: PublicKey,
  mintAddress: string,
  accountToUnfreeze: string,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const mint = new PublicKey(mintAddress);
    let tokenAccountAddress: PublicKey;
    let isTokenAccount = false;
    
    // Validate the mint has freeze authority
    const mintInfo = await getMint(connection, mint);
    if (!mintInfo.freezeAuthority) {
      throw new Error('This token does not have freeze authority enabled');
    }
    
    if (mintInfo.freezeAuthority.toBase58() !== payer.toBase58()) {
      throw new Error(`You are not the freeze authority for this token. Freeze authority: ${mintInfo.freezeAuthority.toBase58().slice(0, 8)}...`);
    }
    
    // First, try to derive ATA assuming input is a wallet address
    const inputPubkey = new PublicKey(accountToUnfreeze);
    const derivedATA = await getAssociatedTokenAddress(mint, inputPubkey);
    
    console.log('🔍 Checking if input is wallet or token account...');
    console.log('Input address:', accountToUnfreeze);
    console.log('Derived ATA:', derivedATA.toBase58());
    
    // Try to fetch the derived ATA
    try {
      const ataInfo = await getAccount(connection, derivedATA);
      console.log('✅ Found token account at derived ATA');
      console.log('Token account mint:', ataInfo.mint.toBase58());
      console.log('Is frozen:', ataInfo.isFrozen);
      
      if (!ataInfo.isFrozen) {
        throw new Error('Token account is not frozen');
      }
      tokenAccountAddress = derivedATA;
      isTokenAccount = true;
    } catch (ataError: any) {
      console.log('❌ Could not find account at derived ATA:', ataError.message);
      
      // If ATA doesn't exist, try the input address directly
      try {
        const directAccountInfo = await getAccount(connection, inputPubkey);
        console.log('✅ Found token account at input address directly');
        console.log('Token account mint:', directAccountInfo.mint.toBase58());
        
        if (directAccountInfo.mint.toBase58() !== mint.toBase58()) {
          throw new Error('Token account does not belong to the specified mint');
        }
        if (!directAccountInfo.isFrozen) {
          throw new Error('Token account is not frozen');
        }
        tokenAccountAddress = inputPubkey;
        isTokenAccount = true;
      } catch (directError: any) {
        console.log('❌ Could not find account at input address:', directError.message);
        throw new Error('Could not find token account. Please verify:\n1. The holder has tokens from this mint\n2. The address is correct\n3. The token account is initialized');
      }
    }

    if (!isTokenAccount) {
      throw new Error('No valid token account found');
    }

    console.log('🎯 Using token account:', tokenAccountAddress.toBase58());

    const transaction = new Transaction();

    transaction.add(
      createThawAccountInstruction(
        tokenAccountAddress,
        mint,
        payer
      )
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;

    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    console.log('✅ Unfreeze account transaction sent! Signature:', signature);
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    console.log('✅ Unfreeze account confirmed! Signature:', signature);

    return signature;
  } catch (error: any) {
    console.error('❌ Error unfreezing account:', error);
    throw new Error(error.message || 'Failed to unfreeze token account');
  }
}

/**
 * Get Token Balance
 */
export async function getTokenBalance(
  connection: Connection,
  mintAddress: string,
  owner: PublicKey
): Promise<number> {
  try {
    const mint = new PublicKey(mintAddress);
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(connection, tokenAccount);
    const mintInfo = await getMint(connection, mint);
    return Number(account.amount) / Math.pow(10, mintInfo.decimals);
  } catch {
    return 0;
  }
}

/**
 * Check if account is frozen
 */
export async function isAccountFrozen(
  connection: Connection,
  accountAddress: string
): Promise<boolean> {
  try {
    const account = await getAccount(connection, new PublicKey(accountAddress));
    return account.isFrozen;
  } catch {
    return false;
  }
}

/**
 * Interface for token account information
 */
export interface WalletToken {
  mintAddress: string;
  balance: string;
  decimals: number;
  tokenAccountAddress: string;
  name?: string;
  symbol?: string;
  image?: string;
}

/**
 * Fetch all SPL tokens owned by a wallet
 */
export async function getWalletTokens(
  connection: Connection,
  owner: PublicKey
): Promise<WalletToken[]> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      { programId: TOKEN_PROGRAM_ID }
    );

    const tokens: WalletToken[] = [];

    for (const { pubkey, account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      const mintAddress = parsedInfo.mint;
      const balance = parsedInfo.tokenAmount.uiAmountString;
      const decimals = parsedInfo.tokenAmount.decimals;

      if (parseFloat(balance) > 0) {
        tokens.push({
          mintAddress,
          balance,
          decimals,
          tokenAccountAddress: pubkey.toBase58(),
        });
      }
    }

    return tokens;
  } catch (error) {
    console.error('Error fetching wallet tokens:', error);
    throw new Error('Failed to fetch wallet tokens');
  }
}
