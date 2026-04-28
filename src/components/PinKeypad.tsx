import { Delete } from "lucide-react";

type PinKeypadProps = {
  onDigit: (d: string) => void;
  onDelete: () => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinKeypad({ onDigit, onDelete }: PinKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-y-6 gap-x-12 px-4">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onDigit(k)}
          className="select-none text-center text-3xl font-semibold text-foreground transition-opacity active:opacity-50"
        >
          {k}
        </button>
      ))}
      <span aria-hidden />
      <button
        type="button"
        onClick={() => onDigit("0")}
        className="select-none text-center text-3xl font-semibold text-foreground transition-opacity active:opacity-50"
      >
        0
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="O'chirish"
        className="flex items-center justify-center text-foreground/80 transition-opacity active:opacity-50"
      >
        <span className="flex h-10 w-12 items-center justify-center rounded-xl bg-surface-elevated">
          <Delete className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
}

export function PinDots({
  length,
  total,
  shake,
}: {
  length: number;
  total: number;
  shake?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${shake ? "animate-pin-shake" : ""}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < length;
        return (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              filled ? "bg-foreground" : "bg-muted-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}
