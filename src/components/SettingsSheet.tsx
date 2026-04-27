import { useState } from "react";
import { Plus, RotateCcw, X, Bus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCards } from "@/context/cards-context";
import { CardEditor } from "@/components/CardEditor";
import { useRoutes, normalisePlate } from "@/context/routes-context";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * "Sozlamalar" sheet — Menyu sahifasidan ochiladi.
 * Ichida:
 *  - Fake karta balansini boshqarish (CardEditor lar)
 *  - Reset tugmalari (sayr tarixi, to'ldirish tarixi, full reset)
 */
export function SettingsSheet({ open, onOpenChange }: Props) {
  const { cards, updateCard, addCard, removeCard, resetAll, resetTrips, resetTopups } =
    useCards();
  const { mappings, addMapping, removeMapping } = useRoutes();
  const [newPlate, setNewPlate] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [confirm, setConfirm] = useState<
    null | "all" | "trips" | "topups" | { kind: "card"; id: string }
  >(null);

  const handleAddCard = async () => {
    await addCard({
      label: `Yangi karta ${cards.length + 1}`,
      number: "9987 2200 0000 0000",
      balance: "0",
    });
    toast.success("Yangi karta qo'shildi");
  };

  const handleConfirmAction = async () => {
    if (!confirm) return;
    if (confirm === "all") await resetAll();
    else if (confirm === "trips") await resetTrips();
    else if (confirm === "topups") await resetTopups();
    else if (typeof confirm === "object" && confirm.kind === "card") {
      await removeCard(confirm.id);
    }
    setConfirm(null);
    toast.success("Ma'lumotlar tozalandi");
  };

  const handleAddMapping = async () => {
    const key = normalisePlate(newPlate);
    const route = newRoute.trim().toUpperCase().slice(0, 4);
    if (key.length < 6) {
      toast.error("Davlat raqamini to'liq kiriting (masalan: 01 445 GGF)");
      return;
    }
    if (!route) {
      toast.error("Marshrut raqamini kiriting");
      return;
    }
    if (mappings.some((m) => m.plateKey === key)) {
      toast.error("Bu raqam ro'yxatda bor");
      return;
    }
    await addMapping({
      plateKey: key,
      plateDisplay: newPlate.trim().toUpperCase(),
      route,
    });
    setNewPlate("");
    setNewRoute("");
    toast.success(`Marshrut № ${route} qo'shildi`);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[95vh] overflow-y-auto rounded-t-3xl border-border bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetTitle className="sr-only">Sozlamalar</SheetTitle>

          <div className="px-5 pt-5">
            <div className="relative pb-2">
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Yopish"
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold tracking-tight">Sozlamalar</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Karta balansi va ilova ma'lumotlarini boshqarish
              </p>
            </div>

            {/* Karta boshqaruv */}
            <div className="mt-6">
              <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kartalar (demo)
              </div>
              <div className="space-y-3">
                {cards.map((card) => (
                  <CardEditor
                    key={card.id}
                    card={card}
                    canRemove={cards.length > 1}
                    onSave={updateCard}
                    onRemove={(id) => setConfirm({ kind: "card", id })}
                  />
                ))}

                <Button
                  onClick={handleAddCard}
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi karta qo'shish
                </Button>
              </div>
            </div>

            {/* Marshrut bog'lash */}
            <div className="mt-6">
              <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Marshrutlar
              </div>
              <p className="mb-3 px-1 text-xs text-muted-foreground">
                Avtobusning davlat raqamiga marshrut raqamini bog'lang. QR
                skanerda shu avtobus aniqlansa, marshrut avtomatik o'rnatiladi.
              </p>

              <div className="space-y-2 rounded-3xl bg-surface p-3">
                {mappings.length === 0 && (
                  <div className="px-2 py-2 text-xs text-muted-foreground">
                    Hali bog'langan marshrut yo'q
                  </div>
                )}

                {mappings.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-2xl bg-surface-elevated px-3 py-2.5"
                  >
                    <Bus className="h-4 w-4 text-success" />
                    <div className="flex-1 leading-tight">
                      <div className="text-sm font-semibold">
                        {m.plateDisplay}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Marshrut № {m.route}
                      </div>
                    </div>
                    <button
                      onClick={async () => await removeMapping(m.id)}
                      aria-label="O'chirish"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 pt-1">
                  <Input
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="01 445 GGF"
                    className="h-11 rounded-xl bg-surface-elevated"
                  />
                  <Input
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value.toUpperCase())}
                    placeholder="87"
                    className="h-11 w-20 rounded-xl bg-surface-elevated text-center font-bold"
                    maxLength={4}
                  />
                  <Button
                    onClick={handleAddMapping}
                    className="h-11 rounded-xl"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Reset */}
            <div className="mt-6 space-y-2 rounded-3xl bg-surface p-4">
              <div className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reset
              </div>
              <ResetRow
                label="Avtobus to'lovlar tarixini tozalash"
                onClick={() => setConfirm("trips")}
              />
              <ResetRow
                label="Hisob to'ldirish tarixini tozalash"
                onClick={() => setConfirm("topups")}
              />
              <ResetRow
                label="Full reset — hammasini 0 qilish"
                destructive
                onClick={() => setConfirm("all")}
              />
            </div>

            <div className="h-4" />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "all"
                ? "Hammasini resetlash?"
                : confirm === "trips"
                  ? "Sayr tarixini tozalash?"
                  : confirm === "topups"
                    ? "To'ldirish tarixini tozalash?"
                    : "Kartani o'chirish?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "all"
                ? "Kartalar default holatga qaytadi, balans va barcha tarix o'chiriladi. Qaytarib bo'lmaydi."
                : confirm === "trips"
                  ? "Barcha QR to'lov yozuvlari o'chiriladi."
                  : confirm === "topups"
                    ? "Kartaga tushgan pullar tarixi o'chiriladi."
                    : "Tanlangan karta butunlay olib tashlanadi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Tasdiqlash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ResetRow({
  label,
  onClick,
  destructive,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-elevated ${
        destructive ? "text-destructive" : "text-foreground"
      }`}
    >
      <RotateCcw className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
