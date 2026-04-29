
import { Bus, TrainFront } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBus: () => void;
};

export function TransportQrSelectorSheet({ open, onOpenChange, onSelectBus }: Props) {
  const handleMetro = () => {
    toast.error("Xizmat vaqtinchalik mavjud emas");
  };

  const handleBus = () => {
    onOpenChange(false);
    setTimeout(() => onSelectBus(), 200);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[40vh] rounded-t-3xl border-border bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="sr-only">QR to'lov turini tanlash</SheetTitle>
        
        {/* Drag handle */}
        <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/20" />
        
        <div className="px-5 pt-4 pb-6">
          <h2 className="text-lg font-semibold text-center mb-6">
            Transport turini tanlang
          </h2>
          
          <div className="space-y-3">
            {/* Avtobus */}
            <button
              onClick={handleBus}
              className="flex w-full items-center gap-4 rounded-2xl bg-surface-elevated p-4 text-left transition-colors active:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
                <Bus className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">Avtobus</div>
                <div className="text-sm text-muted-foreground">QR kod orqali to'lov</div>
              </div>
            </button>
            
            {/* Metro */}
            <button
              onClick={handleMetro}
              className="flex w-full items-center gap-4 rounded-2xl bg-surface-elevated p-4 text-left transition-colors active:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info text-white">
                <TrainFront className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">Metro</div>
                <div className="text-sm text-muted-foreground">Vaqtinchalik mavjud emas</div>
              </div>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
