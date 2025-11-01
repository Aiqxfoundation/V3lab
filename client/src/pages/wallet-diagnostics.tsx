import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function WalletDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const checkWallets = () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        isInIframe: window.self !== window.top,
        windowProperties: {},
        evmWallets: {},
        solanaWallets: {},
      };

      // Check all window properties
      const relevantProps = [
        'ethereum', 'okxwallet', 'okex', 'bitkeep', 'BinanceChain',
        'solana', 'phantom', 'solflare', 'backpack'
      ];

      relevantProps.forEach(prop => {
        results.windowProperties[prop] = !!(window as any)[prop];
      });

      // EVM wallet details
      if ((window as any).ethereum) {
        results.evmWallets.ethereum = {
          exists: true,
          isMetaMask: !!(window as any).ethereum.isMetaMask,
          isCoinbaseWallet: !!(window as any).ethereum.isCoinbaseWallet,
          isTrust: !!(window as any).ethereum.isTrust,
          isOkxWallet: !!(window as any).ethereum.isOkxWallet,
          chainId: (window as any).ethereum.chainId,
        };
      }

      if ((window as any).okxwallet) {
        results.evmWallets.okxwallet = {
          exists: true,
          type: typeof (window as any).okxwallet,
        };
      }

      // Solana wallet details
      if ((window as any).solana) {
        results.solanaWallets.solana = {
          exists: true,
          isPhantom: !!(window as any).solana.isPhantom,
          publicKey: (window as any).solana.publicKey?.toString() || null,
        };
      }

      if ((window as any).okxwallet?.solana) {
        results.solanaWallets.okxSolana = {
          exists: true,
        };
      }

      setDiagnostics(results);
      console.log('[Wallet Diagnostics] Full Report:', results);
    };

    checkWallets();
    
    // Re-check every 2 seconds
    const interval = setInterval(checkWallets, 2000);
    return () => clearInterval(interval);
  }, []);

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wallet Detection Diagnostics</h1>
        <p className="text-muted-foreground">
          Debug page to check which wallets are detected by the application
        </p>
      </div>

      {diagnostics.isInIframe && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-yellow-500">Important: Running in Iframe</CardTitle>
            </div>
            <CardDescription>
              This app is running inside Replit's iframe. Browser wallet extensions (MetaMask, OKX, etc.) 
              <strong> will NOT work</strong> in iframes due to security restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold">To test wallet detection properly:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click the "Open in new tab" button in Replit's webview (↗️ icon)</li>
              <li>Or copy the URL and open it in a new browser tab</li>
              <li>Make sure your wallet extension is installed and unlocked</li>
              <li>Refresh this diagnostics page in the new tab</li>
            </ol>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Environment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Running in iframe:</span>
            <Badge variant={diagnostics.isInIframe ? 'destructive' : 'default'}>
              {diagnostics.isInIframe ? 'Yes (Extensions blocked)' : 'No (Extensions allowed)'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <p>User Agent: {diagnostics.userAgent}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Window Properties Detection</CardTitle>
          <CardDescription>Checking if wallet objects exist on window</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {diagnostics.windowProperties && Object.entries(diagnostics.windowProperties).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <StatusIcon condition={value as boolean} />
                <span className="text-sm font-mono">window.{key}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EVM Wallets (Ethereum/BSC)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(diagnostics.evmWallets || {}).length === 0 ? (
            <p className="text-sm text-muted-foreground">No EVM wallets detected</p>
          ) : (
            Object.entries(diagnostics.evmWallets).map(([key, details]: [string, any]) => (
              <div key={key} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">{key}</span>
                </div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solana Wallets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(diagnostics.solanaWallets || {}).length === 0 ? (
            <p className="text-sm text-muted-foreground">No Solana wallets detected</p>
          ) : (
            Object.entries(diagnostics.solanaWallets).map(([key, details]: [string, any]) => (
              <div key={key} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">{key}</span>
                </div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full Diagnostics Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
