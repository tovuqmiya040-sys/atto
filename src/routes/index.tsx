import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TransportHeader } from "@/components/TransportHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { BiometricRow } from "@/components/BiometricRow";
import { ActionGrid } from "@/components/ActionGrid";
import { BottomNav } from "@/components/BottomNav";
import { TripsHistory } from "@/components/TripsHistory";
import { AttoHome } from "@/components/AttoHome";
import { MyCardsPage } from "@/components/MyCardsPage";
import { MainMenuPage } from "@/components/MainMenuPage";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { useCards, type Card } from "@/context/cards-context";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TopupCardSheet } from "@/components/ExtraSheets";
import { toast } from "sonner";
import { formatNum } from "@/lib/atto";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ATTO — Transport karta va to'lovlar" },
      {
        name: "description",
        content:
          "ATTO transport kartangiz balansi, QR to'lovlar va sayr tarixi — bitta ilovada.",
      },
      { property: "og:title", content: "ATTO — Transport karta va to'lovlar" },
      {
        property: "og:description",
        content:
          "ATTO transport kartangiz balansi, QR to'lovlar va sayr tarixi — bitta ilovada.",
      },
    ],
  }),
});

// Virtual karta uchun raqam generatsiya qilish (9987 + 12 ta tasodifiy raqam)
const generateCardNumber = () => {
  let number = '9987';
  for (let i = 0; i < 12; i++) {
    if (i % 4 === 0) number += ' ';
    number += Math.floor(Math.random() * 10);
  }
  return number.trim();
};


function AddNewCardView() {
  const { cards, addCard } = useCards();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [virtualSheetOpen, setVirtualSheetOpen] = useState(false);
  const [topupSheetOpen, setTopupSheetOpen] = useState(false);

  const [topupCardNumber, setTopupCardNumber] = useState("");
  const cardToTopup = cards.find(c => c.number.replace(/\s/g, '') === topupCardNumber.replace(/\s/g, '')) || (topupCardNumber.length === 19 ? 'not_found' : null);

  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardLabel, setNewCardLabel] = useState("");
  const [newVirtualCardLabel, setNewVirtualCardLabel] = useState("");

  const handleAddVirtualCard = async () => {
    const label = newVirtualCardLabel.trim();
    if (!label) { toast.error("Iltimos, karta nomini kiriting."); return; }
    await addCard({ label, number: generateCardNumber(), balance: "0", type: 'virtual' });
    toast.success(`'${label}' virtual kartasi muvaffaqiyatli yaratildi!`);
    setVirtualSheetOpen(false);
    setNewVirtualCardLabel("");
  };

  const handleAddCard = async () => {
    const number = newCardNumber.replace(/\s/g, '');
    const expiry = newCardExpiry.replace(/\//g, '');
    const label = newCardLabel.trim();

    if (number.length !== 16) { toast.error("Karta raqami 16 xonali bo'lishi kerak."); return; }
    if (expiry.length !== 4) { toast.error("Amal qilish muddati (OY/YIL) to'liq kiritilishi kerak."); return; }
    if (!label) { toast.error("Karta nomini kiriting."); return; }

    // TALABGA BINOAN: Jismoniy karta qo'shish o'rniga xatolik chiqarish
    toast.error("HUMO va UZCARD kartalarini qo'shish vaqtinchalik ishlamayapti", {
      description: "Keyinroq qayta urinib ko'ring"
    });
    
    setAddSheetOpen(false);
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardLabel("");
  };
  
  const openAddCardSheet = () => setAddSheetOpen(true);

  return {
    openAddCardSheet,
    render: (
      <div className="px-5 space-y-4">
        <Button onClick={() => setVirtualSheetOpen(true)} className="h-14 w-full rounded-2xl bg-success text-base font-semibold text-success-foreground">Virtual karta yaratish</Button>
        <div className="pt-4 text-center">
            <h3 className="text-lg font-semibold">ATTO kartasini to'ldirish</h3>
            <p className="mt-1 text-sm text-muted-foreground">Kartani ilovaga qo'shmasdan ham to'ldirishingiz mumkin</p>
        </div>
        <div className="relative">
            <Input type="tel" inputMode="numeric" placeholder="Transport karta raqami" value={topupCardNumber} onChange={(e) => { const value = e.target.value.replace(/[^0-9]/g, ''); setTopupCardNumber(value.slice(0,16).replace(/(.{4})/g, '$1 ').trim()); }} className="h-14 rounded-xl bg-surface pl-5 pr-12 text-base font-mono tracking-wider" />
        </div>
        {cardToTopup === 'not_found' && <p className="text-sm text-destructive text-center font-medium">Karta topilmadi</p>}
        {cardToTopup && cardToTopup !== 'not_found' && (
            <div className="rounded-xl bg-surface p-4 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-base">{cardToTopup.label}</p>
                    <p className="text-sm text-muted-foreground">Balans: {formatNum(cardToTopup.balance)} UZS</p>
                </div>
                <Button onClick={() => setTopupSheetOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold">To'ldirish</Button>
            </div>
        )}

        <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}><SheetContent side="bottom" className="z-[200]"><SheetHeader><SheetTitle>Yangi karta qo'shish</SheetTitle></SheetHeader><div className="mt-4 space-y-4"><Input value={newCardLabel} onChange={e => setNewCardLabel(e.target.value)} placeholder="Karta nomi (masalan, Ish kartam)" className="h-12" /><Input value={newCardNumber} onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setNewCardNumber(v.slice(0,16).replace(/(.{4})/g, '$1 ').trim()); }} placeholder="Karta raqami" inputMode="numeric" className="h-12 font-mono tracking-wider" /><Input value={newCardExpiry} onChange={e => { let v = e.target.value.replace(/[^0-9]/g, ''); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); setNewCardExpiry(v); }} placeholder="Amal qilish muddati (OO/YY)" inputMode="numeric" className="h-12" /><Button onClick={handleAddCard} className="h-12 w-full font-semibold">Qo'shish</Button></div></SheetContent></Sheet>
        <Sheet open={virtualSheetOpen} onOpenChange={setVirtualSheetOpen}><SheetContent side="bottom" className="z-[200]"><SheetHeader><SheetTitle>Virtual karta yaratish</SheetTitle><SheetDescription>Yangi virtual kartangiz uchun nom o'ylab toping.</SheetDescription></SheetHeader><div className="mt-4 space-y-4"><Input value={newVirtualCardLabel} onChange={e => setNewVirtualCardLabel(e.target.value)} placeholder="Karta nomi (masalan, Virtual ATTO)" className="h-12" autoFocus /><Button onClick={handleAddVirtualCard} className="h-12 w-full font-semibold">Yaratish</Button></div></SheetContent></Sheet>
        {cardToTopup && cardToTopup !== 'not_found' && <TopupCardSheet open={topupSheetOpen} onOpenChange={setTopupSheetOpen} cardId={cardToTopup.id} />}
      </div>
    )
  };
}

