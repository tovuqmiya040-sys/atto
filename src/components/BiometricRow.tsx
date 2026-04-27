import { useEffect, useRef, useState } from "react";
import { Hand, Camera, Trash2, ScanLine, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FACE_KEY = "atto-demo-facepay-photo";

export function BiometricRow() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [palmOpen, setPalmOpen] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem(FACE_KEY);
      if (p) setPhoto(p);
    } catch {
      /* ignore */
    }
  }, []);

  const savePhoto = (dataUrl: string | null) => {
    setPhoto(dataUrl);
    try {
      if (dataUrl) localStorage.setItem(FACE_KEY, dataUrl);
      else localStorage.removeItem(FACE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-3">
        {/* FacePay */}
        <button
          onClick={() => setCameraOpen(true)}
          className="flex items-center justify-between gap-2 rounded-2xl bg-card-light p-3 pl-4 text-left shadow-md shadow-black/20 transition-transform active:scale-[0.97]"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-brand/80">
              {photo ? "Faollashtirildi" : "Faollashtirish"}
            </div>
            <div className="text-[15px] font-bold text-brand leading-tight">FacePay</div>
          </div>
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            {photo ? (
              <img
                src={photo}
                alt="FacePay"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <>
                <ScanLine className="absolute inset-0 h-10 w-10 text-brand" strokeWidth={1.75} />
                <User className="h-[18px] w-[18px] text-brand" strokeWidth={2.25} />
              </>
            )}
          </div>
        </button>

        {/* PalmPay */}
        <button
          onClick={() => setPalmOpen(true)}
          className="flex items-center justify-between gap-2 rounded-2xl bg-card-light p-3 pl-4 text-left shadow-md shadow-black/20 transition-transform active:scale-[0.97]"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-brand/80">Faollashtirish</div>
            <div className="text-[15px] font-bold text-brand leading-tight">PalmPay</div>
          </div>
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <ScanLine className="absolute inset-0 h-10 w-10 text-brand" strokeWidth={1.75} />
            <Hand className="h-[18px] w-[18px] text-brand" strokeWidth={2.25} />
          </div>
        </button>
      </div>

      <FacePaySheet
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        photo={photo}
        onSave={savePhoto}
      />
      <PalmPaySheet open={palmOpen} onOpenChange={setPalmOpen} />
    </div>
  );
}

function FacePaySheet({
  open,
  onOpenChange,
  photo,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  photo: string | null;
  onSave: (p: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<"preview" | "capturing">("preview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      stopStream();
      setMode("preview");
      setError(null);
      return;
    }
    // if no photo, immediately start capture
    if (!photo) startCapture();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCapture = async () => {
    setError(null);
    setMode("capturing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setError("Kameraga ruxsat berilmadi");
      setMode("preview");
    }
  };

  const takeShot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const w = video.videoWidth || 480;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    onSave(dataUrl);
    stopStream();
    setMode("preview");
    toast.success("FacePay rasmi saqlandi");
  };

  const handleDelete = () => {
    onSave(null);
    toast.success("Rasm o'chirildi");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>FacePay</SheetTitle>
          <SheetDescription>
            Yuzingizni rasmga oling — tez to'lov uchun
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 overflow-hidden rounded-2xl bg-surface-elevated">
          {mode === "capturing" ? (
            <div className="relative aspect-square bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-white/60" />
            </div>
          ) : photo ? (
            <div className="flex flex-col items-center gap-3 p-5">
              <img
                src={photo}
                alt="FacePay"
                className="h-28 w-28 rounded-full object-cover ring-2 ring-brand/40"
              />
              <div className="text-xs text-muted-foreground">
                Qayta rasmga olish yoki o'chirish uchun tugmani bosing
              </div>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-black/40 text-muted-foreground">
              <Camera className="h-10 w-10" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-center text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-2">
          {mode === "capturing" ? (
            <Button
              onClick={takeShot}
              className="h-12 rounded-2xl bg-brand text-brand-foreground"
            >
              <Camera className="mr-2 h-4 w-4" />
              Rasmga olish
            </Button>
          ) : (
            <Button
              onClick={startCapture}
              className="h-12 rounded-2xl bg-brand text-brand-foreground"
            >
              <Camera className="mr-2 h-4 w-4" />
              {photo ? "Qayta rasmga olish" : "Rasmga olish"}
            </Button>
          )}
          {photo && mode !== "capturing" && (
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="h-12 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Rasmni o'chirish
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-2xl bg-surface-elevated"
          >
            Yopish
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PalmPaySheet({
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
          <SheetTitle>PalmPay</SheetTitle>
        </SheetHeader>
        <div className="mt-4 rounded-2xl border border-border/60 bg-surface-elevated/50 p-6 text-center text-sm font-medium text-muted-foreground">
          PalmPay vaqtinchalik mavjud emas
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
