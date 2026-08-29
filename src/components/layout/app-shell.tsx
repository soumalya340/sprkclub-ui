"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Footer } from "./footer";
import { Nav } from "./nav";
import { useSprkStore } from "@/lib/sprk-store";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useSprkStore.persist.rehydrate();
    useSprkStore.getState().setHydrated(true);
  }, []);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "!bg-card !text-card-foreground !border-border !font-sans",
        }}
      />
    </div>
  );
}
