import { useEffect, useState } from "react";
import { usePin } from "@/context/pin-context";
import { PinDots, PinKeypad } from "@/components/PinKeypad";

const PIN_LEN = 4;

export function PinLockScreen() {
  const { verifyPin } = usePin();
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  // Toliq kiritilganda tekshirish
  useEffect(() => {
    if (pin.length !== PIN_LEN) return;
    const ok = verifyPin(pin);
    if (!ok) {
      setShake(true);
      const t1 = setTimeout(() => {
        setPin("");
        setShake(false);
      }, 450);
      return () => clearTimeout(t1);
    }
  }, [pin, verifyPin]);

  const onDigit = (d: string) => {
    setPin((prev) => (prev.length >= PIN_LEN ? prev : prev + d));
  };
  const onDelete = () => setPin((prev) => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">PIN-kodni kiriting</h1>
      </div>

      <div className="mt-16 flex flex-1 flex-col items-center">
        <PinDots length={pin.length} total={PIN_LEN} shake={shake} />

        <div className="mt-auto w-full max-w-xs">
          <PinKeypad onDigit={onDigit} onDelete={onDelete} />
        </div>
      </div>

      <div className="mt-6 flex justify-start px-5">
        <button
          type="button"
          onClick={() => {
            /* hech narsa qilmaydi — vazifasiz tugma */
          }}
          className="rounded-xl bg-surface-elevated px-4 py-2 text-xs font-medium text-foreground/80"
        >
          hisobdan chiqish
        </button>
      </div>
    </div>
  );
}
