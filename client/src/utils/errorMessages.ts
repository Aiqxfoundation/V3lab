export function getWeb3ErrorMessage(error: any): string {
  const errorMessage = error?.message || error?.toString() || '';
  
  // User rejected
  if (error.code === 4001 || errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
    return 'Transaction was rejected. Please try again and approve the transaction in your wallet.';
  }
  
  // Insufficient funds
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('Insufficient balance')) {
    return 'Insufficient funds to complete this transaction. Please ensure you have enough tokens to cover the transaction and gas fees.';
  }
  
  // Network/RPC errors
  if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Wallet not connected
  if (errorMessage.includes('Wallet not connected') || errorMessage.includes('No provider')) {
    return 'Please connect your wallet first.';
  }
  
  // Wrong network
  if (errorMessage.includes('wrong network') || errorMessage.includes('chain') || errorMessage.includes('ChainId')) {
    return 'You are on the wrong network. Please switch to the correct network in your wallet.';
  }
  
  // Solana specific errors
  if (errorMessage.includes('blockhash not found')) {
    return 'Transaction expired. Please try again.';
  }
  
  if (errorMessage.includes('Attempt to debit an account but found no record')) {
    return 'Account not found or has no balance. Please ensure the account exists and has sufficient funds.';
  }
  
  if (errorMessage.includes('custom program error')) {
    return 'Smart contract error. The transaction failed validation. Please check your inputs and try again.';
  }
  
  // Authority errors
  if (errorMessage.includes('authority') || errorMessage.includes('owner')) {
    return 'You do not have the required authority to perform this action.';
  }
  
  // Generic fallback
  if (errorMessage.length > 100) {
    return 'Transaction failed. Please try again or contact support if the issue persists.';
  }
  
  return errorMessage || 'An unexpected error occurred. Please try again.';
}

export function getShortErrorMessage(error: any): string {
  const fullMessage = getWeb3ErrorMessage(error);
  return fullMessage.split('.')[0] + '.';
}
