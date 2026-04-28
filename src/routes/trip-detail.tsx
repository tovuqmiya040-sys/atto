
import { useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCards, type TripEntry } from "@/context/cards-context";
import { formatNum, formatHM, formatTravelDate } from "@/lib/atto";
// Keyingi bosqichlar uchun vaqtinchalik o'chirilgan
// import { PaymentSheet } from "@/components/PaymentSheet";
// import { FiscalSheet } from "@/components/FiscalSheet"; // Buni yaratishimiz kerak bo'ladi

// TripDetailSheetdagi 'Field' komponenti
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export function TripDetailPage() {
  const { cards } = useCards();
  
  // Ma'lumotlarni URLdan olish (keyingi qadamda sozlaymiz)
  // Hozircha statik ma'lumotdan foydalanamiz
  const trip: TripEntry | null = {
      id: "trip_12345",
      cardId: "card_abc",
      cardLast4: "7635",
      amount: 1400,
      paidAt: new Date().toISOString(),
      route: "15",
      busPlate: "01 123 ABC",
      type: "bus"
  };

  const card = useMemo(
    () => (trip ? cards.find((c) => c.id === trip.cardId) ?? cards[0] : null),
    [trip, cards],
  );

  // Bu qism ham vaqtinchalik, deterministik ID generatori
  const details = {
    model: "MAN",
    ep: "EP0123456789",
    chek: "1234567890",
fiskal: "123456789012",
mxik: "10107001001000000",
stir: "123456789",
qqs: 150
  };

  if (!trip || !card || !details) {
    // Keyinchalik chiroyli "Loading" yoki "Not Found" sahifasi qo'shamiz
    return <div>Ma'lumotlar topilmadi.</div>;
  }

  const paidDate = new Date(trip.paidAt);
  const last4 = trip.cardLast4 || card.number.replace(/\D/g, "").slice(-4);

  return (
    <div className="flex h-full flex-col bg-background p-6 pt-12">
        <h1 className="text-2xl font-bold">Sayr tafsilotlari</h1>
        
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-6 pt-8">
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

        <div className="space-y-3 px-5 pt-8 pb-4">
            <Button
              // onClick={() => setQrOpen(true)} // Vaqtinchalik o'chirilgan
              className="h-14 w-full rounded-2xl bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
            >
              QR-kodni ko`rsatish
            </Button>
            <Button
              // onClick={() => setFiscalOpen(true)} // Vaqtinchalik o'chirilgan
              variant="ghost"
              className="h-14 w-full rounded-2xl bg-surface-elevated text-base font-semibold text-foreground"
            >
              Fiskal checkni ko`rsatish
            </Button>
        </div>
    </div>
  );
}
