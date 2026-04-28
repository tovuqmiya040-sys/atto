import { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { toast } from 'sonner';
import { Loader2, CameraOff } from 'lucide-react';

type QrScannerProps = {
  onResult: (text: string) => void;
  active: boolean;
  torch?: boolean;
};

export function QrScanner({ onResult, active, torch }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    const startScan = async () => {
      // Check permission
      await BarcodeScanner.checkPermission({ force: true });

      // make background of WebView transparent
      BarcodeScanner.hideBackground();
      document.body.style.backgroundColor = 'transparent';
      setLoading(true);
      setError(null);

      try {
        const result = await BarcodeScanner.startScan();

        if (result.hasContent) {
          onResult(result.content as string);
          // Vibrate on successful scan
          try {
            if (window.navigator.vibrate) {
              window.navigator.vibrate(100);
            }
          } catch {}
        }
      } catch (e: any) {
        console.error('Scanner error:', e);
        const msg = e?.message || 'Skanerlashda xatolik';
        if (msg.toLowerCase() !== 'user cancelled scanning') {
           setError(msg);
           toast.error(msg);
        }
      } finally {
         setLoading(false);
         stopScan(); // Ensure scan stops and background is restored
      }
    };

    const stopScan = () => {
        document.body.style.backgroundColor = '';
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
    };

    startScan();

    return () => {
      stopScan();
    };
  }, [active, onResult]);

  useEffect(() => {
    if (!active) return;

    if (torch) {
        BarcodeScanner.enableTorch();
    } else {
        BarcodeScanner.disableTorch();
    }
  }, [torch, active]);


  if (!active) {
    return null; // Don't render anything if not active
  }

  return (
    <div className="fixed inset-0 z-50 bg-transparent">
      {/* Scanner UI - This is mostly transparent to show the camera feed */}

      {/* Scan frame overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-3/4 w-3/4 max-w-sm max-h-sm">
          {/* Corners */}
          <div className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-white/90" />
          <div className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-white/90" />
          <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-white/90" />
          <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-white/90" />
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-black/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center text-white">
          <CameraOff className="h-8 w-8" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}