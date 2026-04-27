import { ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { type TopupEntry } from "@/context/cards-context";
import { formatHM, formatISODate, formatNum } from "@/lib/atto";

type Props = {
  entry: TopupEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TopupDetailSheet({ entry, open, onOpenChange }: Props) {
  if (!entry) return null;
  const d = new Date(entry.at);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="sr-only">Tranzaksiya tafsilotlari</SheetTitle>

        {/* Header row — collapse chevron */}
        <div className="-mt-1 mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
            <ChevronDown className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold">paynet</div>
            <div className="text-xs text-muted-foreground">
              {formatHM(d)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">
              {formatNum(Math.abs(entry.amount))}
            </span>{" "}
            <span className="text-xs uppercase text-muted-foreground">uzs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 pt-2">
          <Field label="Turi" value="paynet" />
          <Field label="Karta" value={`****${entry.cardLast4}`} />
          <Field
            label="Summa"
            value={`${formatNum(Math.abs(entry.amount))} UZS`}
          />
          <Field
            label="So'ngi balans"
            value={`${formatNum(entry.newBalance)} UZS`}
          />
          <Field label="Sana" value={formatISODate(d)} />
          <Field label="To'lov vaqti" value={formatHM(d)} />
          <Field
            label="Oldingi balans"
            value={`${formatNum(entry.previousBalance)} UZS`}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-bold">{value}</div>
    </div>
  );
}
