"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  DISEASE_ACTIVITY,
  PREGNANCY_COURSE,
  PREGNANCY_OUTCOME,
  YES_NO,
} from "@/data/lookups";
import {
  buildPregnancyFormState,
  pregnancyFormToRecords,
  pregnancySectionLabel,
  resizePregnancyRows,
  suggestNextPregnancyNumber,
  type PregnancyFormState,
  type PregnancyRowState,
} from "@/lib/pregnancy-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { PregnancyRecord } from "@/types/clinical";

const YES_NO_OPTIONS = YES_NO.filter((value) => value !== "Not known");

function SubSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      {description && (
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      )}
      <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function PregnancyPanel({
  row,
  label,
  errors,
  onChange,
}: {
  row: PregnancyRowState;
  label: string;
  errors: Record<string, string>;
  onChange: (patch: Partial<PregnancyRowState>) => void;
}) {
  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Pregnancy year" required error={errors.pregnancyYear}>
          <Input
            type="number"
            min={1900}
            max={2100}
            step={1}
            value={row.pregnancyYear}
            onChange={(e) => onChange({ pregnancyYear: e.target.value })}
          />
        </Field>
        <Field label="Pregnancy month">
          <Input
            type="number"
            min={1}
            max={12}
            step={1}
            value={row.pregnancyMonth}
            onChange={(e) => onChange({ pregnancyMonth: e.target.value })}
            placeholder="1–12"
          />
        </Field>
        <Field label="Duration (weeks)">
          <Input
            type="number"
            min={0}
            step={1}
            value={row.durationWeeks}
            onChange={(e) => onChange({ durationWeeks: e.target.value })}
          />
        </Field>
      </div>

      <SubSection
        title="Disease activity"
        description="Activity and course during pregnancy."
      >
        <Field label="Activity at conception">
          <Select
            className="w-full"
            value={row.activityAtConception}
            onChange={(e) => onChange({ activityAtConception: e.target.value })}
          >
            <option value="">Select</option>
            {DISEASE_ACTIVITY.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Course during pregnancy">
          <Select
            className="w-full"
            value={row.courseDuringPregnancy}
            onChange={(e) =>
              onChange({ courseDuringPregnancy: e.target.value })
            }
          >
            <option value="">Select</option>
            {PREGNANCY_COURSE.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="New UC complication">
          <Select
            className="w-full"
            value={row.newUcComplication}
            onChange={(e) => onChange({ newUcComplication: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
      </SubSection>

      <SubSection title="Pregnancy outcome">
        <Field label="Pregnancy outcome">
          <Select
            className="w-full"
            value={row.pregnancyOutcome}
            onChange={(e) => onChange({ pregnancyOutcome: e.target.value })}
          >
            <option value="">Select</option>
            {PREGNANCY_OUTCOME.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Premature delivery">
          <Select
            className="w-full"
            value={row.prematureDelivery}
            onChange={(e) => onChange({ prematureDelivery: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Forceps delivery">
          <Select
            className="w-full"
            value={row.forcepsDelivery}
            onChange={(e) => onChange({ forcepsDelivery: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Maternal low birth weight">
          <Select
            className="w-full"
            value={row.maternalLowBirthWeightFlag}
            onChange={(e) =>
              onChange({ maternalLowBirthWeightFlag: e.target.value })
            }
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Maternal SGA">
          <Select
            className="w-full"
            value={row.maternalSgaFlag}
            onChange={(e) => onChange({ maternalSgaFlag: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
      </SubSection>

      <SubSection
        title="Infant outcomes"
        description="Follow-up course and infant birth details."
      >
        <Field label="Course after year 1">
          <Select
            className="w-full"
            value={row.courseAfterYear1}
            onChange={(e) => onChange({ courseAfterYear1: e.target.value })}
          >
            <option value="">Select</option>
            {PREGNANCY_COURSE.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Course after year 2">
          <Select
            className="w-full"
            value={row.courseAfterYear2}
            onChange={(e) => onChange({ courseAfterYear2: e.target.value })}
          >
            <option value="">Select</option>
            {PREGNANCY_COURSE.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Infant birth year">
          <Input
            type="number"
            min={1900}
            max={2100}
            step={1}
            value={row.infantBirthYear}
            onChange={(e) => onChange({ infantBirthYear: e.target.value })}
          />
        </Field>
        <Field label="Infant birth weight (kg)">
          <Input
            type="number"
            min={0}
            step={0.01}
            value={row.infantBirthWeightKg}
            onChange={(e) => onChange({ infantBirthWeightKg: e.target.value })}
          />
        </Field>
        <Field label="Congenital malformation">
          <Select
            className="w-full"
            value={row.congenitalMalformation}
            onChange={(e) =>
              onChange({ congenitalMalformation: e.target.value })
            }
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Infant low birth weight">
          <Select
            className="w-full"
            value={row.infantLowBirthWeight}
            onChange={(e) => onChange({ infantLowBirthWeight: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Infant SGA">
          <Select
            className="w-full"
            value={row.infantSga}
            onChange={(e) => onChange({ infantSga: e.target.value })}
          >
            <option value="">Select</option>
            {YES_NO_OPTIONS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
      </SubSection>

      <Field label="Remarks">
        <Textarea
          value={row.remarks}
          onChange={(e) => onChange({ remarks: e.target.value })}
          placeholder={`Optional notes for ${label.toLowerCase()}`}
        />
      </Field>
    </div>
  );
}

export function PregnancyForm({
  patientId,
  existingRecords,
  onCancel,
  onSave,
}: {
  patientId: string;
  existingRecords: PregnancyRecord[];
  onCancel: () => void;
  onSave: (records: PregnancyRecord[]) => void;
}) {
  const startNumber = useMemo(
    () => suggestNextPregnancyNumber(existingRecords),
    [existingRecords],
  );
  const [form, setForm] = useState<PregnancyFormState>(() =>
    buildPregnancyFormState(existingRecords, 1),
  );
  const [openRows, setOpenRows] = useState<Set<string>>(
    () => new Set(form.rows[0] ? [form.rows[0].id] : []),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const batchId = useMemo(
    () => `PREG-${patientId}-${Date.now()}`,
    [patientId],
  );

  const setPregnancyCount = (count: number) => {
    setForm((current) => {
      const rows = resizePregnancyRows(current.rows, count, startNumber);
      setOpenRows((open) => {
        const next = new Set(open);
        rows.forEach((row) => {
          if (!current.rows.some((existing) => existing.id === row.id)) {
            next.add(row.id);
          }
        });
        return next;
      });
      return { rows };
    });
  };

  const toggleRow = (id: string) => {
    setOpenRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateRow = (id: string, patch: Partial<PregnancyRowState>) => {
    setForm((current) => ({
      rows: current.rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }));
    setErrors((current) => ({ ...current, [id]: "", rows: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.rows.length) next.rows = "Add at least one pregnancy.";
    form.rows.forEach((row) => {
      if (!row.pregnancyYear) next[row.id] = "Pregnancy year is required.";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(pregnancyFormToRecords(form, patientId, batchId));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <Field label="Number of pregnancies to record">
            <Input
              type="number"
              min={1}
              max={10}
              step={1}
              value={form.rows.length}
              onChange={(e) =>
                setPregnancyCount(Number(e.target.value) || 1)
              }
            />
          </Field>
          <p className="mt-2 text-xs text-slate-500">
            Each pregnancy opens in its own accordion: First pregnancy, Second
            pregnancy, and so on. Expand or collapse sections as needed.
          </p>
        </div>

        {errors.rows && (
          <p className="mb-3 text-xs text-red-600">{errors.rows}</p>
        )}

        <div className="space-y-3">
          {form.rows.map((row, index) => {
            const label = pregnancySectionLabel(index);
            const isOpen = openRows.has(row.id);
            const summary =
              row.pregnancyYear || row.pregnancyOutcome
                ? [
                    row.pregnancyYear && `Year ${row.pregnancyYear}`,
                    row.pregnancyOutcome,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Not started";

            return (
              <div
                key={row.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  onClick={() => toggleRow(row.id)}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{summary}</p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="size-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-slate-400" />
                  )}
                </button>
                {errors[row.id] && (
                  <p className="px-4 pb-2 text-xs text-red-600">{errors[row.id]}</p>
                )}
                {isOpen && (
                  <div className="border-t border-slate-200 bg-slate-50/40">
                    <PregnancyPanel
                      row={row}
                      label={label}
                      errors={{ pregnancyYear: errors[row.id] }}
                      onChange={(patch) => updateRow(row.id, patch)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {form.rows.length} pregnancy{form.rows.length === 1 ? "" : "ies"} in
          this batch. Not linked to a visit.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save pregnancies
        </Button>
      </div>
    </div>
  );
}
