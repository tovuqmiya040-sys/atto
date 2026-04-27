import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as db from "../lib/db";

export type Card = {
  id: string;
  label: string;
  number: string;
  balance: string;
  blocked?: boolean;
};

export type TripEntry = {
  id: string;
  receipt: string;
  route: string;
  busPlate: string;
  qrPayload: string;
  amount: number;
  paidAt: string; // ISO
  cardId: string;
  cardLast4: string;
};

export type TopupEntry = {
  id: string;
  type: string; // e.g. "paynet"
  amount: number; // positive delta (can be negative if decreased)
  previousBalance: number;
  newBalance: number;
  at: string; // ISO
  cardId: string;
  cardLast4: string;
};

const DEFAULT_CARDS: Card[] = [
  {
    id: "1",
    label: "Atto card",
    number: "9987 2200 0418 7635",
    balance: "0",
  },
];

const STORAGE_KEY = "atto-demo-cards";
const TRIPS_KEY = "atto-demo-trips";
const TOPUPS_KEY = "atto-demo-topups";

type CardsContextValue = {
  cards: Card[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  updateCard: (id: string, patch: Partial<Omit<Card, "id">>) => Promise<void>;
  addCard: (card: Omit<Card, "id">) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  chargeActive: (amount: number) => Promise<boolean>;
  trips: TripEntry[];
  topups: TopupEntry[];
  addTrip: (t: Omit<TripEntry, "id" | "cardId" | "cardLast4">) => Promise<void>;
  resetTrips: () => Promise<void>;
  resetTopups: () => Promise<void>;
  resetAll: () => Promise<void>;
  hydrated: boolean;
};

const CardsContext = createContext<CardsContextValue | null>(null);

function parseBalance(s: string) {
  return parseInt(s.replace(/\D/g, ""), 10) || 0;
}
function formatBalance(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function last4(num: string) {
  const digits = num.replace(/\D/g, "");
  return digits.slice(-4);
}

export function CardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Card[]>(DEFAULT_CARDS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trips, setTrips] = useState<TripEntry[]>([]);
  const [topups, setTopups] = useState<TopupEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const raw = await db.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Card[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Migrate old default labels
            const migrated = parsed
              .filter((c) => c.label !== "Ishxona")
              .map((c) =>
                c.label === "Abubakr card" ? { ...c, label: "Atto card" } : c,
              )
              .map((c) =>
                c.number === "9987 2200 0025 4127"
                  ? { ...c, number: "9987 2200 0418 7635" }
                  : c,
              );
            setCards(migrated.length > 0 ? migrated : DEFAULT_CARDS);
          }
        }
        const t = await db.getItem(TRIPS_KEY);
        if (t) {
          const parsed = JSON.parse(t) as TripEntry[];
          if (Array.isArray(parsed)) setTrips(parsed);
        }
        const u = await db.getItem(TOPUPS_KEY);
        if (u) {
          const parsed = JSON.parse(u) as TopupEntry[];
          if (Array.isArray(parsed)) setTopups(parsed);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    db.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    db.setItem(TRIPS_KEY, JSON.stringify(trips));
  }, [trips, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    db.setItem(TOPUPS_KEY, JSON.stringify(topups));
  }, [topups, hydrated]);

  const updateCard: CardsContextValue["updateCard"] = async (id, patch) => {
    setCards((prev) => {
      const prevCard = prev.find((c) => c.id === id);
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      // If balance was changed via settings, log a paynet entry
      if (prevCard && patch.balance !== undefined && patch.balance !== prevCard.balance) {
        const previousBalance = parseBalance(prevCard.balance);
        const newBalance = parseBalance(patch.balance);
        const delta = newBalance - previousBalance;
        if (delta !== 0) {
          const entry: TopupEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            type: "paynet",
            amount: delta,
            previousBalance,
            newBalance,
            at: new Date().toISOString(),
            cardId: id,
            cardLast4: last4(patch.number ?? prevCard.number),
          };
          setTopups((prevList) => [entry, ...prevList]);
        }
      }
      return next;
    });
  };

  const chargeActive: CardsContextValue["chargeActive"] = async (amount) => {
    const current = cards[activeIndex];
    if (!current) return false;
    const cur = parseBalance(current.balance);
    if (cur < amount) return false;
    const next = formatBalance(cur - amount);
    setCards((prev) =>
      prev.map((c, i) => (i === activeIndex ? { ...c, balance: next } : c)),
    );
    return true;
  };

  const addTrip: CardsContextValue["addTrip"] = async (t) => {
    const current = cards[activeIndex];
    if (!current) return;
    const entry: TripEntry = {
      ...t,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      cardId: current.id,
      cardLast4: last4(current.number),
    };
    setTrips((prev) => [entry, ...prev]);
  };

  const addCard: CardsContextValue["addCard"] = async (c) => {
    const newCard: Card = {
      ...c,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const removeCard: CardsContextValue["removeCard"] = async (id) => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((c) => c.id === id);
      const next = prev.filter((c) => c.id !== id);
      if (idx === activeIndex) {
        setActiveIndex(Math.max(0, idx - 1));
      } else if (idx < activeIndex) {
        setActiveIndex(activeIndex - 1);
      }
      return next;
    });
  };

  const resetTrips = async () => setTrips([]);
  const resetTopups = async () => setTopups([]);
  const resetAll = async () => {
    setCards(DEFAULT_CARDS);
    setTrips([]);
    setTopups([]);
    setActiveIndex(0);
    await db.clear();
  };

  const value: CardsContextValue = {
    cards,
    activeIndex,
    setActiveIndex,
    updateCard,
    addCard,
    removeCard,
    chargeActive,
    trips,
    topups,
    addTrip,
    resetTrips,
    resetTopups,
    resetAll,
    hydrated,
  };

  return (
    <CardsContext.Provider value={value}>{children}</CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error("useCards must be used within CardsProvider");
  return ctx;
}
