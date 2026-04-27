import { useState } from "react";
import {
  X,
  ChevronRight,
  User,
  Lock,
  Palette,
  Smartphone,
  Info,
  LogOut,
  Languages,
  CreditCard,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { SecuritySheet } from "@/components/SecuritySheet";
import { PersonalInfoSheet } from "@/components/PersonalInfoSheet";
import { MyCardsSheet } from "@/components/MyCardsSheet";
import { ActiveDevicesSheet, AboutAppSheet } from "@/components/MenuExtraSheets";

type MenuSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const UNAVAILABLE = "Bu bo'lim vaqtinchalik mavjud emas";

/**
 * ATTO Home tepasidagi 3-chiziq tugmasi bosilganda ochiladigan asosiy
 * "Menyu" sheeti.
 */
export function MenuSheet({ open, onOpenChange }: MenuSheetProps) {
  const [securityOpen, setSecurityOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const notAvailable = () => toast.error(UNAVAILABLE);

  const openWith = (setter: (v: boolean) => void) => {
    onOpenChange(false);
    setTimeout(() => setter(true), 200);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-[2.5rem] border-none bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:max-w-md"
        >
          {/* Handle bar */}
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Menyu
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/70 transition-colors hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Top tiles: kartalarim + til */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => openWith(setCardsOpen)}
              className="relative h-32 overflow-hidden rounded-3xl bg-surface-elevated p-4 text-left transition-transform active:scale-[0.98]"
            >
              <div className="absolute right-3 top-3 text-muted-foreground">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-muted-foreground/70">
                kartalarim
              </div>
              <div className="absolute bottom-3 left-4 flex">
                {["bg-info", "bg-brand", "bg-success"].map((c, i) => (
                  <div
                    key={i}
                    className={`-ml-2 flex h-9 w-12 items-center justify-center rounded-md ${c} text-[11px] font-bold text-white shadow first:ml-0`}
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </button>

            <button
              onClick={notAvailable}
              className="relative h-32 overflow-hidden rounded-3xl bg-surface-elevated p-4 text-left transition-transform active:scale-[0.98]"
            >
              <div className="absolute right-3 top-3 text-muted-foreground">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-muted-foreground/70">
                til
              </div>
              <div className="absolute bottom-3 left-4">
                <div className="flex h-9 w-12 items-center justify-center rounded-md bg-background text-foreground shadow">
                  <Languages className="h-5 w-5 text-success" />
                </div>
              </div>
            </button>
          </div>

          {/* List rows */}
          <div className="mt-5 space-y-1">
            <ListRow
              icon={<User className="h-5 w-5" />}
              label="Shaxsiy ma'lumotlar"
              onClick={() => openWith(setPersonalOpen)}
            />
            <ListRow
              icon={<Lock className="h-5 w-5" />}
              label="Xavfsizlik"
              onClick={() => openWith(setSecurityOpen)}
            />
            <ListRow
              icon={<Palette className="h-5 w-5" />}
              label="Dizayn"
              onClick={notAvailable}
            />

            <div className="h-2" />

            <ListRow
              icon={<Smartphone className="h-5 w-5" />}
              label="Faol qurilmalar"
              onClick={() => openWith(setDevicesOpen)}
            />
            <ListRow
              icon={<Info className="h-5 w-5" />}
              label="Ilova haqida"
              onClick={() => openWith(setAboutOpen)}
            />
          </div>

          {/* Logout + version */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={notAvailable}
              className="flex items-center gap-2 text-base font-semibold text-destructive transition-opacity active:opacity-70"
            >
              <LogOut className="h-5 w-5" />
              Hisobdan chiqish
            </button>
            <div className="text-xs text-muted-foreground">
              Ilova versiyasi 2.6.47(1)
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SecuritySheet
        open={securityOpen}
        onOpenChange={setSecurityOpen}
        onBack={() => onOpenChange(true)}
      />

      <PersonalInfoSheet
        open={personalOpen}
        onOpenChange={setPersonalOpen}
        onBack={() => onOpenChange(true)}
      />

      <MyCardsSheet
        open={cardsOpen}
        onOpenChange={setCardsOpen}
        onBack={() => onOpenChange(true)}
      />
      <ActiveDevicesSheet
        open={devicesOpen}
        onOpenChange={setDevicesOpen}
        onBack={() => onOpenChange(true)}
      />
      <AboutAppSheet
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        onBack={() => onOpenChange(true)}
      />
    </>
  );
}

function ListRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-3.5 text-left transition-colors hover:bg-surface-elevated"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground">
        {icon}
      </div>
      <div className="flex-1 text-base font-semibold text-foreground">
        {label}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
