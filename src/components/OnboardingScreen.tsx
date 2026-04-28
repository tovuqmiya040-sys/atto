import { useState, type FormEvent } from "react";
import { useUser } from "@/context/user-context";
import { usePin } from "@/context/pin-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Ilk marta ochilganda chiqadigan ekran — ism / familya / telefon so'raydi.
 * Onboarding yakunlangach localStorage'ga saqlaydi va o'zi yopiladi.
 */
export function OnboardingScreen() {
  const { setProfile } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const f = firstName.trim();
    const l = lastName.trim();
    const p = phone.trim();

    if (!f || !l || p.length < 13) {
      setError("Iltimos, barcha maydonlarni to'g'ri to'ldiring");
      return;
    }

    await setProfile({
      firstName: f,
      lastName: l,
      phone: p,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="px-6">
        <div className="text-4xl font-black tracking-tighter">
          AT<span className="text-success">TO</span>
        </div>
      </div>

      <div className="mt-8 flex-1 overflow-y-auto px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Xush kelibsiz!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ilovadan foydalanishni boshlash uchun o'zingiz haqingizda qisqacha
          ma'lumot kiriting.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ism
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ismingiz"
              className="h-12 rounded-2xl bg-surface text-base"
              autoFocus
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
              className="h-12 rounded-2xl bg-surface text-base"
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
              className="h-12 rounded-2xl bg-surface text-base"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/15 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 h-12 w-full rounded-2xl text-base font-semibold"
          >
            Davom etish
          </Button>
        </form>
      </div>
    </div>
  );
}
