import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  Plus,
  EyeOff,
  Eye,
  MoreVertical,
  Clock,
  ShieldCheck,
  ShieldOff,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useCards, type Card } from "@/context/cards-context";
import { TopupCardSheet } from "@/components/ExtraSheets";
import { toast } from "sonner";

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
          destructive ? "text-destructive" : "text-foreground"
        }`}>
        {label}
      </span>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated ${ destructive ? "text-destructive" : "text-muted-foreground" }`}>
        {icon}
      </span>
    </button>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
};

export function MyCardsPage({ open, onClose, onOpenHistory }: Props) {
  const { cards, activeIndex, setActiveIndex, updateCard, addCard, removeCard } =
    useCards();

  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: activeIndex, align: "center", containScroll: "trimSnaps" });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setActiveIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect) };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== activeIndex) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [emblaApi, activeIndex]);

  const [hidden, setHidden] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [actionsCardId, setActionsCardId] = useState<string | null>(null);
  const [topupCardId, setTopupCardId] = useState<string | null>(null);
  const [renameCard, setRenameCard] = useState<Card | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  const cardForActions = actionsCardId ? cards.find(c => c.id === actionsCardId) : null;

  useEffect(() => {
    if(open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const findCard = (id: string | null) => id ? cards.find(c => c.id === id) : null;

  const handleAction = (callback?: () => void) => {
    setActionsCardId(null);
    setTimeout(() => callback?.(), 150);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex h-full w-full flex-col bg-background animate-in slide-in-from-bottom-full duration-300">
        <header className="flex items-center gap-4 px-4 pt-5 pb-4">
          <button onClick={onClose} aria-label="Orqaga" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground/90 hover:bg-accent">
            <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
          </button>
          <h1 className="text-xl font-bold">Kartalarim</h1>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setHidden((v) => !v)} aria-label="Balansni yashirish" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/70 text-foreground/90">
              {hidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button onClick={() => { setNewName(`Karta ${cards.length + 1}`); setAddOpen(true); }} aria-label="Karta qo'shish" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/70 text-foreground/90">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="px-5 pb-2 text-sm text-muted-foreground">Amallar uchun ··· tugmasini bosing</div>
          <div className="mt-3 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {cards.map((c, i) => (
                <div key={c.id} className="min-w-0 flex-[0_0_100%] px-5">
                   <div className="relative overflow-hidden rounded-2xl card-atto-bg p-5 text-white shadow-xl aspect-[1.6/1] transition-all cursor-pointer" onClick={() => setActiveIndex(i)}>
                    <div className="absolute inset-0 card-pattern-atto pointer-events-none" />
                    <button onClick={(e) => { e.stopPropagation(); setActionsCardId(c.id); }} className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/40 active:bg-black/50">
                       <MoreVertical className="h-5 w-5" />
                    </button>
                    <div className="relative z-10 flex h-full flex-col justify-between">
                       <div className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-medium opacity-90">{c.label}</div>
                          {/* This margin is reduced from mt-3 to mt-2 */}
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-4xl xs:text-5xl font-bold tracking-tight">{hidden ? "•••" : c.balance}</span>
                            <span className="text-xs opacity-80 uppercase">uzs</span>
                          </div>
                          {c.blocked && (
                            <div className="mt-2 inline-block rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                              Karta bloklangan
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold tracking-wide">ATTO</div>
                           <div className="mt-1 text-[10px] font-extrabold tracking-[0.2em] text-green-400">
                            VIRTUAL
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-[0.95rem] tracking-[0.12em] text-white/70">{hidden ? "•••• •••• •••• ••••" : c.number}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {cards.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {cards.map((c, i) => (
                <button key={c.id} aria-label={`${c.label} karta`} onClick={() => emblaApi?.scrollTo(i)} className={`h-1.5 rounded-full transition-all ${ i === activeIndex ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30" }`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====== SHEETS AND DIALOGS (WITH CORRECT Z-INDEX) ====== */}
      
      <Sheet open={!!actionsCardId} onOpenChange={(v) => !v && setActionsCardId(null)}>
        <SheetContent side="bottom" className="z-[200] rounded-t-3xl border-border bg-surface px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] [&>button.absolute]:hidden">
          <SheetHeader className="px-5 text-left">
            <SheetTitle className="sr-only">Karta amallari</SheetTitle>
            <SheetDescription className="sr-only">Tanlangan karta uchun mavjud amallar.</SheetDescription>
          </SheetHeader>
          {cardForActions && (
            <div className="mt-2 flex flex-col">
              <ActionRow label="Karta hisobini to'ldirish" icon={<Plus className="h-5 w-5" />} onClick={() => handleAction(() => setTopupCardId(cardForActions.id))} />
              {onOpenHistory && <ActionRow label="Tarix" icon={<Clock className="h-5 w-5" />} onClick={() => handleAction(onOpenHistory)} />}
              <ActionRow label={cardForActions.blocked ? "Blokdan ochish" : "Bloklash"} icon={cardForActions.blocked ? <ShieldOff className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />} onClick={async () => {
                await updateCard(cardForActions.id, { blocked: !cardForActions.blocked });
                toast.success(cardForActions.blocked ? "Karta blokdan ochildi" : "Karta bloklandi");
                setActionsCardId(null);
              }} />
              <ActionRow label="Nomini tahrirlash" icon={<Pencil className="h-5 w-5" />} onClick={() => handleAction(() => { setRenameValue(cardForActions.label); setRenameCard(cardForActions); })} />
              <ActionRow label="O'chirish" icon={<Trash2 className="h-5 w-5" />} destructive onClick={() => {
                  if (cards.length <= 1) {
                    toast.error("Kamida bitta karta qolishi kerak");
                    return;
                  }
                  handleAction(() => setDeleteCardId(cardForActions.id));
              }} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {topupCardId && <TopupCardSheet open={!!topupCardId} onOpenChange={(v) => !v && setTopupCardId(null)} cardId={topupCardId} />}
      
      {renameCard && <Sheet open={!!renameCard} onOpenChange={(v) => !v && setRenameCard(null)}>
        <SheetContent side="bottom" className="z-[200] rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle className="text-foreground">Karta nomini tahrirlash</SheetTitle>
            <SheetDescription className="sr-only">Yangi nomni kiriting va saqlash tugmasini bosing.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="Karta nomi" className="h-12 rounded-2xl bg-surface-elevated text-base" autoFocus />
            <Button className="h-12 w-full rounded-2xl text-base font-semibold" onClick={async () => {
              const v = renameValue.trim();
              if (v.length < 1) { toast.error("Nom bo'sh bo'lmasin"); return; }
              await updateCard(renameCard.id, { label: v });
              toast.success("Karta nomi yangilandi");
              setRenameCard(null);
            }}>Saqlash</Button>
          </div>
        </SheetContent>
      </Sheet>}

      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="z-[200] rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle className="text-foreground">Yangi karta qo'shish</SheetTitle>
            <SheetDescription className="sr-only">Yangi karta nomini kiriting va qo'shish tugmasini bosing.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Karta nomi" className="h-12 rounded-2xl bg-surface-elevated text-base" autoFocus />
            <Button className="h-12 w-full rounded-2xl text-base font-semibold" onClick={async () => {
              const v = newName.trim();
              if (!v) { toast.error("Nom kiriting"); return; }
              const last4 = String(Math.floor(1000 + Math.random() * 9000));
              await addCard({ label: v, number: `9987 2200 0025 ${last4}`, balance: "0" });
              toast.success("Karta qo'shildi");
              setAddOpen(false);
            }}>Qo'shish</Button>
          </div>
        </SheetContent>
      </Sheet>

      {deleteCardId && (
        <AlertDialog open={!!deleteCardId} onOpenChange={(v) => !v && setDeleteCardId(null)}>
          <AlertDialogContent className="z-[200]">
            <AlertDialogHeader>
              <AlertDialogTitle>Kartani o'chirish?</AlertDialogTitle>
              <AlertDialogDescription>
                `{findCard(deleteCardId)?.label ?? ''}` kartasi ro'yxatdan o'chiriladi. Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                if(deleteCardId) await removeCard(deleteCardId);
                toast.success("Karta o'chirildi");
                setDeleteCardId(null);
              }}>O'chirish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
