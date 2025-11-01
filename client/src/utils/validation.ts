import { ethers } from "ethers";
import { PublicKey } from "@solana/web3.js";

/**
 * Validation utilities for blockchain addresses and inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Ethereum/EVM address
 */
export function validateEvmAddress(address: string): ValidationResult {
  if (!address || address.trim() === "") {
    return { isValid: false, error: "Address is required" };
  }

  try {
    if (!ethers.isAddress(address)) {
      return { isValid: false, error: "Invalid Ethereum address format" };
    }

    // Check for zero address
    if (address.toLowerCase() === "0x0000000000000000000000000000000000000000") {
      return { isValid: false, error: "Cannot use zero address" };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid address format" };
  }
}

/**
 * Validate Solana address
 */
export function validateSolanaAddress(address: string): ValidationResult {
  if (!address || address.trim() === "") {
    return { isValid: false, error: "Address is required" };
  }

  try {
    new PublicKey(address);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid Solana address format" };
  }
}

/**
 * Validate address based on chain type
 */
export function validateAddress(address: string, chainType: 'evm' | 'solana'): ValidationResult {
  if (chainType === 'evm') {
    return validateEvmAddress(address);
  } else {
    return validateSolanaAddress(address);
  }
}

/**
 * Validate token name
 */
export function validateTokenName(name: string): ValidationResult {
  if (!name || name.trim() === "") {
    return { isValid: false, error: "Token name is required" };
  }

  if (name.length < 2) {
    return { isValid: false, error: "Token name must be at least 2 characters" };
  }

  if (name.length > 50) {
    return { isValid: false, error: "Token name must be less than 50 characters" };
  }

  // Check for valid characters (alphanumeric, spaces, and common symbols)
  const validNameRegex = /^[a-zA-Z0-9\s\-_\.]+$/;
  if (!validNameRegex.test(name)) {
    return { isValid: false, error: "Token name contains invalid characters" };
  }

  return { isValid: true };
}

/**
 * Validate token symbol
 */
export function validateTokenSymbol(symbol: string): ValidationResult {
  if (!symbol || symbol.trim() === "") {
    return { isValid: false, error: "Token symbol is required" };
  }

  if (symbol.length < 2) {
    return { isValid: false, error: "Token symbol must be at least 2 characters" };
  }

  if (symbol.length > 10) {
    return { isValid: false, error: "Token symbol must be less than 10 characters" };
  }

  // Symbols should be uppercase alphanumeric
  const validSymbolRegex = /^[A-Z0-9]+$/;
  if (!validSymbolRegex.test(symbol)) {
    return { isValid: false, error: "Token symbol must be uppercase letters and numbers only" };
  }

  return { isValid: true };
}

/**
 * Validate token supply
 */
export function validateTokenSupply(supply: string, decimals: number): ValidationResult {
  if (!supply || supply.trim() === "") {
    return { isValid: false, error: "Token supply is required" };
  }

  const supplyNum = parseFloat(supply);

  if (isNaN(supplyNum)) {
    return { isValid: false, error: "Token supply must be a valid number" };
  }

  if (supplyNum <= 0) {
    return { isValid: false, error: "Token supply must be greater than 0" };
  }

  // Check for reasonable maximum (1 quadrillion)
  if (supplyNum > 1e15) {
    return { isValid: false, error: "Token supply is too large" };
  }

  // Check decimal places don't exceed token decimals
  const decimalPlaces = (supply.split('.')[1] || '').length;
  if (decimalPlaces > decimals) {
    return { isValid: false, error: `Token supply cannot have more than ${decimals} decimal places` };
  }

  return { isValid: true };
}

/**
 * Validate token decimals
 */
export function validateTokenDecimals(decimals: number, chainType: 'evm' | 'solana'): ValidationResult {
  if (decimals === undefined || decimals === null) {
    return { isValid: false, error: "Decimals value is required" };
  }

  if (!Number.isInteger(decimals)) {
    return { isValid: false, error: "Decimals must be a whole number" };
  }

  if (decimals < 0) {
    return { isValid: false, error: "Decimals cannot be negative" };
  }

  if (chainType === 'evm' && decimals > 18) {
    return { isValid: false, error: "EVM tokens support maximum 18 decimals" };
  }

  if (chainType === 'solana' && decimals > 9) {
    return { isValid: false, error: "Solana tokens support maximum 9 decimals" };
  }

  return { isValid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, required: boolean = false): ValidationResult {
  if (!url || url.trim() === "") {
    if (required) {
      return { isValid: false, error: "URL is required" };
    }
    return { isValid: true }; // Optional URL
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: "URL must use HTTP or HTTPS protocol" };
    }
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate percentage value
 */
export function validatePercentage(value: number, min: number = 0, max: number = 100): ValidationResult {
  if (value === undefined || value === null) {
    return { isValid: false, error: "Percentage value is required" };
  }

  if (isNaN(value)) {
    return { isValid: false, error: "Percentage must be a valid number" };
  }

  if (value < min) {
    return { isValid: false, error: `Percentage must be at least ${min}%` };
  }

  if (value > max) {
    return { isValid: false, error: `Percentage cannot exceed ${max}%` };
  }

  return { isValid: true };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Validate and sanitize token metadata
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export function validateAndSanitizeMetadata(metadata: TokenMetadata): {
  isValid: boolean;
  sanitized?: TokenMetadata;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validate name
  const nameValidation = validateTokenName(metadata.name);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!);
  }

  // Validate symbol
  const symbolValidation = validateTokenSymbol(metadata.symbol);
  if (!symbolValidation.isValid) {
    errors.push(symbolValidation.error!);
  }

  // Validate URLs if provided
  if (metadata.website) {
    const websiteValidation = validateUrl(metadata.website);
    if (!websiteValidation.isValid) {
      errors.push(`Website: ${websiteValidation.error}`);
    }
  }

  if (metadata.twitter) {
    const twitterValidation = validateUrl(metadata.twitter);
    if (!twitterValidation.isValid) {
      errors.push(`Twitter: ${twitterValidation.error}`);
    }
  }

  if (metadata.telegram) {
    const telegramValidation = validateUrl(metadata.telegram);
    if (!telegramValidation.isValid) {
      errors.push(`Telegram: ${telegramValidation.error}`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize all string fields
  const sanitized: TokenMetadata = {
    name: sanitizeString(metadata.name),
    symbol: sanitizeString(metadata.symbol),
    description: metadata.description ? sanitizeString(metadata.description) : undefined,
    website: metadata.website ? sanitizeString(metadata.website) : undefined,
    twitter: metadata.twitter ? sanitizeString(metadata.twitter) : undefined,
    telegram: metadata.telegram ? sanitizeString(metadata.telegram) : undefined,
  };

  return { isValid: true, sanitized };
}

/**
 * Check if user has sufficient balance for transaction
 */
export async function checkSufficientBalance(
  provider: any,
  address: string,
  requiredAmount: bigint
): Promise<ValidationResult> {
  try {
    const balance = await provider.getBalance(address);
    
    if (balance < requiredAmount) {
      const balanceEth = ethers.formatEther(balance);
      const requiredEth = ethers.formatEther(requiredAmount);
      return {
        isValid: false,
        error: `Insufficient balance. You have ${balanceEth} ETH but need ${requiredEth} ETH`,
      };
    }

    return { isValid: true };
  } catch (error: any) {
    return {
      isValid: false,
      error: `Failed to check balance: ${error.message}`,
    };
  }
}

/**
 * Validate transaction parameters before submission
 */
export interface TransactionParams {
  to: string;
  value?: bigint;
  data?: string;
  gasLimit?: bigint;
}

export function validateTransactionParams(
  params: TransactionParams,
  chainType: 'evm' | 'solana'
): ValidationResult {
  // Validate recipient address
  const addressValidation = validateAddress(params.to, chainType);
  if (!addressValidation.isValid) {
    return addressValidation;
  }

  // Validate value if present
  if (params.value !== undefined) {
    if (params.value < 0n) {
      return { isValid: false, error: "Transaction value cannot be negative" };
    }
  }

  // Validate gas limit if present (EVM only)
  if (chainType === 'evm' && params.gasLimit !== undefined) {
    if (params.gasLimit < 21000n) {
      return { isValid: false, error: "Gas limit too low (minimum 21000)" };
    }

    if (params.gasLimit > 10000000n) {
      return { isValid: false, error: "Gas limit too high (maximum 10000000)" };
    }
  }

  return { isValid: true };
}
