import { Outlet, Link, createRootRoute } from "@tanstack/react-router";

import { CardsProvider, useCards } from "../context/cards-context";
import { PinProvider, usePin } from "../context/pin-context";
import { UserProvider, useUser } from "../context/user-context";
import { RoutesProvider, useRoutes } from "../context/routes-context";
import { PinLockScreen } from "../components/PinLockScreen";
import { OnboardingScreen } from "../components/OnboardingScreen";
import { Toaster } from "sonner";
import { registerServiceWorker } from "../lib/serviceWorker";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function Gates({ children }: { children: React.ReactNode }) {
  const { isLocked, hydrated: pinHydrated } = usePin();
  const { isOnboarded, hydrated: userHydrated } = useUser();
  const { hydrated: cardsHydrated } = useCards();
  const { hydrated: routesHydrated } = useRoutes();

  const hydrated =
    pinHydrated && userHydrated && cardsHydrated && routesHydrated;

  // Xavfsizlik uchun: agar 3 soniya ichida hidratatsiya bo'lmasa, majburan ochamiz
  const [forcedHydrated, setForcedHydrated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hydrated) {
        console.warn("Hydration timeout - forcing app to show");
        setForcedHydrated(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hydrated]);

  const isReady = hydrated || forcedHydrated;

  useEffect(() => {
    if (isReady && Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          zIndex: 9999
        }}
      >
        <div style={{
          fontSize: '72px',
          fontWeight: '900',
          letterSpacing: '-0.05em',
          color: '#000000',
          fontFamily: 'sans-serif',
          marginBottom: '24px'
        }}>
          AT<span style={{ color: '#22c55e' }}>TO</span>
        </div>
        <div style={{
          fontSize: '20px',
          color: '#666666',
          fontFamily: 'sans-serif'
        }}>
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Onboarding birinchi navbatda — undan keyin PIN. */}
      {!isOnboarded && <OnboardingScreen />}
      {isOnboarded && isLocked && <PinLockScreen />}
    </>
  );
}

function RootComponent() {
  // Service Worker'ni registratsiya qilish
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerServiceWorker();
    }
  }, []);

  return (
    <UserProvider>
      <PinProvider>
        <CardsProvider>
          <RoutesProvider>
            <Gates>
              <Outlet />
            </Gates>
            <Toaster position="top-center" richColors closeButton />
          </RoutesProvider>
        </CardsProvider>
      </PinProvider>
    </UserProvider>
  );
}
