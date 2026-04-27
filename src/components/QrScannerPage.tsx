import { QrScanner } from "@/components/QrScanner";
import { Button } from "@/components/ui/button";

type QrScannerPageProps = {
  onScan: (text: string) => void;
  onClose: () => void;
};

export function QrScannerPage({ onScan, onClose }: QrScannerPageProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        <QrScanner active={true} onResult={onScan} />
        <div className="absolute bottom-8 left-1/2 w-full max-w-xs -translate-x-1/2 px-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-12 w-full rounded-2xl bg-white/20 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/30"
          >
            Bekor qilish
          </Button>
        </div>
      </div>
    </div>
  );
}
