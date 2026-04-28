import { useState } from "react";
import { ChevronDown, Check, AlertCircle, CreditCard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCards } from "@/context/cards-context";

const CITIES = [
  "Toshkent shahri",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Namangan",
  "Farg'ona",
  "Xorazm",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Sirdaryo",
  "Navoiy",
  "Qoraqalpog'iston",
];

const AV_DAILY = [
  { days: 1, price: 7000 },
  { days: 5, price: 27000 },
  { days: 7, price: 34000 },
  { days: 10, price: 46000 },
  { days: 15, price: 65000 },
  { days: 20, price: 82000 },
  { days: 30, price: 110000 },
  { days: 90, price: 295000 },
  { days: 180, price: 530000 },
  { days: 365, price: 900000 },
];

const AVM_DAILY = [
  { days: 1, price: 8500 },
  { days: 5, price: 36000 },
  { days: 7, price: 45000 },
  { days: 10, price: 62000 },
  { days: 15, price: 88000 },
  { days: 20, price: 110000 },
  { days: 30, price: 150000 },
  { days: 90, price: 400000 },
  { days: 180, price: 720000 },
  { days: 365, price: 1250000 },
];

export function TariffSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cards } = useCards();
  const [city, setCity] = useState("Toshkent shahri");
  const [picker, setPicker] = useState(false);
  const [tab, setTab] = useState<"av" | "avm">("av");
  const [selectedTariff, setSelectedTariff] = useState<{
    title: string;
    price: string;
    type: string;
  } | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>(
    cards[0]?.id || "",
  );

  const handleBuy = (tariff: { title: string; price: string; type: string }) => {
    setSelectedTariff(tariff);
  };

  const confirmPurchase = () => {
    // Bu yerda sotib olish logikasi bo'ladi
    alert(
      `${selectedTariff?.title} (${selectedTariff?.type}) tarifi muvaffaqiyatli sotib olindi!`,
    );
    setSelectedTariff(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {!selectedTariff ? (
          <>
            <SheetHeader className="text-left">
              <SheetTitle>Tarif sotib olish</SheetTitle>
              <SheetDescription>
                Shahar va tarif turini tanlang
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4">
              <button
                onClick={() => setPicker((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl bg-surface-elevated p-4 text-left shadow-sm"
              >
                <span className="text-sm font-semibold">{city}</span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${picker ? "rotate-180" : ""}`}
                />
              </button>

              {picker && (
                <ul className="mt-2 max-h-48 overflow-y-auto rounded-2xl bg-surface-elevated shadow-inner">
                  {CITIES.map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => {
                          setCity(c);
                          setPicker(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-accent"
                      >
                        <span>{c}</span>
                        {c === city && (
                          <Check className="h-4 w-4 text-success" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Warning Message */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm font-medium leading-relaxed">
                <span className="font-bold">Diqqat!</span> Tariflar faqat{" "}
                {city.endsWith("shahri") ? city : `${city} shahrida`} amal
                qiladi.
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-surface-elevated p-1">
              <button
                onClick={() => setTab("av")}
                className={`rounded-xl py-3 text-sm font-bold transition-all ${
                  tab === "av"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Avtobus
              </button>
              <button
                onClick={() => setTab("avm")}
                className={`rounded-xl py-3 text-sm font-bold transition-all ${
                  tab === "avm"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Avtobus va Metro
              </button>
            </div>

            {/* Monthly Tariffs */}
            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Oylik tariflar
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TariffCard
                  title="Aprel"
                  price={tab === "av" ? "160 000" : "221 000"}
                  type={tab === "av" ? "AV" : "AVM"}
                  onClick={() =>
                    handleBuy({
                      title: "Aprel",
                      price: tab === "av" ? "160 000" : "221 000",
                      type: tab === "av" ? "AV" : "AVM",
                    })
                  }
                />
                <TariffCard
                  title="May"
                  price={tab === "av" ? "160 000" : "221 000"}
                  type={tab === "av" ? "AV" : "AVM"}
                  onClick={() =>
                    handleBuy({
                      title: "May",
                      price: tab === "av" ? "160 000" : "221 000",
                      type: tab === "av" ? "AV" : "AVM",
                    })
                  }
                />
              </div>
            </div>

            {/* Daily Tariffs */}
            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Kunlik tariflar
              </div>
              <div className="grid grid-cols-2 gap-3 pb-4">
                {(tab === "av" ? AV_DAILY : AVM_DAILY).map((t) => {
                  const p = t.price.toLocaleString("ru-RU").replace(",", " ");
                  const type = tab === "av" ? "AV" : "AVM";
                  return (
                    <TariffCard
                      key={t.days}
                      title={`${t.days} kun`}
                      price={p}
                      type={type}
                      onClick={() =>
                        handleBuy({ title: `${t.days} kun`, price: p, type })
                      }
                    />
                  );
                })}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="mt-2 h-14 w-full rounded-2xl bg-surface-elevated text-base font-bold text-brand"
            >
              Yopish
            </Button>
          </>
        ) : (
          <div className="space-y-6 pt-2">
            <SheetHeader className="text-left">
              <SheetTitle>Sotib olishni tasdiqlang</SheetTitle>
              <SheetDescription>
                Tanlangan tarif: {selectedTariff.title} ({selectedTariff.type})
              </SheetDescription>
            </SheetHeader>

            <div className="rounded-2xl bg-brand/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  To'lov summasi:
                </span>
                <span className="text-lg font-bold text-brand">
                  {selectedTariff.price} UZS
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">To'lov kartasini tanlang:</div>
              <div className="space-y-2">
                {cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                      selectedCardId === c.id
                        ? "border-brand bg-brand/5"
                        : "border-transparent bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold">{c.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.number}
                        </div>
                      </div>
                    </div>
                    {selectedCardId === c.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedTariff(null)}
                className="h-14 rounded-2xl bg-surface-elevated text-base font-bold"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={confirmPurchase}
                className="h-14 rounded-2xl bg-brand text-base font-bold text-white shadow-lg shadow-brand/20"
              >
                Sotib olish
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TariffCard({
  title,
  price,
  type,
  onClick,
}: {
  title: string;
  price: string;
  type: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl bg-surface-elevated p-3.5 text-left transition-transform active:scale-[0.98]"
    >
      <div className="text-xs font-semibold text-muted-foreground">{title}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-black tracking-tight">{price}</span>
        <span className="text-[10px] font-bold text-muted-foreground">UZS</span>
      </div>
      <div className="mt-2 inline-flex items-center rounded-md bg-brand/15 px-2 py-1 text-[11px] font-black uppercase tracking-wider text-brand">
        {type}
      </div>
    </button>
  );
}

export function NfcSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>NFC to'lov</SheetTitle>
        </SheetHeader>
        <div className="mt-4 rounded-2xl border border-border/60 bg-surface-elevated/50 p-6 text-center text-sm font-medium text-muted-foreground">
          NFC to'lov vaqtinchalik mavjud emas
        </div>
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export function TopupCardSheet({
  open,
  onOpenChange,
  cardId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Karta hisobini to'ldirish</SheetTitle>
          <SheetDescription>
            Quyidagi karta raqamiga to'lov qiling
          </SheetDescription>
        </SheetHeader>

        <CardNumbers cardId={cardId} />

        <div className="mt-5 rounded-2xl bg-surface-elevated p-4 text-sm leading-relaxed text-muted-foreground">
          Click, Payme yoki bankomatlar orqali shu karta raqamiga to'lov qiling.
          To'lov bir necha daqiqa ichida balansga tushadi.
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

function CardNumbers({ cardId }: { cardId?: string }) {
  const { cards } = useCards();
  const list = cardId ? cards.filter((c) => c.id === cardId) : cards;
  return (
    <div className="mt-4 space-y-2">
      {list.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-2xl bg-surface-elevated p-3 border border-border/40"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {c.label}
            </span>
            <div className="text-sm font-bold tracking-[0.05em] font-mono text-foreground">
              {c.number}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-success">
              {c.balance}
            </div>
            <div className="text-[7px] font-bold text-muted-foreground uppercase leading-none">
              uzs
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
