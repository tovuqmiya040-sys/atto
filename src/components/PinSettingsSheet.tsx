import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PinDots, PinKeypad } from "@/components/PinKeypad";
import { usePin, PIN_LEN } from "@/context/pin-context";
import { toast } from "sonner";
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

type Mode = "set" | "change" | "remove";

type Step =
  | { kind: "old" }
  | { kind: "new" }
  | { kind: "confirm"; newPin: string };

export function PinSettingsSheet({
  open,
  onOpenChange,
  mode,
  onBack,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  onBack?: () => void;
}) {
  const { hasPin, setPin, changePin, removePin } = usePin();
  const [step, setStep] = useState<Step>(() =>
    mode === "set" ? { kind: "new" } : { kind: "old" },
  );
  const [value, setValue] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [shake, setShake] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Sheet ochilganda holatni tiklash
  useEffect(() => {
    if (open) {
      setStep(mode === "set" ? { kind: "new" } : { kind: "old" });
      setValue("");
      setOldPin("");
      setShake(false);
      setConfirmRemove(false);
    }
  }, [open, mode]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => {
      setValue("");
      setShake(false);
    }, 450);
  };

  // Toliq kiritilganda harakat
  useEffect(() => {
    if (value.length !== PIN_LEN) return;

    async function handleComplete() {
      if (step.kind === "old") {
        setOldPin(value);
        setValue("");
        if (mode === "change") {
          setStep({ kind: "new" });
        } else if (mode === "remove") {
          const ok = await removePin(value);
          if (ok) {
            toast.success("PIN o'chirildi");
            onOpenChange(false);
          } else {
            triggerShake();
            setOldPin("");
          }
        }
        return;
      }

      if (step.kind === "new") {
        const newPin = value;
        setValue("");
        setStep({ kind: "confirm", newPin });
        return;
      }

      if (step.kind === "confirm") {
        if (value !== step.newPin) {
          triggerShake();
          toast.error("PIN-kodlar mos kelmadi");
          return;
        }
        if (mode === "set") {
          await setPin(step.newPin);
          toast.success("PIN o'rnatildi");
          onOpenChange(false);
        } else if (mode === "change") {
          const ok = await changePin(oldPin, step.newPin);
          if (ok) {
            toast.success("PIN almashtirildi");
            onOpenChange(false);
          } else {
            triggerShake();
            toast.error("Eski PIN noto'g'ri");
            setStep({ kind: "old" });
            setOldPin("");
          }
        }
      }
    }
    handleComplete();
  }, [value, step, mode, oldPin, setPin, changePin, removePin, onOpenChange]);

  const onDigit = (d: string) =>
    setValue((p) => (p.length >= PIN_LEN ? p : p + d));
  const onDelete = () => setValue((p) => p.slice(0, -1));

  const titleMap: Record<Mode, string> = {
    set: "PIN-kod o'rnatish",
    change: "PIN-kodni almashtirish",
    remove: "PIN-kodni o'chirish",
  };

  const subtitle =
    step.kind === "old"
      ? "Joriy PIN-kodni kiriting"
      : step.kind === "new"
        ? "Yangi PIN-kodni kiriting"
        : "Yangi PIN-kodni qaytadan kiriting";

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v && mode === "remove" && hasPin && !confirmRemove) {
            // Userga ogohlantirishni ko'rsatmaymiz, oddiy yopish
          }
          onOpenChange(v);
        }}
      >
        <SheetContent
          side="right"
          className="h-full w-full border-none bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md"
        >
          <SheetHeader className="text-left">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  onOpenChange(false);
                  if (onBack) setTimeout(() => onBack(), 150);
                }}
                aria-label="Orqaga"
                className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <SheetTitle className="text-2xl font-bold">
                {titleMap[mode]}
              </SheetTitle>
            </div>
            <SheetDescription className="mt-1 text-muted-foreground">
              {subtitle}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 flex flex-col items-center gap-10">
            <PinDots length={value.length} total={PIN_LEN} shake={shake} />
            <div className="w-full max-w-xs">
              <PinKeypad onDigit={onDigit} onDelete={onDelete} />
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="mt-6 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
          >
            Bekor qilish
          </Button>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>PIN-kodni o'chirish?</AlertDialogTitle>
            <AlertDialogDescription>
              Ilova endi parolsiz ochiladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={() => setConfirmRemove(false)}>
              Davom etish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
