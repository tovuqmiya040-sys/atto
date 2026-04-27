import { useEffect, useState } from "react";
import { Plus, Clock, ShieldCheck, ShieldOff, Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCards } from "@/context/cards-context";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Qaysi karta uchun harakat — undefined bo'lsa active karta */
  cardId?: string;
  /** "Tarix" bosilsa Transport ichidagi sayr tarixiga ko'chish uchun */
  onOpenHistory?: () => void;
  /** "Karta hisobini to'ldirish" bosilsa to'lov sheetini ochish uchun */
  onOpenTopup?: () => void;
};

/**
 * Karta ustida amallar sheeti (rasm dizayniga ko'ra):
 *  - Karta hisobini to'ldirish
 *  - Tarix
 *  - Bloklash
 *  - Nomini tahrirlash
 *  - O'chirish
 */
export function CardActionsSheet({
  open,
  onOpenChange,
  cardId,
  onOpenHistory,
  onOpenTopup,
}: Props) {
  const { cards, activeIndex, updateCard, removeCard } = useCards();
  const card =
    (cardId ? cards.find((c) => c.id === cardId) : undefined) ??
    cards[activeIndex];

  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(card?.label ?? "");

  useEffect(() => {
    if (open && card) setName(card.label);
  }, [open, card]);

  if (!card) return null;

  const isBlocked = !!card.blocked;

  const handleBlockToggle = async () => {
    if (isBlocked) {
      await updateCard(card.id, { blocked: false });
      toast.success("Karta blokdan ochildi");
    } else {
      await updateCard(card.id, { blocked: true });
      toast.success("Karta bloklandi");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border bg-surface px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] [&>button.absolute]:hidden"
        >
          <SheetHeader className="px-5 text-left">
            <SheetTitle className="sr-only">Karta amallari</SheetTitle>
          </SheetHeader>

          <div className="mt-2 flex flex-col">
            <ActionRow
              label="Karta hisobini to'ldirish"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => onOpenTopup?.(), 200);
              }}
            />
            <ActionRow
              label="Tarix"
              icon={<Clock className="h-5 w-5" />}
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => onOpenHistory?.(), 200);
              }}
            />
            <ActionRow
              label={isBlocked ? "Blokdan ochish" : "Bloklash"}
              icon={
                isBlocked ? (
                  <ShieldOff className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )
              }
              onClick={handleBlockToggle}
            />
            <ActionRow
              label="Nomini tahrirlash"
              icon={<Pencil className="h-5 w-5" />}
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => setRenameOpen(true), 200);
              }}
            />
            <ActionRow
              label="O'chirish"
              icon={<Trash2 className="h-5 w-5" />}
              destructive
              onClick={() => {
                if (cards.length <= 1) {
                  toast.error("Kamida bitta karta qolishi kerak");
                  return;
                }
                onOpenChange(false);
                setTimeout(() => setConfirmDelete(true), 200);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Rename */}
      <Sheet open={renameOpen} onOpenChange={setRenameOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-foreground">
              Karta nomini tahrirlash
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Karta nomi"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
              autoFocus
            />
            <Button
              className="h-12 w-full rounded-2xl text-base font-semibold"
              onClick={async () => {
                const v = name.trim();
                if (v.length < 1) {
                  toast.error("Nom bo'sh bo'lmasin");
                  return;
                }
                await updateCard(card.id, { label: v });
                toast.success("Karta nomi yangilandi");
                setRenameOpen(false);
              }}
            >
              Saqlash
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kartani o'chirish?</AlertDialogTitle>
            <AlertDialogDescription>
              "{card.label}" kartasi ro'yxatdan o'chiriladi. Bu amalni qaytarib
              bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await removeCard(card.id);
                toast.success("Karta o'chirildi");
                setConfirmDelete(false);
              }}
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
        className={`text-lg font-semibold ${
          destructive ? "text-foreground" : "text-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated ${
          destructive ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {icon}
      </span>
    </button>
  );
}
