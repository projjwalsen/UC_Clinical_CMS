"use client";

import { Toaster } from "sonner";
import { DemoStoreProvider, useDemoStore } from "@/lib/demo-store";
import { LoadingState } from "@/components/ui/core";
import { Login } from "@/components/auth/login";
import { AppShell } from "@/components/layout/app-shell";

function Application() {
  const { ready, authenticated } = useDemoStore();
  if (!ready) return <LoadingState />;
  return authenticated ? <AppShell /> : <Login />;
}

export default function Home() {
  return (
    <DemoStoreProvider>
      <Application />
      <Toaster position="top-right" richColors />
    </DemoStoreProvider>
  );
}
