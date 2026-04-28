import { Smartphone, Info, ExternalLink, MessageCircle, ChevronLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";

const TG_URL = "https://t.me/Msrfteam";
const TG_HANDLE = "@Msrfteam";
const TG_NAME = "Msr F Team";

export function ActiveDevicesSheet({
  open,
  onOpenChange,
  onBack,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onBack?: () => void;
}) {
  const { profile } = useUser();
  const phone = profile.phone || "—";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full w-full border-none bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onOpenChange(false);
                if (onBack) setTimeout(() => onBack(), 150);
              }}
              aria-label="Orqaga"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <SheetTitle className="text-2xl font-bold">
              Faol qurilmalar
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-elevated p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-foreground">
                Mening telefonim
              </div>
              <div className="text-xs text-muted-foreground">{phone}</div>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
              Faol
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-5 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export function AboutAppSheet({
  open,
  onOpenChange,
  onBack,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onBack?: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full w-full border-none bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onOpenChange(false);
                if (onBack) setTimeout(() => onBack(), 150);
              }}
              aria-label="Orqaga"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <SheetTitle className="text-2xl font-bold">Ilova haqida</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-2xl bg-surface-elevated p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Versiya</span>
            </div>
            <div className="mt-1 text-base font-semibold text-foreground">
              2.6.47 (1)
            </div>
          </div>

          <a
            href={TG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-surface-elevated p-4 transition-colors hover:bg-accent"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Developer
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-foreground">
                  {TG_NAME}
                </div>
                <div className="text-xs text-muted-foreground">{TG_HANDLE}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </a>
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-5 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export function CreditsSheet({
  open,
  onOpenChange,
  title,
  onBack,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  onBack?: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full w-full border-none bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onOpenChange(false);
                if (onBack) setTimeout(() => onBack(), 150);
              }}
              aria-label="Orqaga"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <SheetTitle className="text-2xl font-bold">{title}</SheetTitle>
          </div>
        </SheetHeader>
        <div className="mt-4 rounded-2xl bg-surface-elevated p-5 text-center">
          <div className="text-base font-semibold text-foreground">
            The app created by {TG_HANDLE}
          </div>
          <a
            href={TG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-success hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {TG_URL.replace("https://", "")}
          </a>
        </div>
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

/** Savol/Javob sheeti — Transport menyusidan ochiladi */
export function FaqSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Savol / Javoblar</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3 text-sm">
          <Q
            q="Ilova kim tomonidan yaratilgan?"
            a={`The app created by ${TG_HANDLE}`}
          />
          <Q
            q="Texnik yordam qayerga yozaman?"
            a={`Telegram orqali murojaat qiling: ${TG_HANDLE}`}
          />
          <Q
            q="QR to'lov qanday ishlaydi?"
            a="Avtobusdagi ATTO QR kodni kameraga tutib, balansingizdan to'lov qilasiz."
          />
        </div>

        <a
          href={TG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-success py-3 text-sm font-semibold text-success-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {TG_NAME} — {TG_HANDLE}
        </a>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {TG_URL.replace("https://", "")}
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

function Q({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl bg-surface-elevated p-4">
      <div className="text-sm font-semibold text-foreground">{q}</div>
      <div className="mt-1 text-xs text-muted-foreground">{a}</div>
    </div>
  );
}

/** Biz bilan bog'laning — Telegramni darhol ochadi */
export function ContactSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Biz bilan bog'laning</SheetTitle>
        </SheetHeader>

        <div className="mt-4 rounded-2xl bg-surface-elevated p-5 text-center">
          <div className="text-base font-semibold text-foreground">
            {TG_NAME}
          </div>
          <a
            href={TG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-success hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {TG_URL.replace("https://", "")}
          </a>
        </div>

        <a
          href={TG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-info py-3 text-sm font-semibold text-info-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          Telegram'ni ochish
        </a>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-2 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

/** Terminallar — location muammosi */
export function TerminalsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Terminallar</SheetTitle>
        </SheetHeader>
        <div className="mt-4 rounded-2xl bg-destructive/10 p-5 text-center text-sm font-medium text-destructive">
          Lokatsiya muammolari
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Joylashuvga ruxsat berilmagan yoki xizmat hozircha mavjud emas.
        </p>
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}

/** SMS Xabarnoma — telefon raqami avvaldan ulangan */
export function SmsNotificationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { profile } = useUser();
  const phone = profile.phone || "—";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>SMS Xabarnoma</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-surface-elevated p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Ulangan raqam
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {phone}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
              Faol
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            SMS xabarnomalar shu raqamga yuboriladi. O'zgartirish uchun Shaxsiy
            ma'lumotlar bo'limidan foydalaning.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-surface-elevated text-sm font-semibold"
        >
          Yopish
        </Button>
      </SheetContent>
    </Sheet>
  );
}
