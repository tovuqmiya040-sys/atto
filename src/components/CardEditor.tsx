import { useState } from "react";
import { CreditCard, Wallet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Card as CardT } from "@/context/cards-context";
import { toast } from "sonner";

export function CardEditor({
  card,
  canRemove,
  onSave,
  onRemove,
}: {
  card: CardT;
  canRemove: boolean;
  onSave: (
    id: string,
    patch: Partial<{ label: string; number: string; balance: string }>,
  ) => void;
  onRemove: (id: string) => void;
}) {
  const [label, setLabel] = useState(card.label);
  const [number, setNumber] = useState(card.number);
  const [balance, setBalance] = useState(card.balance);

  const handleSave = () => {
    const cleanedNumber = number.trim();
    const cleanedBalance = balance.trim();
    if (!label.trim() || !cleanedNumber || !cleanedBalance) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    onSave(card.id, {
      label: label.trim(),
      number: cleanedNumber,
      balance: cleanedBalance,
    });
    toast.success("Karta yangilandi");
  };

  const handleNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const grouped = digits.match(/.{1,4}/g)?.join(" ") ?? digits;
    setNumber(grouped);
  };

  const handleBalanceChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    if (!digits) {
      setBalance("");
      return;
    }
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    setBalance(formatted);
  };

  return (
    <div className="rounded-2xl bg-surface-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-foreground">
            {card.label}
          </div>
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(card.id)}
            aria-label="Kartani o'chirish"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`label-${card.id}`} className="text-xs">
            Karta nomi
          </Label>
          <Input
            id={`label-${card.id}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="bg-surface"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`number-${card.id}`} className="text-xs">
            Karta raqami
          </Label>
          <Input
            id={`number-${card.id}`}
            inputMode="numeric"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="9987 2200 0025 4127"
            className="bg-surface font-mono tracking-wider"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`balance-${card.id}`} className="text-xs">
            Balans (UZS)
          </Label>
          <div className="relative">
            <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`balance-${card.id}`}
              inputMode="numeric"
              value={balance}
              onChange={(e) => handleBalanceChange(e.target.value)}
              placeholder="9 783"
              className="bg-surface pl-9"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" size="sm">
          Saqlash
        </Button>
      </div>
    </div>
  );
}
