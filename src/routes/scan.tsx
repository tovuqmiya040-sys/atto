
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { QrScanner } from "@/components/QrScanner";
import { ArrowLeft } from "lucide-react";

// Yangi /scan yo'nalishini (route) yaratamiz
export const Route = createFileRoute('/scan')({
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();

  const handleScanResult = (result: string) => {
    // Skaner natijasini olgach, trip-detail sahifasiga o'tamiz
    // va natijani `data` parametri orqali jo'natamiz
    navigate({
      to: '/trip-detail',
      search: { data: result }, // Ma'lumotni URLga qo'shamiz
    });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="relative h-full w-full bg-black" data-scanner-page>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={handleGoBack} className="p-2 text-white">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-white">To'lov uchun skanerlang</h1>
        <div className="w-10"></div>
      </div>
      <QrScanner
        active={true} // Bu sahifa ochilishi bilan skaner aktiv bo'ladi
        torch={false} // Chiroq boshida o'chiq
        onResult={handleScanResult} // Natijani ushbu funksiyaga jo'natadi
      />
    </div>
  );
}
