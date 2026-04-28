
import { useEffect, useState } from "react";
import { CameraOff } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";

type QrScannerProps = {
  onResult: (text: string) => void;
  active: boolean;
  torch?: boolean;
};

export function QrScanner({ onResult, active, torch }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        // Check permission before making UI changes
        const permission = await BarcodeScanner.checkPermission({ force: true });
        if (!permission.granted) {
          throw new Error("Kameraga ruxsat berilmadi");
        }

        // Prepare UI for scanning
        document.body.classList.add('scanner-active');
        await BarcodeScanner.hideBackground(); 
        setError(null);

        // Start scanning
        const result = await BarcodeScanner.startScan({});

        // Cleanup UI immediately after scan
        document.body.classList.remove('scanner-active');
        await BarcodeScanner.showBackground();

        if (isMounted && result.hasContent) {
          try {
            if (window.navigator.vibrate) {
              window.navigator.vibrate(100);
            }
          } catch {}
          
          onResult(result.content);
        }

      } catch (e: any) {
        document.body.classList.remove('scanner-active');
        BarcodeScanner.showBackground();

        if (isMounted) {
          const msg = e.message || "Skanerlashda xatolik yuz berdi";
          // "Scan canceled" is a normal event, not an error
          if (e.name !== 'SCAN_CANCELED') {
            setError(msg);
            toast.error(msg);
          }
        }
      }
    };

    startScanner();

    // Cleanup function when the component unmounts or `active` becomes false
    return () => {
      isMounted = false;
      document.body.classList.remove('scanner-active');
      BarcodeScanner.stopScan();
      BarcodeScanner.showBackground();
    };
  }, [active, onResult]);

  // Handle torch state
  useEffect(() => {
    if (!active) return;
    
    const toggleTorch = async () => {
        try {
            if (torch) {
                await BarcodeScanner.enableTorch();
            } else {
                await BarcodeScanner.disableTorch();
            }
        } catch (e) {
            console.error("Fonar xatosi", e);
        }
    };

    toggleTorch();
  }, [torch, active]);

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-transparent">
      {/* Static scan frame overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          {/* Corners */}
          <div className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-white/90" />
          <div className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-white/90" />
          <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-white/90" />
          <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-white/90" />
        </div>
      </div>

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center text-white">
          <CameraOff className="h-8 w-8" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
