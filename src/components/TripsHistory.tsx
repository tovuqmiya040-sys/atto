import { useMemo, useState } from "react";
import { CreditCard, ChevronRight, Filter } from "lucide-react";
import { useCards, type TripEntry, type TopupEntry } from "@/context/cards-context";
import {
  formatMonthYearTitle,
  formatHM,
  formatDayShort,
  dayLabel,
  formatNum,
  formatISODate,
} from "@/lib/atto";
import { TopupDetailSheet } from "@/components/TopupDetailSheet";
import { TripDetailSheet } from "@/components/TripDetailSheet";

type TripsTab = "trips" | "topups";

export function TripsHistory() {
  const [tab, setTab] = useState<TripsTab>("trips");
  const { trips, topups } = useCards();
  const [replay, setReplay] = useState<TripEntry | null>(null);
  const [topupDetail, setTopupDetail] = useState<TopupEntry | null>(null);

  const now = new Date();
  const monthTitle = formatMonthYearTitle(now);

  return (
    <div className="flex flex-col px-5 pt-4">
      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface/50 p-1">
        <button
          onClick={() => setTab("trips")}
          className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
            tab === "trips"
              ? "bg-surface-elevated text-foreground"
              : "text-muted-foreground"
          }`}
        >
          Sayrlar
        </button>
        <button
          onClick={() => setTab("topups")}
          className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
            tab === "topups"
              ? "bg-surface-elevated text-foreground"
              : "text-muted-foreground"
          }`}
        >
          Hisobni to'ldirish
        </button>
      </div>

      {/* Month header */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-2xl font-bold text-muted-foreground/60">
          {monthTitle}
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>

      <div className="my-5 h-px bg-border/60" />

      {tab === "trips" ? (
        <TripsList trips={trips} onOpen={(t) => setReplay(t)} />
      ) : (
        <TopupsList topups={topups} onOpen={(t) => setTopupDetail(t)} />
      )}

      {/* Floating filter button (visual only) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 flex justify-center">
        <div className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated/90 text-muted-foreground shadow-lg backdrop-blur">
          <Filter className="h-5 w-5" />
        </div>
      </div>

      <TripDetailSheet
        trip={replay}
        open={!!replay}
        onOpenChange={(v) => !v && setReplay(null)}
      />
      <TopupDetailSheet
        entry={topupDetail}
        open={!!topupDetail}
        onOpenChange={(v) => !v && setTopupDetail(null)}
      />
    </div>
  );
}

function TripsList({
  trips,
  onOpen,
}: {
  trips: TripEntry[];
  onOpen: (t: TripEntry) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: TripEntry[] }>();
    for (const t of trips) {
      const d = new Date(t.paidAt);
      const key = formatISODate(d);
      const label = dayLabel(d);
      const bucket = map.get(key) ?? { label, items: [] };
      bucket.items.push(t);
      map.set(key, bucket);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [trips]);

  if (trips.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Hozircha sayr tarixi yo'q. QR to'lov qiling — bu yerda paydo bo'ladi.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {grouped.map(([key, bucket]) => (
        <section key={key}>
          <h3 className="mb-3 text-3xl font-bold tracking-tight">
            {bucket.label}
          </h3>
          <ul className="divide-y divide-border/60">
            {bucket.items.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onOpen(t)}
                  className="flex w-full items-center gap-4 py-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground">
                    <span className="text-sm font-bold">{t.route}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold leading-tight">
                      Avtobus
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatHM(new Date(t.paidAt))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {formatNum(t.amount)}
                      </span>{" "}
                      <span className="text-xs uppercase text-muted-foreground">
                        uzs
                      </span>
                    </div>
                    <CreditCard className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TopupsList({
  topups,
  onOpen,
}: {
  topups: TopupEntry[];
  onOpen: (t: TopupEntry) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: TopupEntry[] }>();
    for (const t of topups) {
      const d = new Date(t.at);
      const key = formatISODate(d);
      const label = formatDayShort(d);
      const bucket = map.get(key) ?? { label, items: [] };
      bucket.items.push(t);
      map.set(key, bucket);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [topups]);

  if (topups.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Hali to'ldirish tarixi yo'q. To'lovni amalga oshiring — bu yerda
        ko'rinadi.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {grouped.map(([key, bucket]) => (
        <section key={key}>
          <h3 className="mb-3 text-3xl font-bold tracking-tight">
            {bucket.label}
          </h3>
          <ul className="divide-y divide-border/60">
            {bucket.items.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onOpen(t)}
                  className="flex w-full items-center gap-4 py-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <ChevronRight className="h-5 w-5 rotate-90" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold leading-tight">
                      paynet
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatHM(new Date(t.at))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      {formatNum(Math.abs(t.amount))}
                    </span>{" "}
                    <span className="text-xs uppercase text-muted-foreground">
                      uzs
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
