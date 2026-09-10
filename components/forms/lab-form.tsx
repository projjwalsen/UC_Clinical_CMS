"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  ABNORMAL_FLAGS,
  LAB_CATEGORIES,
  testsForCategory,
} from "@/data/lab-lookups";
import { CMV_METHODS } from "@/data/lookups";
import { getLabTestReference } from "@/data/lab-reference-ranges";
import {
  applyTestDefaults,
  buildLabFormState,
  computeAbnormalFlag,
  emptyLabRow,
  labFormToRecords,
  type LabFormState,
  type LabRowState,
} from "@/lib/lab-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { LaboratoryResult, Visit } from "@/types/clinical";

function applyRowPatch(row: LabRowState, patch: Partial<LabRowState>): LabRowState {
  const next = { ...row, ...patch };

  if (patch.category && patch.category !== row.category) {
    return {
      ...next,
      category: patch.category,
      testName: "",
      resultNumeric: "",
      resultText: "",
      unit: "",
      referenceRange: "",
      abnormalFlag: "Normal",
      cmvMethod: "",
      remarks: row.remarks,
    };
  }

  if (patch.testName && patch.testName !== row.testName) {
    return {
      ...next,
      ...applyTestDefaults(patch.testName, row.category),
      resultNumeric: "",
      cmvMethod: "",
      remarks: row.remarks,
    };
  }

  if (patch.resultNumeric !== undefined && patch.resultNumeric !== "") {
    const numeric = Number(patch.resultNumeric);
    if (!Number.isNaN(numeric)) {
      const flag = computeAbnormalFlag(next.testName, numeric);
      if (flag) next.abnormalFlag = flag;
    }
  }

  return next;
}

export function LabForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (records: LaboratoryResult[]) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<LabFormState>(() =>
    buildLabFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const batchId = useMemo(() => `LAB-${patientId}-${Date.now()}`, [patientId]);

  const updateRow = (id: string, patch: Partial<LabRowState>) => {
    setForm((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.id === id ? applyRowPatch(row, patch) : row,
      ),
    }));
    setErrors((current) => ({ ...current, [id]: "" }));
  };

  const addRow = () => {
    setForm((current) => ({
      ...current,
      rows: [emptyLabRow(current.rows[0]?.category), ...current.rows],
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
    if (!form.date) next.date = "Specimen date is required.";
    if (!form.rows.length) next.rows = "Add at least one test.";
    form.rows.forEach((row) => {
      if (!row.category) next[row.id] = "Select a category.";
      else if (!row.testName) next[row.id] = "Select a test name.";
      else if (!row.resultNumeric && !row.resultText)
        next[row.id] = "Enter a numeric or text result.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(labFormToRecords(form, patientId, batchId));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Field label="Specimen date" required error={errors.date}>
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

        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 py-3 backdrop-blur">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Laboratory tests</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              New tests are added at the top. Reference range and unit pre-fill
              from the lab reference sheet.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={addRow}>
            <Plus className="size-4" />
            Add test
          </Button>
        </div>

        {errors.rows && (
          <p className="mb-3 text-xs text-red-600">{errors.rows}</p>
        )}

        <div className="space-y-4">
          {form.rows.map((row, index) => {
            const tests = testsForCategory(row.category);
            const ref = getLabTestReference(row.testName);
            return (
              <div
                key={row.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    Test: {row.testName || "N/A"}
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
                  <Field label="Category" required>
                    <Select
                      className="w-full"
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.id, { category: e.target.value })
                      }
                    >
                      {LAB_CATEGORIES.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Test name" required>
                    <Select
                      className="w-full"
                      value={row.testName}
                      onChange={(e) =>
                        updateRow(row.id, { testName: e.target.value })
                      }
                    >
                      <option value="">Select test</option>
                      {tests.map((test) => (
                        <option key={test}>{test}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Numeric result">
                    <Input
                      type="number"
                      value={row.resultNumeric}
                      onChange={(e) =>
                        updateRow(row.id, { resultNumeric: e.target.value })
                      }
                      placeholder={
                        ref?.resultType === "Qualitative"
                          ? "Optional for qualitative tests"
                          : "Preferred for analytics"
                      }
                    />
                  </Field>
                  <Field label="Text / qualitative result">
                    <Input
                      value={row.resultText}
                      onChange={(e) =>
                        updateRow(row.id, { resultText: e.target.value })
                      }
                      placeholder={
                        ref?.normalText ?? "e.g. Positive, Negative"
                      }
                    />
                  </Field>
                  <Field label="Unit">
                    <Input
                      value={row.unit}
                      onChange={(e) =>
                        updateRow(row.id, { unit: e.target.value })
                      }
                      placeholder="Auto-filled from reference"
                    />
                  </Field>
                  <Field label="Reference range">
                    <p className="text-sm font-bold text-slate-800">
                      {row.referenceRange || "—"}
                    </p>
                  </Field>
                  <Field label="Abnormal flag">
                    <Select
                      className="w-full"
                      value={row.abnormalFlag}
                      onChange={(e) =>
                        updateRow(row.id, { abnormalFlag: e.target.value })
                      }
                    >
                      {ABNORMAL_FLAGS.map((flag) => (
                        <option key={flag}>{flag}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="CMV method">
                    <Select
                      className="w-full"
                      value={row.cmvMethod}
                      onChange={(e) =>
                        updateRow(row.id, { cmvMethod: e.target.value })
                      }
                    >
                      <option value="">Select method</option>
                      {CMV_METHODS.map((method) => (
                        <option key={method}>{method}</option>
                      ))}
                    </Select>
                  </Field>
                  <div className="md:col-span-2 xl:col-span-3">
                    <Field label="Remarks">
                      <Textarea
                        value={row.remarks}
                        onChange={(e) =>
                          updateRow(row.id, { remarks: e.target.value })
                        }
                        placeholder="Optional notes for this test"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {form.rows.length} test{form.rows.length === 1 ? "" : "s"} in this
          batch. Each row saves as a separate lab result linked to the visit.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save lab results
        </Button>
      </div>
    </div>
  );
}
