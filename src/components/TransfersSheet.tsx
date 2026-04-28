import { useEffect, useState } from "react";
import { ArrowDownUp, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCards } from "@/context/cards-context";
import { toast } from "sonner";

function parseBalance(s: string) {
  return parseInt(s.replace(/\D/g, ""), 10) || 0;
}
function formatBalance(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function TransfersSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { cards, addCard, updateCard } = useCards();
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) return;
    if (cards.length >= 2) {
      setFromId(cards[0].id);
      setToId(cards[1].id);
    } else if (cards.length === 1) {
      setFromId(cards[0].id);
      setToId("");
    }
    setAmount("");
  }, [open, cards]);

  if (cards.length < 2) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-left">
            <SheetTitle>O'tkazmalar</SheetTitle>
          </SheetHeader>
          <div className="mt-4 rounded-2xl bg-surface-elevated p-5 text-center text-sm text-muted-foreground">
            O'tkazma qilish uchun kamida 2 ta karta kerak.
          </div>
          <Button
            onClick={async () => {
              const last4 = String(Math.floor(1000 + Math.random() * 9000));
              await addCard({
                label: `Karta ${cards.length + 1}`,
                number: `9987 2200 0025 ${last4}`,
                balance: "0",
              });
              toast.success("Yangi karta qo'shildi");
            }}
            className="mt-4 h-12 w-full rounded-2xl text-base font-semibold"
          >
            <Plus className="mr-1 h-4 w-4" />
            Karta qo'shish
          </Button>
        </SheetContent>
      </Sheet>
    );
  }

  const from = cards.find((c) => c.id === fromId);
  const to = cards.find((c) => c.id === toId);

  const handleTransfer = async () => {
    if (!from || !to) return;
    if (from.id === to.id) {
      toast.error("Bir xil kartaga o'tkazib bo'lmaydi");
      return;
    }
    const value = parseBalance(amount);
    if (value <= 0) {
      toast.error("Summani kiriting");
      return;
    }
    const fromBal = parseBalance(from.balance);
    if (fromBal < value) {
      toast.error("Balans yetarli emas");
      return;
    }
    const toBal = parseBalance(to.balance);
    await updateCard(from.id, { balance: formatBalance(fromBal - value) });
    await updateCard(to.id, { balance: formatBalance(toBal + value) });
    toast.success(`${formatBalance(value)} so'm o'tkazildi`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>O'tkazmalar</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <CardSelect
            label="Qaysi kartadan"
            cards={cards}
            value={fromId}
            onChange={setFromId}
          />
          <div className="flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-muted-foreground">
              <ArrowDownUp className="h-4 w-4" />
            </div>
          </div>
          <CardSelect
            label="Qaysi kartaga"
            cards={cards}
            value={toId}
            onChange={setToId}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Summa (UZS)
            </label>
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                setAmount(
                  digits ? formatBalance(parseInt(digits, 10)) : "",
                );
              }}
              placeholder="0"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
            />
          </div>

          <Button
            onClick={handleTransfer}
            className="h-12 w-full rounded-2xl text-base font-semibold"
          >
            O'tkazish
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CardSelect({
  label,
  cards,
  value,
  onChange,
}: {
  label: string;
  cards: { id: string; label: string; number: string; balance: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-colors ${
              value === c.id
                ? "border-success bg-success/10"
                : "border-border bg-surface-elevated"
            }`}
          >
            <div>
              <div className="text-sm font-semibold text-foreground">
                {c.label}
              </div>
              <div className="text-xs text-muted-foreground">
                ••• {c.number.slice(-4)}
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {c.balance} <span className="text-xs text-muted-foreground">uzs</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
