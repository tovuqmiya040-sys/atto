import { useState } from "react";
import {
  CreditCard,
  ArrowDownUp,
  MapPin,
  Mail,
  HelpCircle,
  Tag,
  MessageCircle,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SettingsSheet } from "@/components/SettingsSheet";
import { TransfersSheet } from "@/components/TransfersSheet";
import {
  TerminalsSheet,
  SmsNotificationSheet,
  FaqSheet,
  ContactSheet,
} from "@/components/MenuExtraSheets";
import { TariffSheet } from "@/components/ExtraSheets";

type ItemId =
  | "cards"
  | "transfers"
  | "terminals"
  | "sms"
  | "qa"
  | "tariffs"
  | "settings"
  | "contact";

type Item = { id: ItemId; label: string; icon: LucideIcon };

const ITEMS: Item[] = [
  { id: "cards", label: "Kartalarim", icon: CreditCard },
  { id: "transfers", label: "O`tkazmalar", icon: ArrowDownUp },
  { id: "terminals", label: "Terminallar", icon: MapPin },
  { id: "sms", label: "SMS Xabarnoma", icon: Mail },
  { id: "qa", label: "Savol / Javoblar", icon: HelpCircle },
  { id: "tariffs", label: "Tariflarim", icon: Tag },
  { id: "settings", label: "Sozlamalar", icon: Settings },
  { id: "contact", label: "Biz bilan bog'laning", icon: MessageCircle },
];

export function MainMenuPage({
  onOpenMyCards, // Changed from onOpenHistory
}: {
  onOpenMyCards?: () => void;
  onOpenHistory?: () => void; // Keep for compatibility if needed elsewhere
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [transfersOpen, setTransfersOpen] = useState(false);
  const [terminalsOpen, setTerminalsOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [tariffOpen, setTariffOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleClick = (item: Item) => {
    switch (item.id) {
      case "cards":
        onOpenMyCards?.(); // Use the passed function
        return;
      case "transfers":
        setTransfersOpen(true);
        return;
      case "terminals":
        setTerminalsOpen(true);
        return;
      case "sms":
        setSmsOpen(true);
        return;
      case "qa":
        setFaqOpen(true);
        return;
      case "tariffs":
        setTariffOpen(true);
        return;
      case "settings":
        setSettingsOpen(true);
        return;
      case "contact":
        setContactOpen(true);
        return;
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-background/95 px-5 pt-5 pb-4 backdrop-blur-md">
        <h1 className="text-xl font-bold text-foreground">Menyu</h1>
      </div>
      <div className="px-5 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className="flex aspect-[1.2/1] flex-col justify-between rounded-3xl bg-surface p-4 text-left transition-transform active:scale-[0.97]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="text-base font-semibold leading-tight">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TransfersSheet open={transfersOpen} onOpenChange={setTransfersOpen} />
      <TerminalsSheet open={terminalsOpen} onOpenChange={setTerminalsOpen} />
      <SmsNotificationSheet open={smsOpen} onOpenChange={setSmsOpen} />
      <FaqSheet open={faqOpen} onOpenChange={setFaqOpen} />
      <TariffSheet open={tariffOpen} onOpenChange={setTariffOpen} />
      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
