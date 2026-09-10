"use client";

import {
  Activity,
  Beaker,
  CalendarDays,
  FileHeart,
  Pill,
  Plus,
  ScanLine,
} from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import {
  Badge,
  Button,
  Card,
  PageHeader,
  StatusBadge,
} from "@/components/ui/core";
import { formatDate } from "@/lib/utils";
import { formatLabResult } from "@/lib/lab-utils";

export function ClinicalRecordsPage({
  onPatient,
}: {
  onPatient: (id: string) => void;
}) {
  const { patients, records } = useDemoStore();
  const modules = [
    ["Visits", records.visits.length, CalendarDays],
    ["Symptoms", records.symptoms.length, Activity],
    ["Laboratory results", records.labs.length, Beaker],
    ["Medications", records.medications.length, Pill],
    [
      "Procedures",
      records.endoscopies.length + records.surgeries.length,
      ScanLine,
    ],
    ["Outcomes", records.outcomes.length, FileHeart],
  ] as const;
  const recent = [
    ...records.visits.map((r) => ({
      ...r,
      module: "Visit",
      summary: `${r.type} · ${r.clinicalState}`,
    })),
    ...records.labs.map((r) => ({
      ...r,
      module: "Laboratory",
      summary: `${r.testName}: ${formatLabResult(r)}`,
    })),
    ...records.relapses.map((r) => ({
      ...r,
      module: "Relapse",
      summary: `${r.cause} · ${r.outcome}`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
  return (
    <div>
      <PageHeader
        eyebrow="Longitudinal records"
        title="Clinical records"
        description="Workbook-aligned observations linked by patient and visit identifiers."
        actions={
          <Button onClick={() => recent[0] && onPatient(recent[0].patientId)}>
            <Plus className="size-4" />
            Add clinical record
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {modules.map(([label, count, Icon]) => (
          <Card key={label} className="p-4">
            <span className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
              <Icon className="size-4" />
            </span>
            <p className="mt-3 text-2xl font-bold">{count}</p>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-sm font-bold">Recent clinical activity</h2>
            <p className="text-xs text-slate-500">
              Newest synthetic observations across all modules.
            </p>
          </div>
          <Badge tone="teal">Local data</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">Summary</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => {
                const p = patients.find((x) => x.id === r.patientId);
                return (
                  <tr
                    key={`${r.id}-${i}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{p?.name}</p>
                      <p className="text-xs text-teal-700">{r.patientId}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.module} />
                    </td>
                    <td className="px-5 py-3 text-slate-600">{r.summary}</td>
                    <td className="px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPatient(r.patientId)}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
