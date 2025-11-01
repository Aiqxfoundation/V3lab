import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tokenCreationSchema, SUPPORTED_CHAINS, type ChainId } from "@shared/schema";
import { compileContract, getContractNameForType } from "./utils/contract-compiler";
import { deployTokenContract, estimateGasCost } from "./utils/deployer";
import { ethers } from "ethers";

async function handleTokenDeployment(req: any, res: any) {
    try {
      const validatedData = tokenCreationSchema.parse(req.body);
      const { deployerAddress } = req.body;

      if (!deployerAddress) {
        return res.status(400).json({ error: "Deployer address is required" });
      }

      // Handle EVM tokens - create record for client-side deployment
      if (validatedData.blockchainType === "EVM") {
        // Determine tokenType based on features - combine multiple features
        const features = [];
        if (validatedData.isMintable) features.push('mintable');
        if (validatedData.isBurnable) features.push('burnable');
        if (validatedData.isPausable) features.push('pausable');
        if (validatedData.isCapped) features.push('capped');
        if (validatedData.hasTax) features.push('taxable');
        if (validatedData.hasBlacklist) features.push('blacklist');
        
        const tokenType = features.length > 0 ? features.join('-') : 'standard';

        const token = await storage.createDeployedToken({
          name: validatedData.name,
          symbol: validatedData.symbol,
          decimals: validatedData.decimals,
          totalSupply: validatedData.totalSupply,
          tokenType,
          chainId: validatedData.chainId,
          deployerAddress,
          status: "pending",
          contractAddress: null,
          transactionHash: null,
          taxPercentage: validatedData.taxPercentage || null,
          treasuryWallet: validatedData.treasuryWallet || null,
          isMintable: validatedData.isMintable,
          isBurnable: validatedData.isBurnable,
          isPausable: validatedData.isPausable,
          isCapped: validatedData.isCapped,
          hasTax: validatedData.hasTax,
          hasBlacklist: validatedData.hasBlacklist,
          maxSupply: validatedData.maxSupply || null,
          logoUrl: validatedData.logoUrl || null,
          description: validatedData.description || null,
          mintAuthority: null,
          freezeAuthority: null,
          updateAuthority: null,
          deployedAt: null,
        });

        res.json(token);
      }
      // Handle Solana tokens - create record for client-side deployment
      else if (validatedData.blockchainType === "Solana") {
        const token = await storage.createDeployedToken({
          name: validatedData.name,
          symbol: validatedData.symbol,
          decimals: validatedData.decimals,
          totalSupply: validatedData.totalSupply,
          tokenType: 'standard', // Solana tokens are always standard SPL tokens
          chainId: validatedData.chainId,
          deployerAddress,
          status: "pending",
          contractAddress: null,
          transactionHash: null,
          taxPercentage: null,
          treasuryWallet: null,
          mintAuthority: validatedData.enableMintAuthority ? deployerAddress : null,
          freezeAuthority: validatedData.enableFreezeAuthority ? deployerAddress : null,
          updateAuthority: deployerAddress,
          logoUrl: validatedData.logoUrl || null,
          description: validatedData.description || null,
          deployedAt: null,
        });

        res.json(token);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/deploy", handleTokenDeployment);
  app.post("/api/tokens/deploy", handleTokenDeployment);

  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getDeployedTokens();
      res.json(tokens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const token = await storage.getDeployedTokenById(req.params.id);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json(token);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tokens/:id/status", async (req, res) => {
    try {
      const { status, contractAddress, transactionHash } = req.body;
      const token = await storage.updateDeployedToken(req.params.id, {
        status,
        contractAddress,
        transactionHash,
        deployedAt: status === "deployed" ? new Date() : undefined,
      });

      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }

      res.json(token);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts/compile/:tokenType", async (req, res) => {
    try {
      const { tokenType } = req.params;
      const { getContractCompilationArtifacts } = await import("./contracts/evmTokenTemplates");
      
      const contractVariant = tokenType === 'standard' ? 'standard' : 'advanced';
      const compiled = getContractCompilationArtifacts(contractVariant);
      
      res.json({
        abi: compiled.abi,
        bytecode: compiled.bytecode,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gas/estimate", async (req, res) => {
    try {
      const validatedData = tokenCreationSchema.parse(req.body);
      const { deployerAddress } = req.body;

      // Only EVM chains need gas estimation
      if (validatedData.blockchainType === "EVM") {
        // Determine tokenType based on combined features
        const features = [];
        if (validatedData.isMintable) features.push('mintable');
        if (validatedData.isBurnable) features.push('burnable');
        if (validatedData.isPausable) features.push('pausable');
        if (validatedData.isCapped) features.push('capped');
        if (validatedData.hasTax) features.push('taxable');
        if (validatedData.hasBlacklist) features.push('blacklist');
        
        const tokenType = features.length > 0 ? features.join('-') : 'standard';

        // Build constructor args - base args always needed
        const baseArgs = [
          validatedData.name,
          validatedData.symbol,
          validatedData.decimals,
          validatedData.totalSupply,
        ];
        
        // Add feature-specific args
        let constructorArgs = [...baseArgs];
        if (validatedData.isCapped && validatedData.maxSupply) {
          constructorArgs.push(validatedData.maxSupply);
        }
        if (validatedData.hasTax) {
          constructorArgs.push(validatedData.taxPercentage || 5);
          constructorArgs.push(validatedData.treasuryWallet || deployerAddress);
        }

        const estimate = await estimateGasCost(
          tokenType,
          constructorArgs,
          validatedData.chainId
        );

        res.json({
          gasLimit: estimate.gasLimit.toString(),
          gasPrice: estimate.gasPrice.toString(),
          estimatedCost: estimate.estimatedCost,
          symbol: SUPPORTED_CHAINS[validatedData.chainId].symbol,
        });
      } else {
        // Solana transactions have fixed rent-exempt costs
        res.json({
          estimatedCost: "0.002",
          symbol: "SOL",
          note: "Approximate cost for token creation + metadata",
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/upload-image", async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData || !imageData.startsWith('data:')) {
        return res.status(400).json({ error: "Invalid base64 image data" });
      }

      const PINATA_JWT = process.env.PINATA_JWT;
      if (!PINATA_JWT) {
        return res.status(500).json({ error: "PINATA_JWT not configured" });
      }

      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Invalid base64 data URI format" });
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const formData = new FormData();
      const fileName = `token-image-${Date.now()}.${contentType.split('/')[1] || 'png'}`;
      const blob = new Blob([buffer], { type: contentType });
      formData.append('file', blob, fileName);

      const pinataMetadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', pinataOptions);

      console.log('📤 Uploading image to Pinata...', { fileName, size: buffer.length });

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata upload error:', errorText);
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      console.log('✅ Image uploaded to Pinata:', imageUrl);

      res.json({
        imageUrl,
        ipfsHash: result.IpfsHash,
        contentType: contentType,
      });
    } catch (error: any) {
      console.error('Error uploading image to Pinata:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-metadata", async (req, res) => {
    try {
      const { name, symbol, description, imageUrl, socialLinks, imageContentType } = req.body;

      if (!name || !symbol) {
        return res.status(400).json({ error: "Name and symbol are required" });
      }

      const PINATA_JWT = process.env.PINATA_JWT;
      if (!PINATA_JWT) {
        return res.status(500).json({ error: "PINATA_JWT not configured" });
      }

      const metadata: any = {
        name,
        symbol,
        description: description || `${name} (${symbol}) Token`,
        image: imageUrl || '',
      };

      if (socialLinks?.website) {
        metadata.external_url = socialLinks.website;
      }

      if (socialLinks?.twitter || socialLinks?.telegram) {
        metadata.extensions = {};
        if (socialLinks.twitter) {
          metadata.extensions.twitter = socialLinks.twitter;
        }
        if (socialLinks.telegram) {
          metadata.extensions.telegram = socialLinks.telegram;
        }
      }

      if (imageUrl) {
        metadata.properties = {
          files: [
            {
              uri: imageUrl,
              type: imageContentType || 'image/png',
            }
          ],
          category: 'image',
        };
      }

      console.log('📤 Uploading metadata JSON to Pinata...', metadata);

      const data = JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${symbol}-metadata.json`,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      });

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata metadata upload error:', errorText);
        throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      console.log('✅ Metadata uploaded to Pinata:', metadataUri);

      res.json({
        metadataUri,
        ipfsHash: result.IpfsHash,
        metadata,
      });
    } catch (error: any) {
      console.error('Error uploading metadata to Pinata:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Secure Solana RPC Proxy - keeps Alchemy API key server-side
  app.post("/api/solana-rpc/:network", async (req, res) => {
    try {
      const { network } = req.params;
      const allowedNetworks = ['devnet', 'testnet', 'mainnet'];
      
      if (!allowedNetworks.includes(network)) {
        return res.status(400).json({ error: 'Invalid network' });
      }

      const apiKey = process.env.ALCHEMY_SOLANA_API_KEY;
      
      const publicRpcUrls: Record<string, string> = {
        'devnet': 'https://api.devnet.solana.com',
        'testnet': 'https://api.testnet.solana.com',
        'mainnet': 'https://api.mainnet-beta.solana.com',
      };
      
      let rpcUrl: string;
      
      if (!apiKey) {
        console.warn('ALCHEMY_SOLANA_API_KEY not configured, using public RPC');
        rpcUrl = publicRpcUrls[network];
      } else if (network === 'testnet') {
        console.warn('Alchemy does not support Solana testnet, using public RPC');
        rpcUrl = publicRpcUrls[network];
      } else {
        rpcUrl = `https://solana-${network}.g.alchemy.com/v2/${apiKey}`;
        console.log(`Using Alchemy RPC for ${network}`);
      }
      
      const rpcResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      if (!rpcResponse.ok) {
        const errorText = await rpcResponse.text();
        console.error(`RPC error (${rpcResponse.status}):`, errorText);
        throw new Error(`RPC request failed with status ${rpcResponse.status}`);
      }

      const data = await rpcResponse.json();
      res.json(data);
    } catch (error: any) {
      console.error('RPC proxy error:', error);
      res.status(500).json({ error: 'RPC request failed' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
