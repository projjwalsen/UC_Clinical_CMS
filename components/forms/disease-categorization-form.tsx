"use client";

import { useState } from "react";
import { FormSaveActions } from "@/components/forms/form-save-actions";
import {
  EXTENT_AT_PRESENTATION,
  SEVERITY_AT_PRESENTATION,
} from "@/data/lookups";
import {
  categorizationFormToRecord,
  categorizationRecordToFormState,
  type DiseaseCategorizationFormState,
} from "@/lib/disease-categorization-utils";
import { Field, Input, Select } from "@/components/ui/core";
import type { DiseaseCategorizationRecord } from "@/types/clinical";

export function DiseaseCategorizationForm({
  patientId,
  editingRecord,
  onCancel,
  onSave,
  onSaveAndContinue,
  continueHint,
}: {
  patientId: string;
  editingRecord?: DiseaseCategorizationRecord | null;
  onCancel: () => void;
  onSave: (record: DiseaseCategorizationRecord) => void;
  onSaveAndContinue?: (record: DiseaseCategorizationRecord) => void;
  continueHint?: string | null;
}) {
  const [form, setForm] = useState<DiseaseCategorizationFormState>(() =>
    categorizationRecordToFormState(editingRecord),
  );
  const [recordId] = useState(
    () => editingRecord?.id ?? `DCAT-${patientId}-${Date.now()}`,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof DiseaseCategorizationFormState>(
    key: K,
    value: DiseaseCategorizationFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.extentAtPresentation) {
      next.extentAtPresentation = "Select extent at presentation.";
    }
    if (!form.severityAtPresentation) {
      next.severityAtPresentation = "Select severity at presentation.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (andContinue = false) => {
    if (!validate()) return;
    const record = categorizationFormToRecord(form, patientId, recordId);
    if (andContinue && onSaveAndContinue) onSaveAndContinue(record);
    else onSave(record);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Extent at presentation"
            required
            error={errors.extentAtPresentation}
          >
            <Select
              className="w-full"
              value={form.extentAtPresentation}
              onChange={(e) => update("extentAtPresentation", e.target.value)}
            >
              <option value="">Select extent</option>
              {EXTENT_AT_PRESENTATION.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Severity at presentation"
            required
            error={errors.severityAtPresentation}
          >
            <Select
              className="w-full"
              value={form.severityAtPresentation}
              onChange={(e) => update("severityAtPresentation", e.target.value)}
            >
              <option value="">Select type</option>
              {SEVERITY_AT_PRESENTATION.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </Field>
          <Field label="Age at presentation">
            <Input
              type="number"
              min={0}
              step={1}
              value={form.ageAtPresentation}
              onChange={(e) => update("ageAtPresentation", e.target.value)}
            />
          </Field>
        </div>
      </div>
      <FormSaveActions
        onCancel={onCancel}
        onSave={() => submit(false)}
        onSaveAndContinue={onSaveAndContinue ? () => submit(true) : undefined}
        saveLabel="Save disease categorization"
        continueHint={continueHint}
      />
    </div>
  );
}
