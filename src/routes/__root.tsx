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

// Removed the faulty import of ContextMenuProvider

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
      <div style={{/* splash screen styles */}}>
         {/* splash screen content */}
      </div>
    );
  }

  return (
    <>
      {children}
      {!isOnboarded && <OnboardingScreen />}
      {isOnboarded && isLocked && <PinLockScreen />}
    </>
  );
}

function RootComponent() {
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
            {/* Removed the faulty ContextMenuProvider wrapper */}
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
