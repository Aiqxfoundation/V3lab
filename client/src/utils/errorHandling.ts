import { toast } from '@/hooks/use-toast';

export class Web3Error extends Error {
  public code?: string | number;
  public data?: any;
  public originalError?: any;

  constructor(message: string, code?: string | number, data?: any, originalError?: any) {
    super(message);
    this.name = 'Web3Error';
    this.code = code;
    this.data = data;
    this.originalError = originalError;
  }
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
  retryable?: boolean;
  retryCallback?: () => Promise<void>;
}

const USER_FRIENDLY_MESSAGES: Record<string | number, string> = {
  // MetaMask errors
  4001: 'Transaction cancelled by user',
  4100: 'The requested account and/or method has not been authorized',
  4200: 'The requested method is not supported',
  4900: 'Provider is disconnected',
  4901: 'Provider is disconnected from all chains',
  '-32700': 'Invalid JSON was received',
  '-32600': 'The JSON sent is not a valid Request object',
  '-32601': 'The method does not exist or is not available',
  '-32602': 'Invalid method parameters',
  '-32603': 'Internal JSON-RPC error',
  '-32000': 'Invalid input',
  '-32001': 'Resource not found',
  '-32002': 'Resource unavailable',
  '-32003': 'Transaction rejected',
  '-32004': 'Method not supported',
  '-32005': 'Request limit exceeded',
  
  // Network errors
  'NETWORK_ERROR': 'Network connection issue. Please check your connection and try again.',
  'TIMEOUT': 'Request timed out. Please try again.',
  'INSUFFICIENT_FUNDS': 'Insufficient funds for this transaction',
  'NONCE_EXPIRED': 'Transaction nonce is too low. Please refresh and try again.',
  'REPLACEMENT_UNDERPRICED': 'Transaction fee too low. Please increase gas price.',
  'UNPREDICTABLE_GAS_LIMIT': 'Cannot estimate gas. The transaction may fail.',
  
  // Contract errors
  'CALL_EXCEPTION': 'Contract execution failed. Please check the transaction details.',
  'CONTRACT_NOT_DEPLOYED': 'Contract not found at this address',
  'INVALID_ARGUMENT': 'Invalid argument provided',
  'MISSING_ARGUMENT': 'Missing required argument',
  'UNEXPECTED_ARGUMENT': 'Too many arguments provided',
  'NUMERIC_FAULT': 'Numeric value out of safe range',
  
  // Wallet errors
  'WALLET_NOT_CONNECTED': 'Please connect your wallet first',
  'WRONG_NETWORK': 'Please switch to the correct network',
  'INSUFFICIENT_BALANCE': 'Insufficient balance for this transaction',
};

export function getErrorMessage(error: any): string {
  // Check for user-friendly message first
  if (error?.code && USER_FRIENDLY_MESSAGES[error.code]) {
    return USER_FRIENDLY_MESSAGES[error.code];
  }

  // Check for specific error reasons
  if (error?.reason) {
    return error.reason;
  }

  // Check for error message
  if (error?.message) {
    // Clean up technical messages
    let message = error.message;
    
    // Remove technical prefixes
    message = message.replace(/^Error: /, '');
    message = message.replace(/^MetaMask Tx Signature: /, '');
    message = message.replace(/^execution reverted: /, '');
    
    // Check if message contains known error patterns
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction and gas fees';
    }
    if (message.includes('nonce too low')) {
      return 'Transaction nonce conflict. Please refresh and try again.';
    }
    if (message.includes('gas required exceeds')) {
      return 'Transaction requires too much gas. Please check the transaction details.';
    }
    if (message.includes('user rejected')) {
      return 'Transaction cancelled by user';
    }
    
    return message;
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

export async function handleWeb3Error(
  error: any,
  options: ErrorHandlerOptions = {}
): Promise<void> {
  const {
    showToast = true,
    logToConsole = true,
    context = '',
    retryable = false,
    retryCallback,
  } = options;

  const message = getErrorMessage(error);
  const web3Error = new Web3Error(
    message,
    error?.code,
    error?.data,
    error
  );

  // Log to console for debugging
  if (logToConsole) {
    console.error(`[Web3 Error${context ? ` - ${context}` : ''}]:`, {
      message,
      code: error?.code,
      data: error?.data,
      originalError: error,
    });
  }

  // Show toast notification
  if (showToast) {
    const toastOptions: any = {
      title: 'Transaction Error',
      description: message,
      variant: 'destructive',
    };

    // Add retry button if retryable
    if (retryable && retryCallback) {
      toastOptions.action = {
        label: 'Retry',
        onClick: async () => {
          try {
            await retryCallback();
          } catch (retryError) {
            handleWeb3Error(retryError, { ...options, retryable: false });
          }
        },
      };
    }

    toast(toastOptions);
  }

  throw web3Error;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on user rejection
      if (error?.code === 4001) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export function isRetryableError(error: any): boolean {
  // User rejections should not be retried
  if (error?.code === 4001) return false;
  
  // Network errors are retryable
  if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') return true;
  
  // Nonce issues might be retryable
  if (error?.message?.includes('nonce')) return true;
  
  // Rate limiting is retryable
  if (error?.code === '-32005') return true;
  
  return false;
}

export class ErrorBoundary {
  private static handleError(error: Error, errorInfo?: any) {
    console.error('Error Boundary caught error:', error, errorInfo);
    
    // Send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
    
    // Show user-friendly error
    toast({
      title: 'Application Error',
      description: 'Something went wrong. Please refresh the page and try again.',
      variant: 'destructive',
    });
  }

  static logError(error: Error, context?: string) {
    this.handleError(error, { context });
  }
}