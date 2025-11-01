import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Chrome, Download, Shield, Wallet } from "lucide-react";

interface MetaMaskInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MetaMaskInstallModal({ isOpen, onClose }: MetaMaskInstallModalProps) {
  const handleInstallClick = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-metamask-install">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-orange-500" />
            </div>
            MetaMask Not Detected
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            To interact with blockchain networks, you need a Web3 wallet like MetaMask.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Installation Steps */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-3 text-sm">Quick Installation Guide</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Install the Extension</p>
                  <p className="text-xs text-muted-foreground">
                    Click the button below to install MetaMask for your browser
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Create or Import Wallet</p>
                  <p className="text-xs text-muted-foreground">
                    Set up a new wallet or import an existing one using your seed phrase
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Refresh & Connect</p>
                  <p className="text-xs text-muted-foreground">
                    After installation, refresh this page and connect your wallet
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Browser Compatibility */}
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Chrome className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Browser Compatibility</p>
                <p className="text-xs text-muted-foreground mt-1">
                  MetaMask works best with Chrome, Firefox, Brave, and Edge browsers
                </p>
              </div>
            </div>
          </Card>

          {/* Security Note */}
          <Card className="p-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-500">Security Reminder</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Never share your seed phrase with anyone. MetaMask will never ask for it.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleInstallClick}
              className="flex-1 gap-2"
              data-testid="button-install-metamask"
            >
              <Download className="h-4 w-4" />
              Install MetaMask
              <ExternalLink className="h-3 w-3 opacity-50" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-install"
            >
              I'll Do It Later
            </Button>
          </div>

          {/* Alternative Options */}
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Already have MetaMask? Try{" "}
              <button 
                onClick={() => window.location.reload()} 
                className="text-primary hover:underline"
              >
                refreshing the page
              </button>
              {" "}or using a different browser
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}