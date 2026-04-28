
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useCards, type TripEntry, type TopupEntry } from "@/context/cards-context";
import {
  formatHM,
  formatNum,
  formatISODate,
} from "@/lib/atto";
import { TopupDetailSheet } from "@/components/TopupDetailSheet";
import { TripDetailSheet } from "@/components/TripDetailSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const dayLabel = (d: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (formatISODate(d) === formatISODate(today)) return "Bugun";
  if (formatISODate(d) === formatISODate(yesterday)) return "Kecha";
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
};

type TripsTab = "trips" | "topups";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
];

export function TripsHistory() {
  const [tab, setTab] = useState<TripsTab>("trips");
  const { trips, topups } = useCards();
  const [replay, setReplay] = useState<TripEntry | null>(null);
  const [topupDetail, setTopupDetail] = useState<TopupEntry | null>(null);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const activeData = tab === "trips" ? trips : topups;

  const { years, yearMonths } = useMemo(() => {
    const yearSet = new Set<number>();
    const monthSet = new Set<string>(); // YYYY-MM
    if (activeData.length === 0) {
        const year = new Date().getFullYear();
        yearSet.add(year);
    } else {
        activeData.forEach(item => {
            const d = new Date(item.at || item.paidAt);
            yearSet.add(d.getFullYear());
            monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
        });
    }
    return { years: Array.from(yearSet).sort((a,b) => b-a), yearMonths: monthSet };
  }, [activeData]);

  const displayedData = useMemo(() => {
    return activeData.filter(item => {
      const itemDate = new Date(item.at || item.paidAt);
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
    });
  }, [activeData, currentYear, currentMonth]);

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
    return Array.from(map.entries()).sort(([a, b]) => (a < b ? 1 : -1));
  }, [displayedData]);

  return (
    <div className="flex flex-col px-5 pt-4 pb-24">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface/50 p-1">
        <TabButton isActive={tab === "trips"} onClick={() => setTab("trips")}>Sayrlar</TabButton>
        <TabButton isActive={tab === "topups"} onClick={() => setTab("topups")}>Hisobni to'ldirish</TabButton>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="text-2xl font-bold pl-2 pr-2">
                    {`${MONTHS[currentMonth]} ${currentYear}`}
                    <ChevronDown className="ml-2 h-6 w-6 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="flex gap-2">
                    <Select value={String(currentMonth)} onValueChange={(v) => setCurrentMonth(Number(v))}>
                        <SelectTrigger className="h-10 w-32 rounded-lg bg-surface/70">
                            <SelectValue placeholder="Oy" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m, i) => (
                                <SelectItem key={m} value={String(i)} disabled={!yearMonths.has(`${currentYear}-${i}`)}>
                                   {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(currentYear)} onValueChange={(v) => setCurrentYear(Number(v))}>
                         <SelectTrigger className="h-10 w-24 rounded-lg bg-surface/70">
                            <SelectValue placeholder="Yil" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </PopoverContent>
        </Popover>
      </div>
      
      <div className="my-5 h-px bg-border/60" />

      {grouped.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {tab === 'trips' ? 'Tanlangan oy uchun sayrlar topilmadi.' : 'Tanlangan oy uchun to\'ldirishlar topilmadi.'}
        </div>
      ) : (
        <div className="space-y-6">
            {grouped.map(([key, bucket]) => (
                <section key={key}>
                    <h3 className="mb-3 text-3xl font-bold tracking-tight">{bucket.label}</h3>
                    <ul className="divide-y divide-border/60">
                        {bucket.items.map(item => (
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

      <TripDetailSheet trip={replay} open={!!replay} onOpenChange={v => !v && setReplay(null)} />
      <TopupDetailSheet entry={topupDetail} open={!!topupDetail} onOpenChange={v => !v && setTopupDetail(null)} />
    </div>
  );
}

function TabButton({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button
          onClick={onClick}
          className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
            isActive ? "bg-surface-elevated text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {children}
        </button>
    )
}

function TripRow({ item, onOpen }: { item: TripEntry; onOpen: (t: TripEntry) => void }) {
  return (
    <button onClick={() => onOpen(item)} className="flex w-full items-center gap-4 py-4 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success text-white">
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
                <ChevronDown className="h-5 w-5 rotate-90" />
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
