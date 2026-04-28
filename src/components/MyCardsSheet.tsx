import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  Plus,
  EyeOff,
  Eye,
  Clock,
  ShieldCheck,
  ShieldOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useCards } from "@/context/cards-context";
import { TopupCardSheet } from "@/components/ExtraSheets";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Orqaga tugmasi bosilganda chaqiriladi (asosiy Menyu ga qaytish uchun) */
  onBack?: () => void;
  /** "Tarix" bosilsa transport ichidagi sayr tarixiga ko'chish */
  onOpenHistory?: () => void;
};

/**
 * Rasmdagi "Kartalarim" ekrani — karta va amallar bir vaqtda ko'rinadi.
 * Karta sheet ustida turadi (orqasida ham chiqib turadi).
 */
export function MyCardsSheet({
  open,
  onOpenChange,
  onBack,
  onOpenHistory,
}: Props) {
  const { cards, activeIndex, setActiveIndex, updateCard, addCard, removeCard } =
    useCards();
  const card = cards[activeIndex] ?? cards[0];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: activeIndex,
    align: "center",
    containScroll: "trimSnaps",
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setActiveIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== activeIndex) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [emblaApi, activeIndex]);

  const [hidden, setHidden] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  if (!card) return null;
  const isBlocked = !!card.blocked;

  const handleBlock = async () => {
    if (isBlocked) {
      await updateCard(card.id, { blocked: false });
      toast.success("Karta blokdan ochildi");
    } else {
      await updateCard(card.id, { blocked: true });
      toast.success("Karta bloklandi");
    }
  };

  const handleHistory = () => {
    if (onOpenHistory) {
      onOpenChange(false);
      setTimeout(() => onOpenHistory(), 200);
    } else {
      toast.error("Tarix faqat Transport bo'limida mavjud");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="h-full w-full border-none bg-background p-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">Kartalarim</SheetTitle>

          {/* Header */}
          <header className="flex items-center gap-4 px-4 pt-5 pb-4">
            <button
              onClick={() => {
                onOpenChange(false);
                if (onBack) setTimeout(() => onBack(), 150);
              }}
              aria-label="Orqaga"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
            </button>
            <h1 className="text-xl font-bold">Kartalarim</h1>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setHidden((v) => !v)}
                aria-label="Balansni yashirish"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated/70 text-foreground/90"
              >
                {hidden ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => {
                  setNewName(`Karta ${cards.length + 1}`);
                  setAddOpen(true);
                }}
                aria-label="Karta qo'shish"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated/70 text-foreground/90"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="px-5 pb-2 text-sm text-muted-foreground">
            Transport kartalari
          </div>

          {/* Card Carousel */}
          <div className="mt-3 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {cards.map((c, i) => (
                <div key={c.id} className="min-w-0 flex-[0_0_100%] px-5">
                  <div
                    className="relative overflow-hidden rounded-2xl card-atto-bg p-5 text-white shadow-xl aspect-[1.6/1]"
                  >
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 card-pattern-atto pointer-events-none" />

                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-medium opacity-90">
                            {c.label}
                          </div>
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-4xl xs:text-5xl font-bold tracking-tight">
                              {hidden ? "•••" : c.balance}
                            </span>
                            <span className="text-xs opacity-80 uppercase">
                              uzs
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold tracking-wide">
                            ATTO
                          </div>
                          <div
                            className="mt-1 text-[10px] font-extrabold tracking-[0.2em]"
                            style={{ color: "#22c55e" }}
                          >
                            {c.blocked ? "BLOKLANGAN" : "VIRTUAL"}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-[0.95rem] tracking-[0.12em] text-white/70">
                        {hidden ? "•••• •••• •••• ••••" : c.number}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

          {/* Actions list (rasmdagi pastki sheet) */}
          <div className="mt-5 flex-1 rounded-t-3xl bg-surface pt-2">
            <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/20" />

            <div className="flex flex-col">
              <Row
                label="Karta hisobini to'ldirish"
                icon={<Plus className="h-5 w-5" />}
                onClick={() => setTopupOpen(true)}
              />
              <Row
                label="Tarix"
                icon={<Clock className="h-5 w-5" />}
                onClick={handleHistory}
              />
              <Row
                label={isBlocked ? "Blokdan ochish" : "Bloklash"}
                icon={
                  isBlocked ? (
                    <ShieldOff className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )
                }
                onClick={handleBlock}
              />
              <Row
                label="Nomini tahrirlash"
                icon={<Pencil className="h-5 w-5" />}
                onClick={() => {
                  setRenameValue(card.label);
                  setRenameOpen(true);
                }}
              />
              <Row
                label="O'chirish"
                icon={<Trash2 className="h-5 w-5" />}
                destructive
                onClick={() => {
                  if (cards.length <= 1) {
                    toast.error("Kamida bitta karta qolishi kerak");
                    return;
                  }
                  setConfirmDelete(true);
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* To'ldirish sheeti — tanlangan karta uchun */}
      <TopupCardSheet
        open={topupOpen}
        onOpenChange={setTopupOpen}
        cardId={card.id}
      />

      {/* Rename */}
      <Sheet open={renameOpen} onOpenChange={setRenameOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetTitle className="text-foreground">
            Karta nomini tahrirlash
          </SheetTitle>
          <div className="mt-4 space-y-3">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Karta nomi"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
              autoFocus
            />
            <Button
              className="h-12 w-full rounded-2xl text-base font-semibold"
              onClick={async () => {
                const v = renameValue.trim();
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

      {/* Add new card */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetTitle className="text-foreground">Yangi karta qo'shish</SheetTitle>
          <div className="mt-4 space-y-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Karta nomi"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
              autoFocus
            />
            <Button
              className="h-12 w-full rounded-2xl text-base font-semibold"
              onClick={async () => {
                const v = newName.trim();
                if (!v) {
                  toast.error("Nom kiriting");
                  return;
                }
                const last4 = String(Math.floor(1000 + Math.random() * 9000));
                await addCard({
                  label: v,
                  number: `9987 2200 0025 ${last4}`,
                  balance: "0",
                });
                toast.success("Karta qo'shildi");
                setAddOpen(false);
              }}
            >
              Qo'shish
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
              "{card.label}" kartasi ro'yxatdan o'chiriladi.
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

function Row({
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
      <span className="text-lg font-semibold text-foreground">{label}</span>
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
