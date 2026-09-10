"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  HISTOLOGY_SECTIONS,
  parametersForSection,
} from "@/data/histology-lookups";
import { YES_NO } from "@/data/lookups";
import {
  buildHistopathologyFormState,
  emptyHistopathologyRow,
  histopathologyFormToRecords,
  type HistopathologyFormState,
  type HistopathologyRowState,
} from "@/lib/histopathology-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { HistopathologyRecord, Visit } from "@/types/clinical";

function applyRowPatch(
  row: HistopathologyRowState,
  patch: Partial<HistopathologyRowState>,
): HistopathologyRowState {
  const next = { ...row, ...patch };

  if (patch.section && patch.section !== row.section) {
    return {
      ...next,
      section: patch.section,
      parameter: "",
      present: "",
      scoreGrade: "",
      histopathologyScore: "",
      remarks: row.remarks,
    };
  }

  return next;
}

export function HistopathologyForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (records: HistopathologyRecord[]) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<HistopathologyFormState>(() =>
    buildHistopathologyFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const batchId = useMemo(
    () => `HIST-${patientId}-${Date.now()}`,
    [patientId],
  );

  const updateRow = (id: string, patch: Partial<HistopathologyRowState>) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.id === id ? applyRowPatch(row, patch) : row,
      ),
    }));
    setErrors((current) => ({ ...current, [id]: "", rows: "" }));
  };

  const addRow = () => {
    setForm((current) => ({
      ...current,
      rows: [
        emptyHistopathologyRow(current.rows[0]?.section),
        ...current.rows,
      ],
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
    if (!form.date) next.date = "Examination date is required.";
    if (!form.rows.length) next.rows = "Add at least one parameter.";
    form.rows.forEach((row) => {
      if (!row.section) next[row.id] = "Select a section.";
      else if (!row.parameter) next[row.id] = "Select a parameter.";
      else if (!row.present) next[row.id] = "Select present status.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(histopathologyFormToRecords(form, patientId, batchId));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Field label="Examination date" required error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm((current) => ({ ...current, date: e.target.value }));
                setErrors((current) => ({ ...current, date: "" }));
              }}
            />
          </Field>
          <Field label="Linked visit">
            <Select
              className="w-full"
              value={form.visitId}
              onChange={(e) =>
                setForm((current) => ({ ...current, visitId: e.target.value }))
              }
            >
              <option value="">Not linked</option>
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
              Histopathology parameters
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              New parameters are added at the top. Choose a section to filter
              available parameters.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={addRow}>
            <Plus className="size-4" />
            Add parameter
          </Button>
        </div>

        {errors.rows && (
          <p className="mb-3 text-xs text-red-600">{errors.rows}</p>
        )}

        <div className="space-y-4">
          {form.rows.map((row, index) => {
            const parameters = parametersForSection(row.section);
            return (
              <div
                key={row.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    Parameter: {row.parameter || "N/A"}
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
                  <Field label="Section" required>
                    <Select
                      className="w-full"
                      value={row.section}
                      onChange={(e) =>
                        updateRow(row.id, { section: e.target.value })
                      }
                    >
                      {HISTOLOGY_SECTIONS.map((section) => (
                        <option key={section}>{section}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Parameter" required>
                    <Select
                      className="w-full"
                      value={row.parameter}
                      onChange={(e) =>
                        updateRow(row.id, { parameter: e.target.value })
                      }
                    >
                      <option value="">Select parameter</option>
                      {parameters.map((parameter) => (
                        <option key={parameter}>{parameter}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Present" required>
                    <Select
                      className="w-full"
                      value={row.present}
                      onChange={(e) =>
                        updateRow(row.id, { present: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      {YES_NO.filter((value) => value !== "Not known").map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </Select>
                  </Field>
                  <Field label="Score grade">
                    <Input
                      value={row.scoreGrade}
                      onChange={(e) =>
                        updateRow(row.id, { scoreGrade: e.target.value })
                      }
                      placeholder="e.g. Mild, Grade 2"
                    />
                  </Field>
                  <Field label="Histopathology score">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={row.histopathologyScore}
                      onChange={(e) =>
                        updateRow(row.id, {
                          histopathologyScore: e.target.value,
                        })
                      }
                      placeholder="Examination summary score"
                    />
                  </Field>
                  <div className="md:col-span-2 xl:col-span-3">
                    <Field label="Remarks">
                      <Textarea
                        value={row.remarks}
                        onChange={(e) =>
                          updateRow(row.id, { remarks: e.target.value })
                        }
                        placeholder="Optional notes for this parameter"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {form.rows.length} parameter{form.rows.length === 1 ? "" : "s"} in
          this batch. Each row saves as a separate histopathology record linked
          to the visit.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save histopathology
        </Button>
      </div>
    </div>
  );
}
