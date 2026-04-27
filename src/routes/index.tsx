import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TransportHeader } from "@/components/TransportHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { BiometricRow } from "@/components/BiometricRow";
import { ActionGrid } from "@/components/ActionGrid";
import { BottomNav } from "@/components/BottomNav";
import { TripsHistory } from "@/components/TripsHistory";
import { AttoHome } from "@/components/AttoHome";
import { MyCardsPage } from "@/components/MyCardsPage"; // Changed from CardsManagement
import { MainMenuPage } from "@/components/MainMenuPage";
import { CardActionsSheet } from "@/components/CardActionsSheet";
import { TopupCardSheet } from "@/components/ExtraSheets";
import { MapPlaceholder } from "@/components/MapPlaceholder";

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

function Index() {
  const [tab, setTab] = useState<
    "atto" | "home" | "trips" | "transport" | "menu"
  >("atto");
  const [cardActionsOpen, setCardActionsOpen] = useState(false);
  const [myCardsOpen, setMyCardsOpen] = useState(false); // State for MyCardsPage
  const [topupOpen, setTopupOpen] = useState(false);

  const titleMap: Record<string, string> = {
    home: "Transport",
    trips: "Sayr tarixi",
    transport: "Xarita", // Changed title for clarity
    menu: "Menyu",
  };

  const handleOpenMyCards = () => {
    if (tab === "atto") {
        setTab("home") // Switch to transport view if in atto home
    }
    setMyCardsOpen(true);
  }

  // ATTO boshlang'ich ekran
  if (tab === "atto") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <AttoHome onOpenTransport={() => setTab("home")} />
        </div>
        {/* MyCardsPage needs to be available globally */}
        <MyCardsPage open={myCardsOpen} onClose={() => setMyCardsOpen(false)} onOpenHistory={() => setTab("trips")} />
      </div>
    );
  }

  // Menyu tabi
  if (tab === "menu") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <main className="flex-1 pb-20">
            <MainMenuPage onOpenMyCards={handleOpenMyCards} onOpenHistory={() => setTab("trips")} />
          </main>
          <BottomNav active={tab} onChange={(id) => setTab(id as typeof tab)} />
        </div>
         <MyCardsPage open={myCardsOpen} onClose={() => setMyCardsOpen(false)} onOpenHistory={() => setTab("trips")} />
      </div>
    );
  }

  // Transport ilovasi ichi
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
              <ActionGrid onMyCardsClick={handleOpenMyCards}/>
            </>
          )}
          {tab === "trips" && <TripsHistory />}
          {tab === "transport" && <MapPlaceholder />}
        </main>

        <BottomNav active={tab} onChange={(id) => setTab(id as typeof tab)} />
      </div>

      <CardActionsSheet
        open={cardActionsOpen}
        onOpenChange={setCardActionsOpen}
        onOpenMyCards={handleOpenMyCards}
        onOpenHistory={() => setTab("trips")}
        onOpenTopup={() => setTopupOpen(true)}
      />

      <TopupCardSheet open={topupOpen} onOpenChange={setTopupOpen} />
      <MyCardsPage open={myCardsOpen} onClose={() => setMyCardsOpen(false)} onOpenHistory={() => setTab("trips")} />
    </div>
  );
}
