import {
  Ticket,
  Fuel,
  Tv,
  Bike,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "soon" | "location";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function FeatureSheet({
  open,
  onOpenChange,
  icon: Icon,
  title,
  subtitle,
  bullets,
  status = "soon",
  accent = "brand",
}: SheetProps & {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  bullets: string[];
  status?: Status;
  accent?: "brand" | "success" | "info" | "warning";
}) {
  const accentClasses: Record<string, string> = {
    brand: "bg-brand text-brand-foreground",
    success: "bg-success text-success-foreground",
    info: "bg-info text-info-foreground",
    warning: "bg-warning text-warning-foreground",
  };
  const dotClasses: Record<string, string> = {
    brand: "bg-brand",
    success: "bg-success",
    info: "bg-info",
    warning: "bg-warning",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-3xl border-border bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>

        <div className="flex flex-col items-center px-6 pt-8 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${accentClasses[accent]}`}
          >
            <Icon className="h-8 w-8" strokeWidth={2.25} />
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          <span
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
              status === "location"
                ? "bg-warning/15 text-warning"
                : "bg-info/15 text-info"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "location" ? "bg-warning" : "bg-info"
              } animate-pulse`}
            />
            {status === "location" ? "Lokatsiya muammosi" : "Tez orada"}
          </span>

          <div className="mt-6 w-full space-y-2 text-left">
            {bullets.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClasses[accent]}`}
                />
                <span className="text-sm text-foreground/90">{b}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-2xl bg-surface-elevated text-sm font-semibold"
            >
              Yopish
            </Button>
            <Button
              onClick={() => {
                toast.success("Ishga tushganda xabar beramiz");
                onOpenChange(false);
              }}
              className="h-12 rounded-2xl text-sm font-semibold"
            >
              Bildirishnoma
            </Button>
          </div>

          <div className="h-2" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Chiptalar ---------------- */

export function TicketsSheet(p: SheetProps) {
  return (
    <FeatureSheet
      {...p}
      icon={Ticket}
      title="Chiptalar"
      subtitle="Avtobus, poyezd va shahararo yo'nalishlarga chiptalar"
      bullets={[
        "Toshkent–Samarqand, Buxoro va boshqa yo'nalishlar",
        "Joyni oldindan band qilish va o'rin tanlash",
        "QR-chipta — kassaga navbat kutmasdan",
        "Chiptani bekor qilish va pulni qaytarish",
      ]}
      status="soon"
      accent="success"
    />
  );
}

/* ---------------- Skuterlar ---------------- */

export function ScootersSheet(p: SheetProps) {
  return (
    <FeatureSheet
      {...p}
      icon={Bike}
      title="Skuterlar"
      subtitle="Yaqin atrofda skuter topilmadi"
      bullets={[
        "GPS lokatsiyangiz aniqlanmadi yoki yoqilmagan",
        "Brauzer/ilova sozlamalaridan joylashuvga ruxsat bering",
        "Hozircha sizning hududingizda skuterlar mavjud emas",
        "Xizmat ishga tushganda eng yaqin skuterlar shu yerda chiqadi",
      ]}
      status="location"
      accent="warning"
    />
  );
}

/* ---------------- Yoqilg'i kartasi ---------------- */

export function FuelSheet(p: SheetProps) {
  return (
    <FeatureSheet
      {...p}
      icon={Fuel}
      title="Yoqilg'i kartasi"
      subtitle="Avtomobil uchun yagona to'lov kartasi"
      bullets={[
        "AI-92, AI-95, gaz va dizel — barchasi bitta kartada",
        "UZGASTRADE va Sharq Oqimi shoxobchalarida ishlatish",
        "Har bir to'lovga keshbek va aksiyalar",
        "Sayohat va xarajat tarixini kuzatish",
      ]}
      status="soon"
      accent="brand"
    />
  );
}

/* ---------------- Kino va TV ---------------- */

export function CinemaTvSheet(p: SheetProps) {
  return (
    <FeatureSheet
      {...p}
      icon={Tv}
      title="Kino va TV"
      subtitle="Filmlar, seriallar va jonli efir bitta ilovada"
      bullets={[
        "100+ TV kanal HD sifatida",
        "Yangi filmlar va seriallar — premyera kunidayoq",
        "Bolalar uchun alohida bo'lim",
        "Bir nechta qurilmada bitta obuna bilan tomosha qilish",
      ]}
      status="soon"
      accent="info"
    />
  );
}

/* ---------------- eSIM ---------------- */

export function EsimSheet(p: SheetProps) {
  return (
    <FeatureSheet
      {...p}
      icon={Smartphone}
      title="eSIM"
      subtitle="Plastik SIM-kartasiz raqamli aloqa"
      bullets={[
        "Bir necha daqiqada faollashtirish — QR orqali",
        "Xorijga chiqqanda — internet va aloqa darhol ishlaydi",
        "Bitta telefonda bir nechta raqam saqlash",
        "Tarif va paketlarni ilova ichidan boshqarish",
      ]}
      status="soon"
      accent="brand"
    />
  );
}
