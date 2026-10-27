"use client";

import { Database, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/demo-store";
import { Badge, Button, Card, PageHeader, Select } from "@/components/ui/core";

export function SettingsPage() {
  const {
    reset,
    patients,
    reports,
    preferences,
    setClinicalAssistantEnabled,
  } = useDemoStore();
  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Presentation preferences and local demonstration data controls."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <Database />
            </span>
            <div className="flex-1">
              <h2 className="font-bold">Demo data</h2>
              <p className="mt-1 text-sm text-slate-500">
                {patients.length} synthetic patients and {reports.length} saved
                reports are stored in this browser.
              </p>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Resetting removes local edits and restores the original
                synthetic dataset.
              </div>
              <Button
                variant="danger"
                className="mt-4"
                onClick={() => {
                  if (confirm("Reset all local demo data?")) {
                    reset();
                    toast.success("Demo data restored");
                  }
                }}
              >
                <RotateCcw className="size-4" />
                Reset demo data
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <ShieldCheck />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold">Prototype environment</h2>
                <Badge tone="blue">Demo Mode</Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                No backend, database, cloud storage or real authentication is
                connected. Data remains in localStorage on this device.
              </p>
              <label className="mt-4 block text-xs font-bold text-slate-600">
                Display density
                <Select className="mt-1 w-full">
                  <option>Comfortable</option>
                  <option>Compact</option>
                </Select>
              </label>
              <label className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <input type="checkbox" defaultChecked />
                Show synthetic-data notices
              </label>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-violet-50 p-3 text-violet-700">
              <Sparkles />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold">Clinical Assistant</h2>
                <Badge tone="blue">Preview</Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Show a navigation item and preview screen for future AI Q&amp;A
                and custom PDF/Excel reports over inserted clinical data. No
                model or server is connected in this prototype.
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-teal-700"
                  checked={preferences.clinicalAssistantEnabled}
                  onChange={(e) => {
                    setClinicalAssistantEnabled(e.target.checked);
                    toast.success(
                      e.target.checked
                        ? "Clinical Assistant shown in sidebar"
                        : "Clinical Assistant hidden",
                    );
                  }}
                />
                <span>
                  <span className="text-sm font-semibold text-slate-800">
                    Enable Clinical Assistant (preview UI)
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Off by default. Turn on to demo the workspace label and
                    layout before integrating a local LLM.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-bold">Future integration boundary</h2>
          <p className="mt-2 text-sm text-slate-500">
            Replace the functions exposed by{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              lib/demo-store.tsx
            </code>{" "}
            with API queries and mutations. UI components consume typed models
            from{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              types/clinical.ts
            </code>
            , so the presentation layer can remain unchanged.
          </p>
        </Card>
      </div>
    </div>
  );
}
