"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { MEDICATION_ROUTES, MEDICATION_STATUS } from "@/data/lookups";
import {
  buildMedicationFormState,
  emptyMedicationRow,
  medicationFormToRecords,
  type MedicationFormState,
  type MedicationRowState,
} from "@/lib/medication-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { MedicationRecord, Visit } from "@/types/clinical";

export function MedicationForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (records: MedicationRecord[]) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<MedicationFormState>(() =>
    buildMedicationFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const batchId = useMemo(
    () => `MED-${patientId}-${Date.now()}`,
    [patientId],
  );

  const updateRow = (id: string, patch: Partial<MedicationRowState>) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }));
    setErrors((current) => ({ ...current, [id]: "", rows: "", visitId: "" }));
  };

  const addRow = () => {
    setForm((current) => ({
      ...current,
      rows: [emptyMedicationRow(current.rows[0]?.startDate), ...current.rows],
    }));
  };

  const removeRow = (id: string) => {
    setForm((current) => ({
      ...current,
      rows:
        current.rows.length === 1
          ? current.rows
          : current.rows.filter((row) => row.id !== id),
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.visitId) next.visitId = "Linked visit is required.";
    if (!form.rows.length) next.rows = "Add at least one medication.";
    form.rows.forEach((row) => {
      if (!row.drugName) next[row.id] = "Enter a drug name.";
      else if (!row.startDate) next[row.id] = "Start date is required.";
      else if (!row.status) next[row.id] = "Select medication status.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(medicationFormToRecords(form, patientId, batchId));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <Field label="Linked visit" required error={errors.visitId}>
            <Select
              className="w-full"
              value={form.visitId}
              onChange={(e) => {
                setForm((current) => ({ ...current, visitId: e.target.value }));
                setErrors((current) => ({ ...current, visitId: "" }));
              }}
            >
              <option value="">Select visit</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {visit.id} · {visit.type} · {visit.date}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Medication episodes
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              New medications are added at the top. One row per medication
              episode.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={addRow}>
            <Plus className="size-4" />
            Add medication
          </Button>
        </div>

        {errors.rows && (
          <p className="mb-3 text-xs text-red-600">{errors.rows}</p>
        )}

        <div className="space-y-4">
          {form.rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">
                  Medication: {row.drugName || "N/A"}
                  {index === 0 && form.rows.length > 1 && (
                    <span className="ml-2 text-xs font-normal text-teal-700">
                      Latest
                    </span>
                  )}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={form.rows.length === 1}
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
              {errors[row.id] && (
                <p className="mb-3 text-xs text-red-600">{errors[row.id]}</p>
              )}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Drug name" required>
                  <Input
                    value={row.drugName}
                    onChange={(e) =>
                      updateRow(row.id, { drugName: e.target.value })
                    }
                    placeholder="e.g. Mesalamine, Infliximab"
                  />
                </Field>
                <Field label="Dose">
                  <Input
                    value={row.dose}
                    onChange={(e) =>
                      updateRow(row.id, { dose: e.target.value })
                    }
                    placeholder="e.g. 500 mg twice daily"
                  />
                </Field>
                <Field label="Route">
                  <Select
                    className="w-full"
                    value={row.route}
                    onChange={(e) =>
                      updateRow(row.id, { route: e.target.value })
                    }
                  >
                    {MEDICATION_ROUTES.map((route) => (
                      <option key={route}>{route}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Start date" required>
                  <Input
                    type="date"
                    value={row.startDate}
                    onChange={(e) =>
                      updateRow(row.id, { startDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="End date">
                  <Input
                    type="date"
                    value={row.endDate}
                    onChange={(e) =>
                      updateRow(row.id, { endDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="Status" required>
                  <Select
                    className="w-full"
                    value={row.status}
                    onChange={(e) =>
                      updateRow(row.id, { status: e.target.value })
                    }
                  >
                    {MEDICATION_STATUS.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Indication">
                  <Input
                    value={row.indication}
                    onChange={(e) =>
                      updateRow(row.id, { indication: e.target.value })
                    }
                    placeholder="Clinical indication"
                  />
                </Field>
                <div className="md:col-span-2 xl:col-span-3">
                  <Field label="Adherence notes">
                    <Textarea
                      value={row.adherenceNotes}
                      onChange={(e) =>
                        updateRow(row.id, { adherenceNotes: e.target.value })
                      }
                      placeholder="Notes on adherence or tolerance"
                    />
                  </Field>
                </div>
                <div className="md:col-span-2 xl:col-span-3">
                  <Field label="Remarks">
                    <Textarea
                      value={row.remarks}
                      onChange={(e) =>
                        updateRow(row.id, { remarks: e.target.value })
                      }
                      placeholder="Optional notes for this medication"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {form.rows.length} medication{form.rows.length === 1 ? "" : "s"} in
          this batch. Each row saves as a separate medication record linked to
          the visit.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save medications
        </Button>
      </div>
    </div>
  );
}
