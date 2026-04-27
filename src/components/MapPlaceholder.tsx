import { AlertTriangle, MapPin } from "lucide-react";
import mapImage from "@/assets/map-placeholder.jpg";

type MapPlaceholderProps = {
  /** Pastki holat matni — kontekstga qarab o'zgartirish mumkin */
  bottomMessage?: string;
};

/**
 * Xarita placeholderi — vaqtinchalik mavjud emas degan ogohlantirish bilan
 * va pastida "location ruxsat muammolari" xato bloki.
 * Sayr tarixi va karta tahrirlash sahifalarida bir xil ko'rinishda ishlatiladi.
 */
export function MapPlaceholder({
  bottomMessage = "Joylashuv ruxsati berilmagan. Iltimos, telefon sozlamalaridan ATTO uchun lokatsiya ruxsatini yoqing.",
}: MapPlaceholderProps) {
  return (
    <div className="px-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60">
        <img
          src={mapImage}
          alt="Xarita ko'rinishi (vaqtinchalik mavjud emas)"
          className="h-[500px] w-full object-cover opacity-80"
          loading="lazy"
          width={720}
          height={1280}
        />

        {/* Top red banner */}
        <div className="absolute left-3 right-3 top-3 flex items-center gap-2 rounded-2xl bg-destructive/95 px-3 py-2 text-destructive-foreground shadow-lg backdrop-blur">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span className="text-xs font-semibold leading-tight">
            Map vaqtinchalik ishlamayapti
          </span>
        </div>

        {/* Center pin */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/70 backdrop-blur">
            <MapPin className="h-6 w-6 text-destructive" strokeWidth={2.25} />
          </div>
        </div>
      </div>

      {/* Bottom error block */}
      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-destructive">
            Location ruxsat muammolari
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {bottomMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
