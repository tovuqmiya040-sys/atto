
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { QrScanner } from "@/components/QrScanner";
import { Button } from "@/components/ui/button";

type QrScannerPageProps = {
  onScan: (text: string) => void;
  onClose: () => void;
};

export function QrScannerPage({ onScan, onClose }: QrScannerPageProps) {
  const [torch, setTorch] = useState(false);

  // Stop body scrolling when scanner is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" data-scanner-page>
      {/* Header */}
      <div className="pt-12 text-center">
        <h1 className="text-xl font-bold text-white">QR to'lov</h1>
        <p className="mt-1 text-sm text-green-400">
          Kamerani QR-kodga qarating
        </p>
      </div>

      {/* Scanner Viewport */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        <div 
          className="relative"
          style={{ 
            width: "min(75vw, 400px)",
            height: "min(75vw, 400px)",
          }}
        >
          <QrScanner active={true} onResult={onScan} torch={torch} />
        </div>
      </div>
      
      {/* Controls */}
      <div className="pb-12 flex flex-col items-center gap-8">
        {/* Torch Button */}
        <Button
          variant={torch ? "default" : "outline"}
          onClick={() => setTorch(!torch)}
          className="h-16 w-16 rounded-full border-2 bg-primary/80 text-white backdrop-blur-sm"
          style={{
            backgroundColor: torch ? '#6366f1' : 'rgba(99, 102, 241, 0.4)',
            borderColor: 'rgba(99, 102, 241, 0.8)',
          }}
        >
          <Zap className="h-7 w-7" />
        </Button>

        {/* Cancel Button */}
        <div className="w-full max-w-sm px-6">
           <Button
            variant="ghost"
            onClick={onClose}
            className="h-14 w-full rounded-xl bg-white/10 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20"
          >
            Bekor qilish
          </Button>
        </div>
      </div>
    </div>
  );
}
