import { Home, TrendingUp, Bus, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tab = { id: string; label: string; icon: LucideIcon; badge?: boolean };

const TABS: Tab[] = [
  { id: "home", label: "Asosiy", icon: Home },
  { id: "trips", label: "Sayr tarixi", icon: TrendingUp, badge: true },
  { id: "transport", label: "Transport", icon: Bus },
  { id: "menu", label: "Menyu", icon: LayoutGrid },
];

type BottomNavProps = {
  active: string;
  onChange: (id: string) => void;
};

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-md flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
            >
              {isActive && (
                <span className="absolute -top-2 h-0.5 w-8 rounded-full bg-foreground" />
              )}
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                  strokeWidth={2}
                />
                {tab.badge && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
