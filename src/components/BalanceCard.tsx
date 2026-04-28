import { useRef, useState } from "react";
import { type Card } from "@/context/cards-context";
import { Plus } from "lucide-react";

type BalanceCardProps = {
  cards: Card[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onCardClick?: () => void; // For existing cards
  onAddCardPlaceholderClick?: () => void; // For the placeholder card
};

export function BalanceCard({ cards, activeIndex, setActiveIndex, onCardClick, onAddCardPlaceholderClick }: BalanceCardProps) {
  const card = cards[activeIndex];
  const startX = useRef<number | null>(null);
  const [dragDx, setDragDx] = useState(0);

  const isAddCardPlaceholder = activeIndex === cards.length;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    setDragDx(e.clientX - startX.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const dx = dragDx;
    const threshold = 50;

    if (dx < -threshold && activeIndex < cards.length) {
      setActiveIndex(activeIndex + 1);
    } else if (dx > threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }

    // Check for a click (minimal drag)
    if (Math.abs(dx) < 10) {
      if (isAddCardPlaceholder && onAddCardPlaceholderClick) {
        onAddCardPlaceholderClick();
      } else if (!isAddCardPlaceholder && onCardClick) {
        onCardClick();
      }
    }

    startX.current = null;
    setDragDx(0);
  };

  const handleLongPress = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isAddCardPlaceholder && Math.abs(dragDx) < 10 && onCardClick) {
      onCardClick();
    }
  };

  return (
    <div className="px-5">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={handleLongPress}
        className={`relative overflow-hidden rounded-2xl shadow-xl aspect-[1.6/1] touch-pan-y select-none cursor-pointer transition-colors ${
            isAddCardPlaceholder ? 'bg-surface' : 'card-atto-bg text-white'
        }`}
        style={{
          transform: `translate3d(${dragDx * 0.25}px, 0, 0)`,
          transition: startX.current === null ? "transform 220ms ease-out" : "none",
        }}
      >
        {isAddCardPlaceholder ? (
            <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-5 text-center text-foreground">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
                    <Plus className="h-8 w-8 text-foreground/80" />
                </div>
                <h2 className="text-lg font-semibold">Kartangizni qo'shing</h2>
                <p className="text-sm text-muted-foreground">Siz ham transport, ham bank kartasini qo'shishingiz mumkin</p>
            </div>
        ) : (
          <>
            <div className="absolute inset-0 card-pattern-atto pointer-events-none" />
            <div className="relative z-10 flex h-full flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-medium opacity-90">{card.label}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl xs:text-5xl font-bold tracking-tight">{card.balance}</span>
                    <span className="text-xs opacity-80 uppercase">uzs</span>
                  </div>
                  {card.blocked && (
                    <div className="mt-2 inline-block rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                      Karta bloklangan
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tracking-wide">ATTO</div>
                  <div className="mt-1 text-[10px] font-extrabold tracking-[0.2em] text-green-400">VIRTUAL</div>
                </div>
              </div>
              <div className="font-mono text-base tracking-[0.12em] text-white/70">
                {card.number}
              </div>
            </div>
          </>
        )}
      </div>
      
      {(cards.length > 0) && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {[...cards, {}].map((_, i) => (
            <button
              key={i}
              aria-label={`Karta ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === activeIndex
                  ? "w-4 bg-foreground"
                  : "bg-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
