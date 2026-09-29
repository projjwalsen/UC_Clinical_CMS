"use client";

import { useState } from "react";
import { FormSaveActions } from "@/components/forms/form-save-actions";
import { YES_NO } from "@/data/lookups";
import {
  buildOffspringFormState,
  offspringFormToRecord,
  type OffspringFormState,
} from "@/lib/offspring-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { OffspringRecord } from "@/types/clinical";

const YES_NO_OPTIONS = YES_NO.filter((value) => value !== "Not known");

export function OffspringForm({
  patientId,
  lastRecord,
  onCancel,
  onSave,
  onSaveAndContinue,
  continueHint,
}: {
  patientId: string;
  lastRecord?: OffspringRecord | null;
  onCancel: () => void;
  onSave: (record: OffspringRecord) => void;
  onSaveAndContinue?: (record: OffspringRecord) => void;
  continueHint?: string | null;
}) {
  const [form, setForm] = useState<OffspringFormState>(() =>
    buildOffspringFormState(lastRecord),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof OffspringFormState>(
    key: K,
    value: OffspringFormState[K],
  ) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "anyInfertility" && value === "No") {
        next.infertilityPeriodMonths = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.anyInfertility) {
      next.anyInfertility = "Select Yes or No.";
    }
    if (
      form.anyInfertility === "Yes" &&
      form.infertilityPeriodMonths === ""
    ) {
      next.infertilityPeriodMonths = "Enter infertility period in months.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (andContinue = false) => {
    if (!validate()) return;
    const record = offspringFormToRecord(
      form,
      patientId,
      `OFF-${patientId}-${Date.now()}`,
    );
    if (andContinue && onSaveAndContinue) onSaveAndContinue(record);
    else onSave(record);
  };

  const showInfertilityPeriod = form.anyInfertility === "Yes";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {lastRecord && (
          <p className="rounded-lg bg-teal-50 px-4 py-3 text-xs text-teal-800">
            Pre-filled from the last offspring summary for this patient.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Any period of infertility"
            required
            error={errors.anyInfertility}
          >
            <Select
              className="w-full"
              value={form.anyInfertility}
              onChange={(e) => update("anyInfertility", e.target.value)}
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Select>
          </Field>
          {showInfertilityPeriod && (
            <Field
              label="Period (months)"
              required
              error={errors.infertilityPeriodMonths}
            >
              <Input
                type="number"
                min={0}
                step={1}
                value={form.infertilityPeriodMonths}
                onChange={(e) =>
                  update("infertilityPeriodMonths", e.target.value)
                }
                placeholder="Duration in months"
              />
            </Field>
          )}
          <Field label="Total offspring/s">
            <Input
              type="number"
              min={0}
              step={1}
              value={form.totalOffspring}
              onChange={(e) => update("totalOffspring", e.target.value)}
            />
          </Field>
          <Field label="Offspring/s since IBD onset">
            <Input
              type="number"
              min={0}
              step={1}
              value={form.offspringSinceIbdOnset}
              onChange={(e) =>
                update("offspringSinceIbdOnset", e.target.value)
              }
            />
          </Field>
        </div>

        <Field label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            placeholder="Optional notes"
          />
        </Field>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Offspring summary is not linked to a visit.
        </div>
      </div>

      <FormSaveActions
        onCancel={onCancel}
        onSave={() => submit(false)}
        onSaveAndContinue={
          onSaveAndContinue ? () => submit(true) : undefined
        }
        saveLabel="Save offspring"
        continueHint={continueHint}
      />
    </div>
  );
}
