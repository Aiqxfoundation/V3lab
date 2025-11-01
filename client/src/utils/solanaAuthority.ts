import { 
  Connection, 
  PublicKey, 
  Transaction,
} from '@solana/web3.js';
import {
  getMint,
  AuthorityType,
} from '@solana/spl-token';

export interface TokenAuthorities {
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

/**
 * Get the current authorities for a token
 */
export async function getTokenAuthorities(
  connection: Connection,
  mintAddress: string
): Promise<TokenAuthorities> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mintPubkey);
    
    return {
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
    };
  } catch (error) {
    console.error('Error fetching token authorities:', error);
    throw new Error('Failed to fetch token authorities');
  }
}

/**
 * Revoke mint authority for a token
 * WARNING: This action is IRREVERSIBLE! Once revoked, you cannot mint more tokens.
 */
export async function revokeMintAuthority(
  connection: Connection,
  mintAddress: string,
  currentAuthority: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const { createSetAuthorityInstruction } = await import('@solana/spl-token');
    const mintPubkey = new PublicKey(mintAddress);
    
    // Create transaction to revoke mint authority
    const transaction = new Transaction();
    
    // Create the setAuthority instruction to revoke mint authority
    const instruction = createSetAuthorityInstruction(
      mintPubkey,          // account
      currentAuthority,    // current authority
      AuthorityType.MintTokens, // authority type
      null                 // new authority (null = revoke)
    );
    
    transaction.add(instruction);
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = currentAuthority;
    
    // Sign and send transaction
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    console.log('Mint authority revoked. Signature:', signature);
    return signature;
  } catch (error) {
    console.error('Error revoking mint authority:', error);
    throw new Error('Failed to revoke mint authority: ' + (error as Error).message);
  }
}

/**
 * Revoke freeze authority for a token
 * WARNING: This action is IRREVERSIBLE! Once revoked, you cannot freeze/unfreeze accounts.
 */
export async function revokeFreezeAuthority(
  connection: Connection,
  mintAddress: string,
  currentAuthority: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const { createSetAuthorityInstruction } = await import('@solana/spl-token');
    const mintPubkey = new PublicKey(mintAddress);
    
    // Create transaction to revoke freeze authority
    const transaction = new Transaction();
    
    // Create the setAuthority instruction to revoke freeze authority
    const instruction = createSetAuthorityInstruction(
      mintPubkey,          // account
      currentAuthority,    // current authority
      AuthorityType.FreezeAccount, // authority type
      null                 // new authority (null = revoke)
    );
    
    transaction.add(instruction);
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = currentAuthority;
    
    // Sign and send transaction
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    console.log('Freeze authority revoked. Signature:', signature);
    return signature;
  } catch (error) {
    console.error('Error revoking freeze authority:', error);
    throw new Error('Failed to revoke freeze authority: ' + (error as Error).message);
  }
}

/**
 * Revoke update authority for token metadata
 * WARNING: This action is IRREVERSIBLE! Once revoked, you cannot update the token metadata.
 */
export async function revokeUpdateAuthority(
  connection: Connection,
  mintAddress: string,
  currentAuthority: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const { SystemProgram } = await import('@solana/web3.js');
    const mintPubkey = new PublicKey(mintAddress);
    
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    const transaction = new Transaction();
    
    const updateAuthorityKeys = [
      { pubkey: metadataPDA, isSigner: false, isWritable: true },
      { pubkey: currentAuthority, isSigner: true, isWritable: false },
    ];
    
    const updateAuthorityData = Buffer.concat([
      Buffer.from([1]),
      Buffer.from([0]),
      Buffer.from([1]),
      Buffer.from(new PublicKey('11111111111111111111111111111111').toBuffer()),
      Buffer.from([0]),
    ]);
    
    const updateAuthorityInstruction = {
      keys: updateAuthorityKeys,
      programId: TOKEN_METADATA_PROGRAM_ID,
      data: updateAuthorityData,
    };
    
    transaction.add(updateAuthorityInstruction);
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = currentAuthority;
    
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    console.log('Update authority revoked. Signature:', signature);
    return signature;
  } catch (error) {
    console.error('Error revoking update authority:', error);
    throw new Error('Failed to revoke update authority: ' + (error as Error).message);
  }
}

/**
 * Check if the connected wallet is the authority for a token
 */
export function isWalletAuthority(
  walletAddress: string | null,
  authorityAddress: string | null
): boolean {
  if (!walletAddress || !authorityAddress) return false;
  return walletAddress === authorityAddress;
}
