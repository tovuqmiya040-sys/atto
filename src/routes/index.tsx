import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TransportHeader } from "@/components/TransportHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { BiometricRow } from "@/components/BiometricRow";
import { ActionGrid } from "@/components/ActionGrid";
import { BottomNav } from "@/components/BottomNav";
import { TripsHistory } from "@/components/TripsHistory";
import { AttoHome } from "@/components/AttoHome";
import { CardsManagement } from "@/components/CardsManagement";
import { MainMenuPage } from "@/components/MainMenuPage";
import { CardActionsSheet } from "@/components/CardActionsSheet";
import { TopupCardSheet } from "@/components/ExtraSheets";

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

/**
 * Navigatsiya:
 *   "atto"     — boshlang'ich ATTO Home (plitkalar). BottomNav YO'Q.
 *                Transport plitkasi bosilsa → "home" ga o'tadi.
 *   "home"     — bizning Transport ilovasi: balans + biometric + actions. BottomNav bor.
 *   "trips"    — sayr tarixi.
 *   "transport"— xarita placeholder.
 *   "menu"     — Menyu sahifasi.
 */
function Index() {
  const [tab, setTab] = useState<
    "atto" | "home" | "trips" | "transport" | "menu"
  >("atto");
  const [cardActionsOpen, setCardActionsOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);

  const titleMap: Record<string, string> = {
    home: "Transport",
    trips: "Sayr tarixi",
    transport: "Transport",
    menu: "Menyu",
  };

  // ATTO boshlang'ich ekran — BottomNav ko'rinmaydi
  if (tab === "atto") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <AttoHome onOpenTransport={() => setTab("home")} />
        </div>
      </div>
    );
  }

  // Menyu tabi — TransportHeader yo'q (sahifa o'zida sarlavhasi bor)
  if (tab === "menu") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <main className="flex-1 pb-20">
            <MainMenuPage onOpenHistory={() => setTab("trips")} />
          </main>
          <BottomNav active={tab} onChange={(id) => setTab(id as typeof tab)} />
        </div>
      </div>
    );
  }

  // Transport ilovasi ichi — BottomNav ko'rinadi
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
              <BalanceCard onCardClick={() => setCardActionsOpen(true)} />
              <BiometricRow />
              <ActionGrid />
            </>
          )}
          {tab === "trips" && <TripsHistory />}
          {tab === "transport" && <CardsManagement />}
        </main>

        <BottomNav active={tab} onChange={(id) => setTab(id as typeof tab)} />
      </div>

      <CardActionsSheet
        open={cardActionsOpen}
        onOpenChange={setCardActionsOpen}
        onOpenHistory={() => setTab("trips")}
        onOpenTopup={() => setTopupOpen(true)}
      />

      <TopupCardSheet open={topupOpen} onOpenChange={setTopupOpen} />
    </div>
  );
}
