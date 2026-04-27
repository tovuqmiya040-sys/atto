import { useRef, useState } from "react";
import { useCards } from "@/context/cards-context";

type BalanceCardProps = {
  /** Karta ustiga bosilganda chaqiriladi (Transport ekranida — CardActionsSheet) */
  onCardClick?: () => void;
};

export function BalanceCard({ onCardClick }: BalanceCardProps) {
  const { cards, activeIndex, setActiveIndex } = useCards();
  const card = cards[activeIndex] ?? cards[0];

  const startX = useRef<number | null>(null);
  const [dragDx, setDragDx] = useState(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    setDragDx(0);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current == null) return;
    setDragDx(e.clientX - startX.current);
  };
  const endSwipe = () => {
    if (startX.current == null) return;
    const dx = dragDx;
    const threshold = 50;
    if (dx < -threshold && activeIndex < cards.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (dx > threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (Math.abs(dx) < 6 && onCardClick) {
      // Tap (sezilarli swipe emas) — karta amallari sheetini ochamiz
      onCardClick();
    }
    startX.current = null;
    setDragDx(0);
  };

  return (
    <div className="px-5">
      <div
        role={onCardClick ? "button" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        onPointerLeave={endSwipe}
        className="relative overflow-hidden rounded-2xl card-atto-bg p-6 text-white shadow-xl aspect-[1.6/1] touch-pan-y select-none cursor-pointer"
        style={{
          transform: `translate3d(${dragDx * 0.25}px,0,0)`,
          transition: startX.current == null ? "transform 220ms ease" : "none",
        }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 card-pattern-atto pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="text-lg font-medium">{card.label}</div>
            <div className="text-right">
              <div className="text-xl font-bold tracking-wide">ATTO</div>
              <div
                className="mt-1 text-[11px] font-extrabold tracking-[0.2em]"
                style={{ color: "#22c55e" }}
              >
                VIRTUAL
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">
              {card.balance}
            </span>
            <span className="text-sm opacity-80">UZS</span>
          </div>

          {/* Card number */}
          <div className="font-mono text-[1.05rem] tracking-[0.15em] text-white/25">
            {card.number}
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      {cards.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {cards.map((c, i) => (
            <button
              key={c.id}
              aria-label={`${c.label} karta`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex
                  ? "w-4 bg-foreground"
                  : "w-1.5 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
