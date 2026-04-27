import { useMemo, useState } from "react";
import {
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { useCards, type TripEntry, type TopupEntry } from "@/context/cards-context";
import {
  formatHM,
  formatNum,
  formatISODate,
} from "@/lib/atto";
import { TopupDetailSheet } from "@/components/TopupDetailSheet";
import { TripDetailSheet } from "@/components/TripDetailSheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const dayLabel = (d: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (formatISODate(d) === formatISODate(today)) return "Bugun";
  if (formatISODate(d) === formatISODate(yesterday)) return "Kecha";
  return d.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
  });
};

type TripsTab = "trips" | "topups";

export function TripsHistory() {
  const [tab, setTab] = useState<TripsTab>("trips");
  const { trips, topups } = useCards();
  const [replay, setReplay] = useState<TripEntry | null>(null);
  const [topupDetail, setTopupDetail] = useState<TopupEntry | null>(null);

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const activeData = tab === "trips" ? trips : topups;

  const daysWithActivity = useMemo(() => {
    const dateStrings = new Set(
      activeData.map((item) => formatISODate(new Date(item.at || item.paidAt))),
    );
    return (date: Date) => dateStrings.has(formatISODate(date));
  }, [activeData]);

  const { firstYear, lastYear } = useMemo(() => {
    if (activeData.length === 0) {
      const currentYear = new Date().getFullYear();
      return { firstYear: currentYear, lastYear: currentYear };
    }
    const years = activeData.map((item) =>
      new Date(item.at || item.paidAt).getFullYear(),
    );
    return {
      firstYear: Math.min(...years),
      lastYear: Math.max(...years),
    };
  }, [activeData]);

  const displayedData = useMemo(() => {
    if (selectedDay) {
      return activeData.filter(
        (item) =>
          formatISODate(new Date(item.at || item.paidAt)) ===
          formatISODate(selectedDay),
      );
    }
    return activeData.filter((item) => {
      const itemDate = new Date(item.at || item.paidAt);
      return (
        itemDate.getFullYear() === currentMonth.getFullYear() &&
        itemDate.getMonth() === currentMonth.getMonth()
      );
    });
  }, [activeData, selectedDay, currentMonth]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: (TripEntry | TopupEntry)[] }>();
    for (const t of displayedData) {
      const d = new Date(t.at || t.paidAt);
      const key = formatISODate(d);
      const label = dayLabel(d);
      const bucket = map.get(key) ?? { label, items: [] };
      bucket.items.push(t);
      map.set(key, bucket);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [displayedData]);

  return (
    <div className="flex flex-col px-5 pt-4 pb-24">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface/50 p-1">
        <TabButton isActive={tab === "trips"} onClick={() => setTab("trips")}>Sayrlar</TabButton>
        <TabButton isActive={tab === "topups"} onClick={() => setTab("topups")}>Hisobni to'ldirish</TabButton>
      </div>

      <div className="mt-4 rounded-xl bg-surface/50 p-0.5">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={(day) => {
            if (selectedDay && day && formatISODate(selectedDay) === formatISODate(day)) {
              setSelectedDay(undefined);
            } else {
              setSelectedDay(day);
            }
          }}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={{ hasActivity: daysWithActivity }}
          modifiersClassNames={{ hasActivity: "has-activity" }}
          captionLayout="dropdown-buttons"
          fromYear={firstYear}
          toYear={lastYear}
        />
      </div>
      
      <div className="my-5 h-px bg-border/60" />

      {selectedDay && (
         <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{dayLabel(selectedDay)}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDay(undefined)} className="text-primary">
              Barchasini ko'rsatish
            </Button>
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {tab === 'trips' ? 'Belgilangan davr uchun sayrlar topilmadi.' : 'Belgilangan davr uchun to'ldirishlar topilmadi.'}
        </div>
      ) : (
        <div className="space-y-6">
            {grouped.map(([key, bucket]) => (
                <section key={key}>
                {!selectedDay && <h3 className="mb-3 text-3xl font-bold tracking-tight">{bucket.label}</h3>}
                <ul className="divide-y divide-border/60">
                    {bucket.items.map((item) => (
                    <li key={item.id}>
                        {tab === "trips" ? (
                            <TripRow item={item as TripEntry} onOpen={setReplay} />
                        ) : (
                            <TopupRow item={item as TopupEntry} onOpen={setTopupDetail} />
                        )}
                    </li>
                    ))}
                </ul>
                </section>
            ))}
        </div>
      )}

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

// Helper components for rows and tabs to keep the main component clean

function TabButton({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button
          onClick={onClick}
          className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
            isActive
              ? "bg-surface-elevated text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {children}
        </button>
    )
}

function TripRow({ item, onOpen }: { item: TripEntry; onOpen: (t: TripEntry) => void }) {
  return (
    <button onClick={() => onOpen(item)} className="flex w-full items-center gap-4 py-4 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
            <span className="text-sm font-bold">{item.route}</span>
        </div>
        <div className="flex-1">
            <div className="text-lg font-semibold leading-tight">Avtobus</div>
            <div className="text-sm text-muted-foreground">{formatHM(new Date(item.paidAt))}</div>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right">
                <span className="text-2xl font-bold">{formatNum(item.amount)}</span>
                <span className="text-xs uppercase text-muted-foreground"> uzs</span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground/70" />
        </div>
    </button>
  );
}

function TopupRow({ item, onOpen }: { item: TopupEntry; onOpen: (t: TopupEntry) => void }) {
    return (
        <button onClick={() => onOpen(item)} className="flex w-full items-center gap-4 py-4 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ChevronLeft className="h-5 w-5 -rotate-90" />
            </div>
            <div className="flex-1">
                <div className="text-lg font-semibold leading-tight capitalize">{item.method}</div>
                <div className="text-sm text-muted-foreground">{formatHM(new Date(item.at))}</div>
            </div>
            <div className="flex items-center gap-2">
                 <div className="text-right text-success">
                    <span className="text-2xl font-bold">+{formatNum(Math.abs(item.amount))}</span>
                    <span className="text-xs uppercase"> uzs</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/70" />
            </div>
        </button>
    )
}
