import { Plus, Clock, ShieldCheck, ShieldOff, Pencil, Trash2, CreditCard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCards } from "@/context/cards-context";
import { toast } from "sonner";

// THIS COMPONENT IS NOW MUCH SIMPLER.
// It does not manage its own state for dialogs anymore.
// It just calls the functions passed as props when an action is clicked.

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cardId?: string;
  onOpenMyCards?: () => void;
  onOpenTopup?: (cardId: string) => void;
  onOpenHistory?: (cardId: string) => void;
  onToggleBlock?: (cardId: string, isBlocked: boolean) => void;
  onRename?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
};

export function CardActionsSheet({
  open,
  onOpenChange,
  cardId,
  onOpenMyCards,
  onOpenTopup,
  onOpenHistory,
  onToggleBlock,
  onRename,
  onDelete,
}: Props) {
  const { cards, activeIndex } = useCards();
  const card =
    (cardId ? cards.find((c) => c.id === cardId) : undefined) ??
    cards[activeIndex];

  // Immediately return if there's no valid card. Prevents crashes.
  if (!card) {
    return null;
  }

  const isBlocked = !!card.blocked;

  // Helper to close the sheet and then call the parent function
  const handleAction = (callback?: () => void) => {
    onOpenChange(false);
    // Timeout to allow sheet to close before parent action (e.g. opening another dialog)
    setTimeout(() => callback?.(), 150);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] [&>button.absolute]:hidden"
      >
        <SheetHeader className="px-5 text-left">
          <SheetTitle className="sr-only">Karta amallari</SheetTitle>
        </SheetHeader>

        <div className="mt-2 flex flex-col">
          {onOpenMyCards && (
            <ActionRow
              label="Barcha kartalar"
              icon={<CreditCard className="h-5 w-5" />}
              onClick={() => handleAction(onOpenMyCards)}
            />
          )}
          {onOpenTopup && (
            <ActionRow
              label="Karta hisobini to'ldirish"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => handleAction(() => onOpenTopup(card.id))}
            />
          )}
          {onOpenHistory && (
            <ActionRow
              label="Tarix"
              icon={<Clock className="h-5 w-5" />}
              onClick={() => handleAction(() => onOpenHistory(card.id))}
            />
          )}
          {onToggleBlock && (
            <ActionRow
              label={isBlocked ? "Blokdan ochish" : "Bloklash"}
              icon={ isBlocked ? <ShieldOff className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" /> }
              onClick={() => handleAction(() => onToggleBlock(card.id, isBlocked))}
            />
          )}
          {onRename && (
            <ActionRow
              label="Nomini tahrirlash"
              icon={<Pencil className="h-5 w-5" />}
              onClick={() => handleAction(() => onRename(card.id))}
            />
          )}
          {onDelete && (
            <ActionRow
              label="O'chirish"
              icon={<Trash2 className="h-5 w-5" />}
              destructive
              onClick={() => {
                if (cards.length <= 1) {
                  toast.error("Kamida bitta karta qolishi kerak");
                  return;
                }
                handleAction(() => onDelete(card.id));
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActionRow({
  label,
  icon,
  onClick,
  destructive,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-border/40 px-5 py-5 text-left transition-colors last:border-b-0 active:bg-surface-elevated"
    >
      <span
        className={`text-lg font-semibold ${ destructive ? "text-destructive" : "text-foreground" }`}
      >
        {label}
      </span>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated ${ destructive ? "text-destructive" : "text-muted-foreground" }`}
      >
        {icon}
      </span>
    </button>
  );
}
