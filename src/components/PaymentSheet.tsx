import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, Zap, ChevronDown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCards, type TripEntry } from "@/context/cards-context";
import { useRoutes } from "@/context/routes-context";
import { toast } from "sonner";
import { QrScanner } from "@/components/QrScanner";
import {
  parseAttoQr,
  generateReceiptNumber,
  formatPaidAt,
  formatTravelDate,
  formatNum,
} from "@/lib/atto";

type PaymentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the sheet opens directly in the success stage for this trip */
  replayTrip?: TripEntry | null;
};

const FARE = 1700;

type Stage = "scan" | "confirm" | "success";

export function PaymentSheet({
  open,
  onOpenChange,
  replayTrip,
}: PaymentSheetProps) {
  const { cards, activeIndex, setActiveIndex, chargeActive, addTrip } = useCards();
  const { defaultRoute, findRouteForQr } = useRoutes();
  const card = cards[activeIndex] ?? cards[0];
  const isReplay = !!replayTrip;

  const [stage, setStage] = useState<Stage>("scan");
  const [busPlate, setBusPlate] = useState("");
  const [qrPayload, setQrPayload] = useState("");

  const [route, setRoute] = useState("");
  const [editingRoute, setEditingRoute] = useState(false);
  const [routeDraft, setRouteDraft] = useState("");
  const [mode, setMode] = useState<"avtobus" | "metro">("avtobus");
  const [torchOn, setTorchOn] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [receipt, setReceipt] = useState("");
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(FARE);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const startPressClose = () => {
    longPressed.current = false;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setRouteDraft(route);
      setEditingRoute(true);
    }, 500);
  };
  const cancelPressClose = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };
  const handleCloseTap = () => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return;
    if (replayTrip) {
      setStage("success");
      setBusPlate(replayTrip.busPlate);
      setQrPayload(replayTrip.qrPayload);
      setRoute(replayTrip.route);
      setReceipt(replayTrip.receipt);
      setPaidAt(new Date(replayTrip.paidAt));
      setPaidAmount(replayTrip.amount);
      setEditingRoute(false);
    } else {
      setStage("scan");
      setEditingRoute(false);
      setBusPlate("");
      setQrPayload("");
      setRoute("");
      setRouteDraft("");
      setReceipt("");
      setPaidAt(null);
      setPaidAmount(FARE);
      setTorchOn(false);
      setMode("avtobus");
      setPickerOpen(false);
    }
  }, [open, replayTrip]);

  const handleScanResult = (text: string) => {
    try {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    } catch (e) {}

    const plate = parseAttoQr(text);
    if (!plate) {
      toast.error("Yaroqsiz QR kod");
      return;
    }
    setBusPlate(plate);
    setQrPayload(text);
    const mapped = findRouteForQr(text);
    const r =
      mapped ??
      (defaultRoute && defaultRoute.trim()
        ? defaultRoute.trim()
        : String(Math.floor(Math.random() * 90) + 10));
    setRoute(r);
    setRouteDraft(r);
    setStage("confirm");
  };

  const handleSaveRoute = () => {
    const v = routeDraft.trim();
    if (!v) {
      toast.error("Yo'nalish raqamini kiriting");
      return;
    }
    setRoute(v);
    setEditingRoute(false);
  };

  const handlePay = async () => {
    // THIS IS THE NEW LOGIC
    if (card && card.blocked) {
      toast.error("Karta bloklangan. Iltimos, avval kartani blokdan oching.");
      return;
    }

    const ok = await chargeActive(FARE);
    if (!ok) {
      toast.error("Balans yetarli emas");
      return;
    }
    const r = generateReceiptNumber();
    const now = new Date();
    setReceipt(r);
    setPaidAt(now);
    setPaidAmount(FARE);
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

  const frozenTime = useMemo(
    () => (paidAt ? formatPaidAt(paidAt) : ""),
    [paidAt],
  );
  const travelDate = paidAt ? formatTravelDate(paidAt) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[95vh] overflow-y-auto rounded-t-3xl border-border bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="sr-only">
          {stage === "scan"
            ? "QR skanerlash"
            : stage === "confirm"
              ? "QR to'lov"
              : "To'lov muvaffaqiyatli"}
        </SheetTitle>

        {stage === "scan" && (
          <div className="flex flex-col px-4 pt-3">
            <div className="mx-auto mt-2 flex w-full items-center gap-1 rounded-2xl bg-surface-elevated p-1.5 shadow-inner">
              <button
                onClick={() => setMode("avtobus")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black uppercase tracking-widest transition-all ${
                  mode === "avtobus"
                    ? "bg-white text-black shadow-lg scale-[1.02]"
                    : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${mode === 'avtobus' ? 'bg-success' : 'bg-muted'}`} />
                avtobus
              </button>
              <button
                onClick={() => setMode("metro")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black uppercase tracking-widest transition-all ${
                  mode === "metro"
                    ? "bg-white text-black shadow-lg scale-[1.02]"
                    : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${mode === 'metro' ? 'bg-info' : 'bg-muted'}`} />
                metro
              </button>
            </div>

            <div className="mt-5 text-center text-base font-medium text-foreground">
              QR-kodni skanerlang
            </div>

            <div className="mt-3">
              <QrScanner
                active={open && stage === "scan"}
                torch={torchOn}
                onResult={handleScanResult}
              />
            </div>

            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => {
                  setTorchOn((v) => !v);
                  toast(
                    torchOn ? "Chiroq o'chirildi" : "Chiroq yoqildi",
                  );
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
                  torchOn
                    ? "bg-warning text-warning-foreground"
                    : "bg-white text-black"
                }`}
                aria-label="Flash"
              >
                <Zap className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="mt-5 rounded-full bg-surface-elevated/70 p-2">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-full px-2 py-1 text-left"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-muted-foreground">
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
                  />
                </span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[10px] font-black text-white"
                  style={{
                    background:
                      "linear-gradient(135deg,#a78bfa,#22d3ee 50%,#34d399)",
                  }}
                >
                  ATTO
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold leading-tight">
                    {card.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    ••• {card.number.replace(/\D/g, "").slice(-4)}
                  </span>
                </span>
                <span className="pr-3 text-right">
                  <span className="text-base font-bold">{card.balance}</span>{" "}
                  <span className="text-xs uppercase text-muted-foreground">
                    uzs
                  </span>
                </span>
              </button>

              {pickerOpen && cards.length > 1 && (
                <ul className="mt-2 max-h-48 overflow-y-auto rounded-2xl bg-surface">
                  {cards.map((c, i) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setActiveIndex(i);
                          setPickerOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-accent ${
                          i === activeIndex
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span>{c.label}</span>
                        <span className="text-xs">
                          ••• {c.number.replace(/\D/g, "").slice(-4)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-12 rounded-2xl bg-surface-elevated text-sm font-semibold"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={() => toast("NFC to'lov vaqtinchalik mavjud emas")}
                className="h-12 rounded-2xl bg-info text-sm font-semibold text-info-foreground hover:bg-info/90"
              >
                NFC to'lov
              </Button>
            </div>

            <div className="h-2" />
          </div>
        )}

        {stage === "confirm" && (
          <div className="flex flex-col px-5 pt-5">
            <div className="relative flex items-center justify-center pb-4">
              <div className="text-base font-black tracking-tight">ATTO</div>

              <button
                onClick={handleCloseTap}
                onMouseDown={startPressClose}
                onMouseUp={cancelPressClose}
                onMouseLeave={cancelPressClose}
                onTouchStart={startPressClose}
                onTouchEnd={cancelPressClose}
                onTouchCancel={cancelPressClose}
                aria-label="Yopish"
                className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface-elevated/70 text-muted-foreground transition-colors hover:text-foreground active:scale-95"
              >
                <X className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl card-atto-bg p-4 text-white shadow-xl aspect-[1.8/1]"
            >
              <div className="absolute inset-0 card-pattern-atto pointer-events-none" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="text-xs font-bold opacity-80 uppercase tracking-widest">
                    {card.label}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black tracking-widest">
                      ATTO
                    </div>
                    <div
                      className="text-[8px] font-black tracking-[0.2em]"
                      style={{ color: card.blocked ? "#ef4444" : "#22c55e" }}
                    >
                      {card.blocked ? "BLOKLANGAN" : "VIRTUAL"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="font-mono text-2xl font-black tracking-[0.15em] text-white drop-shadow-md">
                    {card.number}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase opacity-60">Balans</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black">
                        {card.balance}
                      </span>
                      <span className="text-[8px] font-bold uppercase opacity-80">
                        uzs
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-12 rounded bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <div className="h-4 w-4 rounded-full bg-success/80 blur-[2px]" />
                  </div>
                </div>
              </div>
            </div>

            {cards.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {cards.map((c, i) => (
                  <button
                    key={c.id}
                    aria-label={`${c.label} karta`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex
                        ? "w-4 bg-foreground"
                        : "w-1.5 bg-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">To'lov</div>
            </div>
            <div className="mt-1 text-center text-2xl font-black tracking-tight">
              {formatNum(FARE)} UZS
            </div>

            <div className="mt-8 space-y-0">
              <div className="flex items-center justify-between border-b border-border/60 py-4">
                <span className="text-muted-foreground">Yo'nalish</span>
                {editingRoute ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      autoFocus
                      inputMode="numeric"
                      value={routeDraft}
                      onChange={(e) =>
                        setRouteDraft(
                          e.target.value.replace(/\D/g, "").slice(0, 3),
                        )
                      }
                      className="h-9 w-24 bg-surface text-right font-medium"
                    />
                    <button
                      onClick={handleSaveRoute}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-success text-success-foreground"
                      aria-label="Saqlash"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => {
                        setRouteDraft(route);
                        setEditingRoute(false);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground"
                      aria-label="Bekor qilish"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <span className="font-medium">Marshrut № {route}</span>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-border/60 py-4">
                <span className="text-muted-foreground">Dav. raqami</span>
                <span className="font-medium">{busPlate}</span>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <Button
                onClick={handlePay}
                className="h-14 w-full rounded-2xl bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
              >
                Sayr uchun to'lov
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-14 w-full rounded-2xl bg-surface-elevated text-base font-semibold text-foreground hover:bg-accent"
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-col px-5 pt-4">
            <div className="relative pb-2 pt-2 text-center">
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Yopish"
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-sm font-medium text-success">
                Sayr uchun to'lovingiz muvaffaqiyatli amalga oshirildi
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                To'lov vaqti
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                {frozenTime}
              </div>
            </div>

            <div className="mx-auto mt-6 rounded-3xl bg-white p-5">
              <QRCodeSVG
                value={qrPayload || "atto"}
                size={180}
                level="M"
                marginSize={0}
              />
            </div>

            <div className="mt-8 space-y-0">
              <Row label="Chek raqami" value={receipt} />
              <Row label="To'langan" value={`${formatNum(paidAmount)} UZS`} />
              <Row label="Sayohat sanasi" value={travelDate} />
              <Row label="Yo'nalish" value={route} />
              <Row label="Dav. raqami" value={busPlate} />
            </div>

            <div className="h-6" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
