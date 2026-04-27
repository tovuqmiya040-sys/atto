import { useState } from "react";
import { Menu, MessageSquareText, Bus, Check, X } from "lucide-react";
import { toast } from "sonner";

import tileTransport from "@/assets/tile-transport.jpg";
import tileScooter from "@/assets/tile-scooter.jpg";
import tileTrain from "@/assets/tile-train.jpg";
import tileFuel from "@/assets/tile-fuel.jpg";
import tileCinema from "@/assets/tile-cinema.jpg";
import tileTv from "@/assets/tile-tv.jpg";
import tileQr from "@/assets/tile-qr.jpg";
import tileParking from "@/assets/tile-parking.jpg";
import tileTaxi from "@/assets/tile-taxi.jpg";
import tileEsim from "@/assets/tile-esim.jpg";

import { MenuSheet } from "@/components/MenuSheet";
import { CreditsSheet } from "@/components/MenuExtraSheets";
import { PaymentSheet } from "@/components/PaymentSheet";
import {
  TicketsSheet,
  ScootersSheet,
  FuelSheet,
  CinemaTvSheet,
  EsimSheet,
} from "@/components/FeatureSheets";
import { useRoutes } from "@/context/routes-context";

type AttoHomeProps = {
  /** Transport plitkasi bosilganda — bizning haqiqiy Transport ekranimizga o'tadi */
  onOpenTransport: () => void;
};

const COMING_SOON = "Hizmat tez orada ochiladi";
const UNAVAILABLE = "Hizmat vaqtinchalik mavjud emas";

export function AttoHome({ onOpenTransport }: AttoHomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [scootersOpen, setScootersOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [cinemaTvOpen, setCinemaTvOpen] = useState(false);
  const [esimOpen, setEsimOpen] = useState(false);
  const { defaultRoute, setDefaultRoute } = useRoutes();
  const [routeEditing, setRouteEditing] = useState(false);
  const [routeDraft, setRouteDraft] = useState(defaultRoute);

  const openRouteEditor = () => {
    setRouteDraft(defaultRoute);
    setRouteEditing(true);
  };
  const saveRoute = async () => {
    await setDefaultRoute(routeDraft.toUpperCase().slice(0, 4));
    setRouteEditing(false);
  };
  const cancelRoute = () => {
    setRouteDraft(defaultRoute);
    setRouteEditing(false);
  };

  const comingSoon = () => toast(COMING_SOON);
  const unavailable = () => toast(UNAVAILABLE);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/95 px-5 pt-5 pb-4 backdrop-blur-md">
        <button
          aria-label="Menyu"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-surface-elevated"
        >
          <Menu className="h-6 w-6" strokeWidth={2.25} />
        </button>

        <div className="text-3xl font-black tracking-tighter">
          AT<span className="text-success">TO</span>
        </div>

        <div className="flex items-center gap-2">
          {routeEditing ? (
            <div className="flex items-center gap-1 rounded-full bg-surface-elevated px-1.5 py-1">
              <Bus className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
              <input
                autoFocus
                inputMode="text"
                value={routeDraft}
                onChange={(e) =>
                  setRouteDraft(e.target.value.toUpperCase().slice(0, 4))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRoute();
                  if (e.key === "Escape") cancelRoute();
                }}
                placeholder="87"
                className="h-6 w-12 rounded-full bg-transparent px-1 text-center text-sm font-bold text-foreground outline-none"
              />
              <button
                onClick={saveRoute}
                aria-label="Saqlash"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
              <button
                onClick={cancelRoute}
                aria-label="Bekor qilish"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              aria-label="Yo'nalish raqami"
              onClick={openRouteEditor}
              className="flex h-9 items-center gap-1.5 rounded-full bg-surface-elevated px-3 text-foreground/90 transition-colors hover:bg-accent"
            >
              <Bus className="h-4 w-4 text-success" strokeWidth={2.5} />
              <span className="text-sm font-bold tracking-tight">
                {defaultRoute || "—"}
              </span>
            </button>
          )}

          <button
            aria-label="Xabarlar"
            onClick={() => setCreditsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/90 transition-colors hover:bg-surface-elevated"
          >
            <MessageSquareText className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
      </header>

      <main className="space-y-3 px-3 pb-4">
        {/* Row 1: Transport (big) + Chiptalar / Skuterlar (column) */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onOpenTransport}
            className="col-span-2 row-span-2 overflow-hidden rounded-3xl bg-surface text-left transition-transform active:scale-[0.98]"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <img
                src={tileTransport}
                alt="Transport"
                className="h-full w-full object-cover"
                loading="eager"
                width={768}
                height={768}
              />
            </div>
            <div className="px-4 pb-4 pt-2 text-center text-base font-semibold">
              Transport
            </div>
          </button>

          <Tile
            image={tileTrain}
            label="Chiptalar"
            onClick={() => setTicketsOpen(true)}
          />
          <Tile
            image={tileScooter}
            label="Skuterlar"
            onClick={() => setScootersOpen(true)}
          />
        </div>

        {/* Row 2: 3 small tiles */}
        <div className="grid grid-cols-3 gap-3">
          <Tile image={tileFuel} label="Yoqilg'i kartasi" onClick={() => setFuelOpen(true)} />
          <Tile image={tileCinema} label="Kino chiptalari" onClick={comingSoon} />
          <Tile image={tileTv} label="Kino va TV" onClick={() => setCinemaTvOpen(true)} />
        </div>

        {/* Row 3: Wide QR tile */}
        <button
          onClick={() => setQrOpen(true)}
          className="relative flex w-full items-center overflow-hidden rounded-3xl bg-surface px-5 py-4 text-left transition-transform active:scale-[0.98]"
        >
          <div className="flex-1 text-base font-semibold">QR to'lov</div>
          <img
            src={tileQr}
            alt="QR to'lov"
            className="h-20 w-32 rounded-2xl object-cover"
            loading="lazy"
            width={768}
            height={512}
          />
        </button>

        {/* Row 4: 3 small tiles */}
        <div className="grid grid-cols-3 gap-3">
          <Tile image={tileParking} label="Avtoturargoh" onClick={unavailable} />
          <Tile
            image={tileTaxi}
            label="Transfer"
            badge="tez"
            onClick={comingSoon}
          />
          <Tile image={tileEsim} label="eSIM" onClick={() => setEsimOpen(true)} />
        </div>
      </main>

      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
      <CreditsSheet open={creditsOpen} onOpenChange={setCreditsOpen} />
      <PaymentSheet open={qrOpen} onOpenChange={setQrOpen} />

      <TicketsSheet open={ticketsOpen} onOpenChange={setTicketsOpen} />
      <ScootersSheet open={scootersOpen} onOpenChange={setScootersOpen} />
      <FuelSheet open={fuelOpen} onOpenChange={setFuelOpen} />
      <CinemaTvSheet open={cinemaTvOpen} onOpenChange={setCinemaTvOpen} />
      <EsimSheet open={esimOpen} onOpenChange={setEsimOpen} />
    </>
  );
}

function Tile({
  image,
  label,
  onClick,
  badge,
}: {
  image: string;
  label: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-3xl bg-surface text-left transition-transform active:scale-[0.97]"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          src={image}
          alt={label}
          className="h-full w-full object-cover"
          loading="lazy"
          width={512}
          height={512}
        />
        {badge && (
          <span className="absolute right-2 top-2 rounded-full bg-info px-2 py-0.5 text-[10px] font-bold uppercase text-info-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="px-2 pb-3 pt-2 text-center text-xs font-semibold leading-tight">
        {label}
      </div>
    </button>
  );
}
