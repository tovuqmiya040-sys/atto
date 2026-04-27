import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as db from "../lib/db";

export type PlateRoute = {
  id: string;
  /** Normalised plate, e.g. "01445GGF" — letters uppercased, no spaces/slashes */
  plateKey: string;
  /** Human display, e.g. "01 445 GGF" */
  plateDisplay: string;
  /** Route number, e.g. "87" or "9T" */
  route: string;
};

type RoutesContextValue = {
  /** The route number shown in the ATTO header chip — also the default during payment */
  defaultRoute: string;
  setDefaultRoute: (v: string) => Promise<void>;

  mappings: PlateRoute[];
  addMapping: (m: Omit<PlateRoute, "id">) => Promise<void>;
  updateMapping: (id: string, patch: Partial<Omit<PlateRoute, "id">>) => Promise<void>;
  removeMapping: (id: string) => Promise<void>;

  /** Find a mapped route by raw QR text or formatted plate */
  findRouteForQr: (raw: string) => string | null;
  findRouteForPlate: (display: string) => string | null;
  hydrated: boolean;
};

const RoutesContext = createContext<RoutesContextValue | null>(null);

const ROUTE_KEY = "atto-default-route";
const MAP_KEY = "atto-plate-routes";

/** "atto01445GGF" or "01/445 GGF" or "01 445 GGF" → "01445GGF" */
export function normalisePlate(input: string): string {
  if (!input) return "";
  const stripped = input.trim().replace(/^atto/i, "");
  return stripped.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
}

export function RoutesProvider({ children }: { children: ReactNode }) {
  const [defaultRoute, setDefaultRouteState] = useState<string>("");
  const [mappings, setMappings] = useState<PlateRoute[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadRoutes() {
      try {
        const r = await db.getItem(ROUTE_KEY);
        if (r) setDefaultRouteState(r);
        const m = await db.getItem(MAP_KEY);
        if (m) {
          const parsed = JSON.parse(m) as PlateRoute[];
          if (Array.isArray(parsed)) setMappings(parsed);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }
    loadRoutes();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    db.setItem(ROUTE_KEY, defaultRoute);
  }, [defaultRoute, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    db.setItem(MAP_KEY, JSON.stringify(mappings));
  }, [mappings, hydrated]);

  const setDefaultRoute = async (v: string) => setDefaultRouteState(v.trim());

  const addMapping: RoutesContextValue["addMapping"] = async (m) => {
    const entry: PlateRoute = {
      ...m,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setMappings((prev) => [entry, ...prev]);
  };

  const updateMapping: RoutesContextValue["updateMapping"] = async (id, patch) => {
    setMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  };

  const removeMapping: RoutesContextValue["removeMapping"] = async (id) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const findRouteForQr: RoutesContextValue["findRouteForQr"] = (raw) => {
    const key = normalisePlate(raw);
    if (!key) return null;
    const hit = mappings.find((m) => m.plateKey === key);
    return hit ? hit.route : null;
  };

  const findRouteForPlate: RoutesContextValue["findRouteForPlate"] = (
    display,
  ) => {
    const key = normalisePlate(display);
    if (!key) return null;
    const hit = mappings.find((m) => m.plateKey === key);
    return hit ? hit.route : null;
  };

  return (
    <RoutesContext.Provider
      value={{
        defaultRoute,
        setDefaultRoute,
        mappings,
        addMapping,
        updateMapping,
        removeMapping,
        findRouteForQr,
        findRouteForPlate,
        hydrated,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes() {
  const context = useContext(RoutesContext);
  if (context === null) {
    throw new Error("useRoutes must be used within a RoutesProvider");
  }
  return context;
}
