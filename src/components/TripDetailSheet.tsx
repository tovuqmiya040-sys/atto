import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCards, type TripEntry } from "@/context/cards-context";
import { formatNum, formatHM, formatTravelDate } from "@/lib/atto";
import { PaymentSheet } from "@/components/PaymentSheet";
import soliqLogo from "@/assets/soliq-logo.png";

type Props = {
  trip: TripEntry | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

/** Deterministik random generator (trip.id asosida) — ekran qayta ochilsa, qiymatlar o‘zgarmaydi. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1_000_000) / 1_000_000;
  };
}

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

export function TripDetailSheet({ trip, open, onOpenChange }: Props) {
  const { cards } = useCards();
  const [qrOpen, setQrOpen] = useState(false);
  const [fiscalOpen, setFiscalOpen] = useState(false);
  const [soliqBannerOpen, setSoliqBannerOpen] = useState(true);

  const card = useMemo(
    () => (trip ? cards.find((c) => c.id === trip.cardId) ?? cards[0] : null),
    [trip, cards],
  );

  const details = useMemo(() => {
    if (!trip) return null;
    const rnd = seeded(trip.id);
    const model = "MAN";
    const ep = "EP" + pad(Math.floor(rnd() * 1_000_000_000), 12);
    const chek = pad(Math.floor(rnd() * 9_000_000_000) + 1_000_000_000, 10);
    const fiskal = pad(Math.floor(rnd() * 900_000_000_000) + 100_000_000_000, 12);
    const mxik = "10107001001000000";
    const stir = pad(Math.floor(rnd() * 900_000_000) + 100_000_000, 9);
    const qqs = +(trip.amount * 0.12 / 1.12).toFixed(2);
    return { model, ep, chek, fiskal, mxik, stir, qqs };
  }, [trip]);

  if (!trip || !card || !details) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="hidden" />
      </Sheet>
    );
  }

  const paidDate = new Date(trip.paidAt);
  const last4 = trip.cardLast4 || card.number.replace(/\D/g, "").slice(-4);
  const fiscalQrValue = `${details.fiskal}|${details.chek}|${trip.amount}|${formatTravelDate(paidDate)}`;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetTitle className="sr-only">Sayr tafsilotlari</SheetTitle>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6 px-6 pt-8">
            <Field label="Yo`nalish" value={trip.route} />
            <Field label="Transport" value="Avtobus" />
            <Field label="Model" value={details.model} />
            <Field label="Dav. raqami" value={trip.busPlate} />
            <Field label="Sayr narxi" value={`${formatNum(trip.amount)} UZS`} />
            <Field label="Tarif" value="-" />
            <Field label="Karta" value={`****${last4}`} />
            <Field label="Nomi" value={card.label} />
            <Field
              label="Pul yechilgan vaqt"
              value={`${formatHM(paidDate)} / ${formatTravelDate(paidDate)}`}
            />
            <Field label="Status" value="To`langan" />
          </div>

          <div className="space-y-3 px-5 pt-8">
            <Button
              onClick={() => setQrOpen(true)}
              className="h-14 w-full rounded-2xl bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
            >
              QR-kodni ko`rsatish
            </Button>
            <Button
              onClick={() => setFiscalOpen(true)}
              variant="ghost"
              className="h-14 w-full rounded-2xl bg-surface-elevated text-base font-semibold text-foreground"
            >
              Fiskal checkni ko`rsatish
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* QR — mavjud PaymentSheet replay rejimi */}
      <PaymentSheet
        open={qrOpen}
        onOpenChange={setQrOpen}
        replayTrip={trip}
      />

      {/* Fiskal chek */}
      <Sheet open={fiscalOpen} onOpenChange={setFiscalOpen}>
        <SheetContent
          side="bottom"
          className="h-[100vh] max-h-[100vh] w-full overflow-y-auto rounded-none border-0 bg-white p-0 text-black"
        >
          <SheetTitle className="sr-only">Fiskal chek</SheetTitle>

          <div className="sticky top-0 z-10 flex items-center bg-[#0d1830] px-5 py-4 text-white">
            <button
              onClick={() => setFiscalOpen(false)}
              className="text-base font-semibold"
            >
              Yopish
            </button>
          </div>

          {soliqBannerOpen && (
            <div className="mx-3 mt-3 flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
              <button
                aria-label="Yopish"
                onClick={() => setSoliqBannerOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/50"
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
              </button>
              <img
                src={soliqLogo}
                alt="SOLIQ"
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                loading="lazy"
              />
              <div className="flex-1 leading-tight">
                <div className="text-2xl font-extrabold tracking-tight text-[#1a2a6c]">
                  SOLIQ
                </div>
                <div className="text-[13px] text-black/55">mobile ilovasi</div>
              </div>
              <button
                onClick={() => setSoliqBannerOpen(false)}
                className="rounded-full bg-[#1a2a6c] px-5 py-3 text-sm font-semibold text-white"
              >
                Yuklab olish
              </button>
            </div>
          )}

          <div className="px-5 pb-10 pt-8 text-[15px] leading-snug text-black">
            <div className="text-center">
              <div className="text-[15px] text-black/70">Savdo cheki/Sotuv</div>
              <div className="mt-1 text-[18px] font-bold tracking-tight">
                "AVTOMATLASHTIRILGAN TRANSPORT
                <br />
                TO`LOV TIZIMI OPERATORI" AJ
              </div>
              <div className="mt-1 text-[15px] text-black/80">
                Yuqori Sebzor MFY, Sebzor S17/18 dahasi, 52a-uy 306954304
              </div>
            </div>

            <div className="mt-4 space-y-0.5">
              <div>{details.ep}</div>
              <div>Chek raqami : {details.chek}</div>
              <div>Marketpleys nomi : ATTO</div>
              <div>
                {formatTravelDate(paidDate)}, {formatHM(paidDate)}
              </div>
            </div>

            <div className="mt-3 border-t border-dashed border-black/70" />

            <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-x-6 text-center text-[15px]">
              <div>Nomi</div>
              <div>Soni</div>
              <div>Narxi</div>
            </div>
            <div className="mt-1 border-b border-black/30" />

            <div className="mt-2 grid grid-cols-[1fr_auto_auto] items-baseline gap-x-6">
              <div className="text-left">Оплата за проезд</div>
              <div className="text-center">1</div>
              <div className="text-right">{formatNum(trip.amount)}.00</div>
            </div>

            <div className="mt-3 space-y-1 text-[13.5px]">
              <Line label="QQS qiymati" value={details.qqs.toFixed(2)} />
              <Line label="QQS foizi" value="12 %" />
              <Line label="Chegirma/Boshqa" value="0/0" />
              <Line label="Shtrix kodi" value="" />
              <Line label="MXIK kodi" value={details.mxik} />
              <div className="grid grid-cols-[auto_1fr] gap-3">
                <span className="text-black/80">MXIK nomi</span>
                <span className="text-right text-black/90">
                  Yo'lovchilarni jamoat transportida
                  <br />
                  tashish xizmati
                </span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-3">
                <span className="text-black/80">O'lchov birligi</span>
                <span className="text-right">odam (yo'lovchi) 1.0 odam</span>
              </div>
              <Line label="Markirovka kodi" value="" />
              <Line label="Komitent STIR/JSHSHIR" value={details.stir} />
            </div>

            <div className="mt-3 border-t border-dashed border-black/70" />

            <div className="mt-2 space-y-1 text-[15px]">
              <Line label="Naqd pul" value="0.00" />
              <Line label="Bank kartalari" value={`${formatNum(trip.amount)}.00`} />
              <Line label="Bank kartasi turi" value="Shaxsiy" />
            </div>

            <div className="mt-3 grid grid-cols-[auto_1fr] items-baseline gap-3">
              <span className="text-[28px] font-bold tracking-tight">
                Jami to`lov:
              </span>
              <span className="text-right text-[28px] font-bold tracking-tight">
                {formatNum(trip.amount)}.00
              </span>
            </div>

            <div className="mt-1 space-y-1 text-[15px]">
              <Line label="Umumiy QQS qiymati" value={details.qqs.toFixed(2)} />
              <Line label="Fiskal belgi" value={details.fiskal} />
            </div>

            <div className="mt-6 flex justify-center">
              <div className="rounded-md bg-white p-2">
                <QRCodeSVG value={fiscalQrValue} size={220} level="M" />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-black/70">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}