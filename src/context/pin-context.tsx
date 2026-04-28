import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as db from "@/lib/db";

const PIN_KEY = "atto_app_pin_v1";
export const PIN_LEN = 4;

type PinContextValue = {
  /** PIN o'rnatilganmi */
  hasPin: boolean;
  /** Hozir lock ekranida turibdimi (PIN bor va hali kiritilmagan) */
  isLocked: boolean;
  /** Hydration tugaganmi (SSR/client farqini oldini olish uchun) */
  hydrated: boolean;
  /** PIN ni kiritib tekshirish. Mos kelsa unlock qiladi va true qaytaradi */
  verifyPin: (pin: string) => boolean;
  /** Yangi PIN o'rnatish (avval PIN bo'lmagan holatda) */
  setPin: (pin: string) => Promise<void>;
  /** Eski PIN ni almashtirish */
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  /** PIN ni o'chirish (eski PIN talab qilinadi) */
  removePin: (oldPin: string) => Promise<boolean>;
  /** Qulflash (masalan keyinroq qaytib kirish uchun) */
  lock: () => void;
};

const PinContext = createContext<PinContextValue | undefined>(undefined);

export function PinProvider({ children }: { children: ReactNode }) {
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydration: Preferences'dan PIN o'qish
  useEffect(() => {
    async function loadPin() {
      try {
        const raw = await db.getItem(PIN_KEY);
        if (raw && /^\d{4}$/.test(raw)) {
          setStoredPin(raw);
          setIsLocked(true);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }
    loadPin();
  }, []);

  const persist = async (pin: string | null) => {
    try {
      if (pin) await db.setItem(PIN_KEY, pin);
      else await db.removeItem(PIN_KEY);
    } catch {
      /* ignore */
    }
  };

  const verifyPin = (pin: string) => {
    if (!storedPin) return false;
    if (pin === storedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setPin = async (pin: string) => {
    if (pin.length !== PIN_LEN || !/^\d+$/.test(pin)) return;
    setStoredPin(pin);
    await persist(pin);
    setIsLocked(false);
  };

  const changePin = async (oldPin: string, newPin: string) => {
    if (oldPin !== storedPin) return false;
    if (newPin.length !== PIN_LEN || !/^\d+$/.test(newPin)) return false;
    setStoredPin(newPin);
    await persist(newPin);
    return true;
  };

  const removePin = async (oldPin: string) => {
    if (oldPin !== storedPin) return false;
    setStoredPin(null);
    await persist(null);
    setIsLocked(false);
    return true;
  };

  const lock = () => {
    if (storedPin) setIsLocked(true);
  };

  const value: PinContextValue = {
    hasPin: !!storedPin,
    isLocked,
    hydrated,
    verifyPin,
    setPin,
    changePin,
    removePin,
    lock,
  };

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>;
}

export function usePin() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error("usePin must be used within PinProvider");
  return ctx;
}
