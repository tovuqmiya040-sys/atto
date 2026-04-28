import { useState } from "react";
import { ArrowLeft, Lock, KeyRound, ShieldOff, ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight } from "lucide-react";
import { usePin } from "@/context/pin-context";
import { PinSettingsSheet } from "@/components/PinSettingsSheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Orqaga tugmasi bosilganda chaqiriladi (asosiy Menyu ga qaytish uchun) */
  onBack?: () => void;
};

/**
 * "Xavfsizlik" sahifasi — PIN-kod boshqaruvi.
 * Menyu sheetidagi Xavfsizlik qatori bosilganda ochiladi.
 */
export function SecuritySheet({ open, onOpenChange, onBack }: Props) {
  const [pinSheet, setPinSheet] = useState<null | "set" | "change" | "remove">(
    null,
  );
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { hasPin, lock } = usePin();

  const openPin = (m: "set" | "change" | "remove") => {
    onOpenChange(false);
    setTimeout(() => setPinSheet(m), 200);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="h-full w-full border-none bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md"
        >
          <SheetHeader className="text-left">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => onBack(), 150);
                  }}
                  className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
                  aria-label="Orqaga"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <SheetTitle className="text-2xl font-bold">Xavfsizlik</SheetTitle>
            </div>
            <SheetDescription className="text-muted-foreground">
              Ilovani PIN-kod bilan himoyalash
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-2">
            {!hasPin && (
              <Row
                icon={<Lock className="h-5 w-5" />}
                title="PIN-kod o'rnatish"
                subtitle="Ilovani 4-xonali kod bilan himoyalash"
                onClick={() => openPin("set")}
              />
            )}

            {hasPin && (
              <>
                <Row
                  icon={<KeyRound className="h-5 w-5" />}
                  title="PIN-kodni almashtirish"
                  subtitle="Eski PIN orqali yangisini o'rnatish"
                  onClick={() => openPin("change")}
                />
                <Row
                  icon={<ShieldOff className="h-5 w-5" />}
                  title="PIN-kodni o'chirish"
                  subtitle="Ilova parolsiz ochiladi"
                  destructive
                  onClick={() => setConfirmRemove(true)}
                />
                <Row
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Hozir qulflash"
                  subtitle="Ilovani PIN ekraniga o'tkazish"
                  onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => lock(), 150);
                  }}
                />
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {pinSheet && (
        <PinSettingsSheet
          open={!!pinSheet}
          mode={pinSheet}
          onOpenChange={(v) => !v && setPinSheet(null)}
          onBack={() => onOpenChange(true)}
        />
      )}

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>PIN-kodni o'chirish?</AlertDialogTitle>
            <AlertDialogDescription>
              Davom etish uchun joriy PIN-kodingizni kiritishingiz kerak bo'ladi.
              Tasdiqlangach ilova endi parolsiz ochiladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmRemove(false);
                openPin("remove");
              }}
            >
              Davom etish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-surface-elevated p-4 text-left transition-colors hover:bg-accent"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          destructive
            ? "bg-destructive/15 text-destructive"
            : "bg-brand/15 text-brand"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div
          className={`text-sm font-semibold ${destructive ? "text-destructive" : "text-foreground"}`}
        >
          {title}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
