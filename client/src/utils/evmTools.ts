import { ethers } from 'ethers';

// ERC20 ABI for token operations
export const ERC20_ADVANCED_ABI = [
  // View functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function owner() view returns (address)',
  'function paused() view returns (bool)',
  'function isMintable() view returns (bool)',
  'function isBurnable() view returns (bool)',
  'function isPausable() view returns (bool)',
  'function hasBlacklist() view returns (bool)',
  'function blacklisted(address account) view returns (bool)',
  'function mintingRevoked() view returns (bool)',
  'function pausingRevoked() view returns (bool)',
  'function blacklistingRevoked() view returns (bool)',
  
  // Mint functions
  'function mint(address to, uint256 value) returns (bool)',
  
  // Burn functions
  'function burn(uint256 value) returns (bool)',
  
  // Pause functions
  'function pause()',
  'function unpause()',
  
  // Blacklist functions
  'function blacklistAddress(address account)',
  'function unblacklistAddress(address account)',
  
  // Authority revocation
  'function revokeMinting()',
  'function revokePausing()',
  'function revokeBlacklisting()',
  
  // Ownership functions
  'function transferOwnership(address newOwner)',
  'function renounceOwnership()',
  
  // Events
  'event Mint(address indexed to, uint256 value)',
  'event Burn(address indexed from, uint256 value)',
  'event Paused(address indexed account)',
  'event Unpaused(address indexed account)',
  'event Blacklisted(address indexed account)',
  'event Unblacklisted(address indexed account)',
  'event MintingRevoked()',
  'event PausingRevoked()',
  'event BlacklistingRevoked()',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
];

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  paused: boolean;
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  hasBlacklist: boolean;
  mintingRevoked: boolean;
  pausingRevoked: boolean;
  blacklistingRevoked: boolean;
}

export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, provider);
  
  const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
    contract.owner(),
  ]);
  
  // Try to get advanced features (may fail for standard tokens)
  let paused = false, isMintable = false, isBurnable = false, isPausable = false, hasBlacklist = false;
  let mintingRevoked = false, pausingRevoked = false, blacklistingRevoked = false;
  
  try {
    paused = await contract.paused();
    isMintable = await contract.isMintable();
    isBurnable = await contract.isBurnable();
    isPausable = await contract.isPausable();
    hasBlacklist = await contract.hasBlacklist();
    mintingRevoked = await contract.mintingRevoked();
    pausingRevoked = await contract.pausingRevoked();
    blacklistingRevoked = await contract.blacklistingRevoked();
  } catch (error) {
    console.log('Token does not support advanced features');
  }
  
  return {
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: ethers.formatUnits(totalSupply, decimals),
    owner,
    paused,
    isMintable,
    isBurnable,
    isPausable,
    hasBlacklist,
    mintingRevoked,
    pausingRevoked,
    blacklistingRevoked,
  };
}

export async function mintTokens(
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  // Get token decimals and scale amount
  const decimals = await contract.decimals();
  const scaledAmount = ethers.parseUnits(amount, decimals);
  
  const tx = await contract.mint(toAddress, scaledAmount);
  await tx.wait();
  
  return tx.hash;
}

export async function burnTokens(
  tokenAddress: string,
  amount: string
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  // Get token decimals and scale amount
  const decimals = await contract.decimals();
  const scaledAmount = ethers.parseUnits(amount, decimals);
  
  const tx = await contract.burn(scaledAmount);
  await tx.wait();
  
  return tx.hash;
}

export async function pauseToken(tokenAddress: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.pause();
  await tx.wait();
  
  return tx.hash;
}

export async function unpauseToken(tokenAddress: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.unpause();
  await tx.wait();
  
  return tx.hash;
}

export async function blacklistAddress(
  tokenAddress: string,
  address: string
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.blacklistAddress(address);
  await tx.wait();
  
  return tx.hash;
}

export async function unblacklistAddress(
  tokenAddress: string,
  address: string
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.unblacklistAddress(address);
  await tx.wait();
  
  return tx.hash;
}

export async function revokeMinting(tokenAddress: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.revokeMinting();
  await tx.wait();
  
  return tx.hash;
}

export async function revokePausing(tokenAddress: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.revokePausing();
  await tx.wait();
  
  return tx.hash;
}

export async function revokeBlacklisting(tokenAddress: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.revokeBlacklisting();
  await tx.wait();
  
  return tx.hash;
}

export async function transferOwnership(
  tokenAddress: string,
  newOwner: string
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.transferOwnership(newOwner);
  await tx.wait();
  
  return tx.hash;
}

export async function renounceOwnership(tokenAddress: string): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ADVANCED_ABI, signer);
  
  const tx = await contract.renounceOwnership();
  await tx.wait();
  
  return tx.hash;
}
