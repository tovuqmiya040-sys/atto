import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onBack?: () => void;
};

/**
 * Menyu → "Shaxsiy ma'lumotlar" qatori bosilganda ochiladi.
 * Ism / Familya / Telefon raqamini tahrirlash.
 */
export function PersonalInfoSheet({ open, onOpenChange, onBack }: Props) {
  const { profile, setProfile } = useUser();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone || "+998 ");

  // Sheet ochilganda joriy qiymatlardan boshlash
  useEffect(() => {
    if (open) {
      setFirstName(profile.firstName === "Mehmon" ? "" : profile.firstName);
      setLastName(profile.lastName);
      setPhone(profile.phone || "+998 ");
    }
  }, [open, profile]);

  const formatPhone = (raw: string) => {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("998")) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    let out = "+998";
    if (digits.length > 0) out += " " + digits.slice(0, 2);
    if (digits.length > 2) out += " " + digits.slice(2, 5);
    if (digits.length > 5) out += " " + digits.slice(5, 7);
    if (digits.length > 7) out += " " + digits.slice(7, 9);
    return out;
  };

  const onSave = async () => {
    const fn = firstName.trim();
    if (fn.length < 2) {
      toast.error("Ismni kiriting");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 12) {
      toast.error("Telefon raqami to'liq emas");
      return;
    }
    await setProfile({ firstName: fn, lastName: lastName.trim(), phone });
    toast.success("Ma'lumotlar saqlandi");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="h-full w-full border-none bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => onBack(), 150);
                }}
                className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/90 hover:bg-accent"
                aria-label="Orqaga"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <SheetTitle className="text-2xl font-bold">
              Shaxsiy ma'lumotlar
            </SheetTitle>
          </div>
          <SheetDescription className="text-muted-foreground">
            Ism, familya va telefon raqamini tahrirlash
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ism
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ism"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Familya
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Familya"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Telefon raqami
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              inputMode="tel"
              placeholder="+998 90 123 45 67"
              className="h-12 rounded-2xl bg-surface-elevated text-base"
            />
          </div>

          <Button
            onClick={onSave}
            className="mt-2 h-12 w-full rounded-2xl text-base font-semibold"
          >
            Saqlash
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
