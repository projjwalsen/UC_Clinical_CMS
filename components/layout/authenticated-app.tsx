"use client";

import { Toaster } from "sonner";
import { DemoStoreProvider, useDemoStore } from "@/lib/demo-store";
import { LoadingState } from "@/components/ui/core";
import { Login } from "@/components/auth/login";
import { AppShell } from "@/components/layout/app-shell";

function Gate({
  children,
  shellPage,
  patientId,
}: {
  children?: React.ReactNode;
  shellPage?: string;
  patientId?: string;
}) {
  const { ready, authenticated } = useDemoStore();
  if (!ready) return <LoadingState />;
  if (!authenticated) return <Login />;
  if (children) return <>{children}</>;
  return <AppShell initialPage={shellPage} initialPatientId={patientId} />;
}

export function AuthenticatedApp(props: {
  children?: React.ReactNode;
  shellPage?: string;
  patientId?: string;
}) {
  return (
    <DemoStoreProvider>
      <Gate {...props} />
      <Toaster position="top-right" richColors />
    </DemoStoreProvider>
  );
}
