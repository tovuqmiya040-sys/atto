import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as db from "../lib/db";

const USER_KEY = "atto_user_v1";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
};

type UserContextValue = {
  /** Hydration tugaganmi (SSR/client farqini oldini olish) */
  hydrated: boolean;
  /** Onboarding o'tkazilganmi (ism kiritilganmi) */
  isOnboarded: boolean;
  /** Joriy profil — agar onboarding qilinmagan bo'lsa, default "Mehmon" */
  profile: UserProfile;
  /** Profilni butunlay yangilash (onboarding yoki tahrirlash) */
  setProfile: (p: UserProfile) => Promise<void>;
  /** Profilni qisman yangilash */
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  /** To'liq displayName: "Ism Familya" yoki faqat ism */
  displayName: string;
};

const DEFAULT_PROFILE: UserProfile = {
  firstName: "Mehmon",
  lastName: "",
  phone: "",
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const raw = await db.getItem(USER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as UserProfile;
          if (
            parsed &&
            typeof parsed.firstName === "string" &&
            parsed.firstName.trim().length > 0
          ) {
            setProfileState({
              firstName: parsed.firstName,
              lastName: parsed.lastName ?? "",
              phone: parsed.phone ?? "",
            });
            setIsOnboarded(true);
          }
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }
    loadUser();
  }, []);

  const persist = async (p: UserProfile) => {
    try {
      await db.setItem(USER_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  };

  const setProfile = async (p: UserProfile) => {
    const clean: UserProfile = {
      firstName: p.firstName.trim(),
      lastName: p.lastName.trim(),
      phone: p.phone.trim(),
    };
    setProfileState(clean);
    await persist(clean);
    setIsOnboarded(clean.firstName.length > 0);
  };

  const updateProfile = async (patch: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next: UserProfile = {
        firstName: (patch.firstName ?? prev.firstName).trim(),
        lastName: (patch.lastName ?? prev.lastName).trim(),
        phone: (patch.phone ?? prev.phone).trim(),
      };
      persist(next);
      if (next.firstName.length > 0) setIsOnboarded(true);
      return next;
    });
  };

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    "Mehmon";

  const value: UserContextValue = {
    hydrated,
    isOnboarded,
    profile,
    setProfile,
    updateProfile,
    displayName,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
