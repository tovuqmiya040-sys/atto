import { ChevronLeft } from "lucide-react";
import { usePin } from "@/context/pin-context";

type TransportHeaderProps = {
  /** Hozirgi tab — agar "home" bo'lsa back tugmasi PIN ekraniga qaytaradi */
  tab?: string;
  /** Boshqa tabda bo'lsa, back home'ga qaytaradi */
  onBackToHome?: () => void;
  /** Sarlavha (default: "Transport") */
  title?: string;
};

export function TransportHeader({
  tab = "home",
  onBackToHome,
  title = "Transport",
}: TransportHeaderProps) {
  const { hasPin, lock } = usePin();

  const handleBack = () => {
    // Hamma tablarda back tugmasi yuqori darajaga (ATTO Home yoki home) qaytaradi.
    if (onBackToHome) {
      onBackToHome();
      return;
    }
    if (hasPin) lock();
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-center bg-background/95 px-5 pt-5 pb-4 backdrop-blur-md">
      <button
        aria-label="Orqaga"
        onClick={handleBack}
        className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full text-foreground/90 hover:bg-surface-elevated transition-colors"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
      </button>

      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
    </header>
  );
}
