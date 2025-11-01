import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, type ChainId } from '@shared/schema';

export interface EvmDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
}

export interface TokenFeatures {
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  isCapped: boolean;
  hasTax: boolean;
  hasBlacklist?: boolean;
  maxSupply?: string;
  taxPercentage?: number;
  treasuryWallet?: string;
}

export async function deployEvmToken(
  name: string,
  symbol: string,
  decimals: number,
  totalSupply: string,
  chainId: ChainId,
  features: TokenFeatures
): Promise<EvmDeploymentResult> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  
  const targetChainId = SUPPORTED_CHAINS[chainId].chainId;
  if (Number(network.chainId) !== targetChainId) {
    throw new Error(`Please switch to ${SUPPORTED_CHAINS[chainId].name} in your wallet`);
  }

  // Determine contract type based on features
  const contractType = determineContractType(features);
  
  const response = await fetch(`/api/contracts/compile/${contractType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch contract compilation');
  }
  
  const { abi, bytecode } = await response.json();

  // Build constructor arguments based on features
  const constructorArgs = buildConstructorArgs(
    name,
    symbol,
    decimals,
    totalSupply,
    features,
    await signer.getAddress()
  );

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...constructorArgs);
  
  await contract.waitForDeployment();
  
  const deploymentTx = contract.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error('Deployment transaction not found');
  }

  const receipt = await deploymentTx.wait();
  if (!receipt) {
    throw new Error('Transaction receipt not found');
  }

  return {
    contractAddress: await contract.getAddress(),
    transactionHash: deploymentTx.hash,
    blockNumber: receipt.blockNumber,
  };
}

function determineContractType(features: TokenFeatures): string {
  // Use advanced contract for any features
  const hasAnyFeature = features.isMintable || features.isBurnable || 
                        features.isPausable || features.isCapped || 
                        features.hasTax || features.hasBlacklist;
  
  return hasAnyFeature ? 'advanced' : 'standard';
}

function buildConstructorArgs(
  name: string,
  symbol: string,
  decimals: number,
  totalSupply: string,
  features: TokenFeatures,
  signerAddress: string
): any[] {
  const contractType = determineContractType(features);
  
  // Advanced contract constructor args
  if (contractType === 'advanced') {
    // Scale supply values: contract expects PRE-SCALED values (already multiplied by 10^decimals)
    const scaledSupply = ethers.parseUnits(totalSupply, decimals);
    const scaledMaxSupply = features.maxSupply 
      ? ethers.parseUnits(features.maxSupply, decimals)
      : BigInt(0);
    
    return [
      name,
      symbol,
      decimals,
      scaledSupply, // PRE-SCALED initial supply
      features.isMintable,
      features.isBurnable,
      features.isPausable,
      features.isCapped,
      features.hasTax,
      features.hasBlacklist || false,
      scaledMaxSupply, // PRE-SCALED max supply (or 0)
      features.taxPercentage || 0,
      features.treasuryWallet || signerAddress,
    ];
  }
  
  // Standard contract constructor args (also expects scaled values)
  const scaledSupply = ethers.parseUnits(totalSupply, decimals);
  return [name, symbol, decimals, scaledSupply];
}
