export interface IPFSUploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

export async function uploadToPinata(
  file: File | Blob,
  filename: string
): Promise<IPFSUploadResult> {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error(
      'Pinata API credentials not configured. Please add VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY to your .env file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file, filename);

  const pinataMetadata = JSON.stringify({
    name: filename,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${error}`);
  }

  const data = await response.json();

  return {
    ipfsHash: data.IpfsHash,
    ipfsUrl: `ipfs://${data.IpfsHash}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}

export async function uploadMetadataToPinata(
  metadata: TokenMetadata
): Promise<IPFSUploadResult> {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error(
      'Pinata API credentials not configured. Please add VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY to your .env file.'
    );
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.symbol} Token Metadata`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata metadata upload failed: ${error}`);
  }

  const data = await response.json();

  return {
    ipfsHash: data.IpfsHash,
    ipfsUrl: `ipfs://${data.IpfsHash}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}

export function convertImageToBlob(base64Image: string): Blob {
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export async function uploadLogoAndMetadata(
  metadata: TokenMetadata,
  logoBase64?: string
): Promise<{ metadataUrl: string; logoUrl?: string }> {
  let logoUrl: string | undefined;

  if (logoBase64 && logoBase64.startsWith('data:')) {
    const logoBlob = convertImageToBlob(logoBase64);
    const logoResult = await uploadToPinata(logoBlob, `${metadata.symbol}-logo.png`);
    logoUrl = logoResult.gatewayUrl;
  } else if (metadata.image) {
    logoUrl = metadata.image;
  }

  const fullMetadata = {
    ...metadata,
    image: logoUrl || metadata.image,
  };

  const metadataResult = await uploadMetadataToPinata(fullMetadata);

  return {
    metadataUrl: metadataResult.gatewayUrl,
    logoUrl,
  };
}

export const isPinataConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
  return !!(apiKey && secretKey);
};
