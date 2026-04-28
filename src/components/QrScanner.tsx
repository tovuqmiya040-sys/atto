
import { useEffect, useState } from "react";
import { Loader2, CameraOff, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "../lib/barcode-scanner";

type QrScannerProps = {
  onResult: (text: string) => void;
  active: boolean;
  torch?: boolean;
};

export function QrScanner({ onResult, active, torch }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if running in native Capacitor environment
    const checkSupport = async () => {
      try {
        const result = await BarcodeScanner.isSupported();
        setIsSupported(result.supported);
      } catch {
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);

  useEffect(() => {
    if (!active) {
      // Stop scanner when not active
      BarcodeScanner.stopScan().catch(() => {});
      return;
    }

    if (!isSupported) {
      setError("Native skaner qo'llab-quvvatlanmaydi");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Hide body and prepare for scan
    BarcodeScanner.hideBackground();

    const startScanner = async () => {
      try {
        // Check camera permission
        const permission = await BarcodeScanner.checkPermission({ force: true });

        if (!permission.granted) {
          throw new Error("Kameraga ruxsat berilmadi");
        }

        // Start scanning
        const result = await BarcodeScanner.startScan({
          targetedFormats: ['QR_CODE'],
        });

        if (!isMounted) return;

        if (result.hasContent) {
          // Vibrate on successful scan
          try {
            if (window.navigator.vibrate) {
              window.navigator.vibrate(100);
            }
          } catch {}

          onResult(result.content);
        }
      } catch (e: any) {
        console.error("Native scanner error:", e);
        if (isMounted) {
          const msg = e?.message || "Kamera ishga tushirishda xatolik";
          if (msg !== 'scan canceled') {
            setError(msg);
            toast.error(msg);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // Show background again if scan is done or errored
          BarcodeScanner.showBackground();
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      // Ensure background is shown and scanner stops when component unmounts
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan().catch(() => {});
    };
  }, [active, onResult, isSupported]);

  // Handle torch toggle
  useEffect(() => {
    if (!active) return;

    if (torch) {
      BarcodeScanner.enableTorch().catch(() => {});
    } else {
      BarcodeScanner.disableTorch().catch(() => {});
    }
  }, [torch, active]);

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-transparent">
      {/* Scan frame overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          {/* Corners */}
          <div className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-white/90" />
          <div className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-white/90" />
          <div className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-white/90" />
          <div className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-white/90" />
        </div>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
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
