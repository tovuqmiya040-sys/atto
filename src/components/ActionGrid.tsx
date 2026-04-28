
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Ticket, QrCode, Nfc } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TransportQrSelectorSheet } from "@/components/TransportQrSelectorSheet";
import {
  TariffSheet,
  NfcSheet,
  TopupCardSheet,
} from "@/components/ExtraSheets";

type ActionId = "topup" | "tariff" | "qr" | "nfc";

type Action = {
  id: ActionId;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  variant: "violet" | "green" | "surface" | "blue";
};

const ACTIONS: Action[] = [
  {
    id: "topup",
    icon: Plus,
    title: "Karta hisobini to'ldirish",
    variant: "violet",
  },
  { id: "tariff", icon: Ticket, title: "Tarif sotib olish", variant: "green" },
  {
    id: "qr",
    icon: QrCode,
    title: "QR to'lov",
    subtitle: "avtobus, metro",
    variant: "surface",
  },
  {
    id: "nfc",
    icon: Nfc,
    title: "NFC to'lov",
    subtitle: "faqat metro",
    variant: "blue",
  },
];

function getClasses(variant: Action["variant"]) {
  switch (variant) {
    case "violet":
      return "card-violet-flat text-white";
    case "green":
      return "card-green-flat text-white";
    case "blue":
      return "card-blue-flat text-white";
    default:
      return "card-dark-flat text-white";
  }
}

function getIconWrapClasses(variant: Action["variant"]) {
  switch (variant) {
    case "violet":
      return "bg-white text-[#6366f1]";
    case "blue":
      return "bg-white text-[#2563eb]";
    case "green":
      return "text-white"; // no frame, white icon
    default:
      return "text-white"; // no frame, white icon
  }
}

export function ActionGrid() {
  const navigate = useNavigate();
  const [qrSelectorOpen, setQrSelectorOpen] = useState(false);
  const [tariffOpen, setTariffOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);

  const handleClick = (id: ActionId) => {
    if (id === "qr") setQrSelectorOpen(true);
    else if (id === "tariff") setTariffOpen(true);
    else if (id === "nfc") setNfcOpen(true);
    else if (id === "topup") setTopupOpen(true);
  };

  const handleSelectBus = () => {
    setQrSelectorOpen(false); // Oynani yopamiz
    // Skaner sahifasiga o'tamiz
    navigate({ to: '/scan' }); 
  };

  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const isIconBoxed = a.variant === "violet" || a.variant === "blue";
          const isLarge = a.id === "qr" || a.id === "nfc";
          return (
            <button
              key={a.id}
              onClick={() => handleClick(a.id)}
              className={`flex ${
                isLarge ? "aspect-[1/0.85]" : "aspect-[1/0.85]"
              } flex-col items-start justify-between rounded-2xl p-4 pt-5 text-left shadow-md shadow-black/20 transition-transform active:scale-[0.97] ${getClasses(
                a.variant,
              )}`}
            >
              <div
                className={`flex items-center justify-center ${
                  isIconBoxed ? "h-8 w-8 rounded-lg" : ""
                } ${getIconWrapClasses(a.variant)}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">
                  {a.title}
                </div>
                {a.subtitle && (
                  <div className="mt-1 text-xs text-white/60">
                    {a.subtitle}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <TransportQrSelectorSheet
        open={qrSelectorOpen}
        onOpenChange={setQrSelectorOpen}
        onSelectBus={handleSelectBus}
      />
      <TariffSheet open={tariffOpen} onOpenChange={setTariffOpen} />
      <NfcSheet open={nfcOpen} onOpenChange={setNfcOpen} />
      <TopupCardSheet open={topupOpen} onOpenChange={setTopupOpen} />
    </div>
  );
}
