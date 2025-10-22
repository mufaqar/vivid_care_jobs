import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallPrompt = () => {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 p-4 shadow-lg z-50 animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Download className="w-6 h-6 text-accent" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Install Vivid Care</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install our app for faster access and offline functionality
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              Install
            </Button>
            <Button 
              onClick={() => setDismissed(true)} 
              variant="outline" 
              size="sm"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
