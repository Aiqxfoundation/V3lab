import { Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletButtonProps {
  onConnect: (address: string) => void;
  address: string | null;
}

export function WalletButton({ onConnect, address }: WalletButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async (provider: string) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts[0]) {
          onConnect(accounts[0]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  if (address) {
    return (
      <Badge variant="secondary" className="px-4 h-9 font-mono" data-testid="badge-connected-wallet">
        <Check className="h-4 w-4 mr-2 text-success" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Badge>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent data-testid="dialog-wallet-providers">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose your preferred wallet provider to continue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto p-4 hover-elevate"
              onClick={() => handleConnect("metamask")}
              data-testid="button-provider-metamask"
            >
              <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">MetaMask</p>
                <p className="text-sm text-muted-foreground">
                  Connect with MetaMask browser extension
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto p-4 hover-elevate"
              onClick={() => handleConnect("walletconnect")}
              data-testid="button-provider-walletconnect"
            >
              <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">WalletConnect</p>
                <p className="text-sm text-muted-foreground">
                  Scan QR code with your mobile wallet
                </p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
