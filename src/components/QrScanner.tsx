
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

    const startScanner = async () => {
      try {
        // Check camera permission
        const permission = await BarcodeScanner.checkPermission({ force: true });
        
        if (!permission.granted) {
          throw new Error("Kameraga ruxsat berilmadi");
        }

        // Enable torch if requested (on supported devices)
        if (torch) {
          await BarcodeScanner.enableTorch().catch(() => {});
        } else {
          await BarcodeScanner.disableTorch().catch(() => {});
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
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
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

  // Fallback UI when not active or error
  if (!active) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-black">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
          <ScanLine className="h-12 w-12" />
          <span className="text-sm">Skaner tayyor</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-black">
      {/* Native scanner runs in full screen behind, this is overlay UI */}
      
      {/* Scan frame overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[65%] w-[65%]">
          {/* Corners */}
          <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-success shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-success shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-success shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-success shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          
          {/* Animated scanning line */}
          <div className="absolute left-0 top-0 h-1 w-full animate-scan-line bg-gradient-to-r from-transparent via-success to-transparent shadow-[0_0_15px_rgba(34,197,94,1)]" />
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
          QR-kodni ramka ichiga joylashtiring
        </span>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Kamera ishga tushirilmoqda…</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 px-6 text-center text-white">
          <CameraOff className="h-8 w-8" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!isSupported && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 px-6 text-center text-white">
          <CameraOff className="h-8 w-8" />
          <span className="text-sm">Native skaner qo'llab-quvvatlanmaydi</span>
        </div>
      )}
    </div>
  );
}
