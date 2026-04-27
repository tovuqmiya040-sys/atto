import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCards } from "@/context/cards-context";
import { useRoutes } from "@/context/routes-context";
import { QrScanner } from "@/components/QrScanner";
import { toast } from "sonner";
import {
  parseAttoQr,
  generateReceiptNumber,
  formatPaidAt,
  formatTravelDate,
  formatNum,
} from "@/lib/atto";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FARE = 1700;
type Stage = "scan" | "confirm" | "success";

/**
 * Transport sahifasidagi "QR to'lov" — soddalashtirilgan eski versiya.
 * ATTO Home dagi to'liq scanner bilan bir xil emas: rejim/chiroq/karta tanlash yo'q.
 */
export function LegacyPaymentSheet({ open, onOpenChange }: Props) {
  const { cards, activeIndex, chargeActive, addTrip } = useCards();
  const { defaultRoute, findRouteForQr } = useRoutes();
  const card = cards[activeIndex] ?? cards[0];

  const [stage, setStage] = useState<Stage>("scan");
  const [busPlate, setBusPlate] = useState("");
  const [qrPayload, setQrPayload] = useState("");
  const [route, setRoute] = useState("");
  const [receipt, setReceipt] = useState("");
  const [paidAt, setPaidAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) return;
    setStage("scan");
    setBusPlate("");
    setQrPayload("");
    setRoute("");
    setReceipt("");
    setPaidAt(null);
  }, [open]);

  const handleScan = (text: string) => {
    const plate = parseAttoQr(text);
    if (!plate) {
      toast.error("Yaroqsiz QR kod");
      return;
    }
    setBusPlate(plate);
    setQrPayload(text);
    const r =
      findRouteForQr(text) ??
      (defaultRoute && defaultRoute.trim()
        ? defaultRoute.trim()
        : String(Math.floor(Math.random() * 90) + 10));
    setRoute(r);
    setStage("confirm");
  };

  const handlePay = async () => {
    const ok = await chargeActive(FARE);
    if (!ok) {
      toast.error("Balans yetarli emas");
      return;
    }
    const r = generateReceiptNumber();
    const now = new Date();
    setReceipt(r);
    setPaidAt(now);
    setStage("success");
    await addTrip({
      receipt: r,
      route,
      busPlate,
      qrPayload,
      amount: FARE,
      paidAt: now.toISOString(),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="sr-only">QR to'lov</SheetTitle>

        {stage === "scan" && (
          <div className="px-5 pt-5">
            <div className="relative flex items-center justify-center pb-3">
              <h2 className="text-lg font-semibold tracking-tight">QR to'lov</h2>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Yopish"
                className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-center text-sm text-muted-foreground">
              Avtobusdagi QR-kodni skanerlang
            </p>
            <QrScanner active={open && stage === "scan"} onResult={handleScan} />
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
            >
              Bekor qilish
            </Button>
          </div>
        )}

        {stage === "confirm" && (
          <div className="px-5 pt-5">
            {/* ATTO virtual card */}
            <div className="relative overflow-hidden rounded-2xl card-atto-bg p-6 text-white shadow-xl aspect-[1.5/1]">
              {/* Pattern overlay */}
              <div className="absolute inset-0 card-pattern-atto pointer-events-none" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      {card.label}
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight">
                        {card.balance}
                      </span>
                      <span className="text-sm opacity-80 uppercase">
                        uzs
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold tracking-wide">
                      ATTO
                    </div>
                    <div
                      className="mt-1 text-[11px] font-extrabold tracking-[0.2em]"
                      style={{ color: "#22c55e" }}
                    >
                      VIRTUAL
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[1.05rem] tracking-[0.15em] text-white/25">
                  {card.number}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              To'lov
            </div>
            <div className="mt-1 text-center text-4xl font-bold tracking-tight">
              {formatNum(FARE)} UZS
            </div>

            <div className="mt-8 space-y-0">
              <div className="flex items-center justify-between border-b border-border/60 py-4">
                <span className="text-muted-foreground">Yo`nalish</span>
                <span className="font-medium">Маршрут № {route}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 py-4">
                <span className="text-muted-foreground">Dav. raqami</span>
                <span className="font-medium">{busPlate}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={handlePay}
                className="h-12 w-full rounded-2xl bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
              >
                Sayr uchun to'lov
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-12 w-full rounded-2xl bg-surface-elevated text-base font-semibold text-foreground"
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="px-5 pt-5 text-center">
            <div className="relative flex items-start justify-center pb-1">
              <div className="text-sm font-medium text-success">
                Sayr uchun to'lovingiz muvaffaqiyatli amalga oshirildi
              </div>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Yopish"
                className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">To'lov vaqti</div>
            <div className="mt-1 text-2xl font-bold tracking-tight">
              {paidAt ? formatPaidAt(paidAt) : ""}
            </div>

            <div className="mt-6 flex justify-center">
              <div className="rounded-3xl bg-white p-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    receipt,
                    amount: FARE,
                    route,
                    bus: busPlate,
                    paidAt: paidAt?.toISOString(),
                    qr: qrPayload,
                  })}
                  size={200}
                  level="M"
                />
              </div>
            </div>

            <div className="mt-6 space-y-0 text-left">
              <Row label="Chek raqami" value={receipt} />
              <Row label="To'langan" value={`${formatNum(FARE)} UZS`} />
              <Row
                label="Sayohat sanasi"
                value={paidAt ? formatTravelDate(paidAt) : ""}
              />
              <Row label="Yo'nalish" value={`Marshrut № ${route}`} />
              <Row label="Dav. raqami" value={busPlate} />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