function Index() {
  const [tab, setTab] = useState<
    "atto" | "home" | "trips" | "transport" | "menu"
  >("atto");
  const [myCardsOpen, setMyCardsOpen] = useState(false);
  const { cards, activeIndex, setActiveIndex } = useCards();
  const addNewCard = AddNewCardView();

  const titleMap: Record<string, string> = {
    home: "Transport",
    trips: "Sayr tarixi",
    transport: "Xarita",
    menu: "Menyu",
  };

  const isAddingCard = activeIndex === cards.length;

  if (tab === "atto") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <AttoHome onOpenTransport={() => setTab("home")} />
        </div>
        <MyCardsPage open={myCardsOpen} onClose={() => setMyCardsOpen(false)} onOpenHistory={() => setTab("trips")} />
      </div>
    );
  }

  if (tab === "menu") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <main className="flex-1 pb-20">
            <MainMenuPage onOpenMyCards={() => setMyCardsOpen(true)} onOpenHistory={() => setTab("trips")} />
          </main>
          <BottomNav active={tab} onChange={(id) => setTab(id as typeof tab)} />
        </div>
         <MyCardsPage open={myCardsOpen} onClose={() => setMyCardsOpen(false)} onOpenHistory={() => setTab("trips")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <TransportHeader
          tab={tab}
          title={titleMap[tab] ?? "Transport"}
          onBackToHome={() => setTab(tab === "home" ? "atto" : "home")}
        />

        <main className="flex-1 space-y-4 pb-20">
          {tab === "home" && (
            <>
              <BalanceCard 
                cards={cards} 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex}
                onCardClick={() => setMyCardsOpen(true)}
                onAddCardPlaceholderClick={addNewCard.openAddCardSheet}
              />
              {isAddingCard ? (
                addNewCard.render
              ) : (
                <>
                  <BiometricRow />
                  <ActionGrid />
                </>
              )}
            </>
          )}
          {tab === "trips" && <TripsHistory />}
          {tab === "transport" && <MapPlaceholder />}
        </main>

        <BottomNav active={tab} onChange={(id) => setTab(id as typeof tab)} />
      </div>
      <MyCardsPage open={myCardsOpen} onClose={() => setMyCardsOpen(false)} onOpenHistory={() => setTab("trips")} />
    </div>
  );
}
