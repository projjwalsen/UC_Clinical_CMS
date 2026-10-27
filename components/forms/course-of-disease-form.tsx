"use client";

import { useState } from "react";
import { FormSaveActions } from "@/components/forms/form-save-actions";
import {
  courseFormToRecord,
  courseRecordToFormState,
  type CourseOfDiseaseFormState,
} from "@/lib/course-of-disease-utils";
import { Field, Input } from "@/components/ui/core";
import type { CourseOfDiseaseRecord } from "@/types/clinical";

const TEXT_FIELDS: [keyof CourseOfDiseaseFormState, string][] = [
  [
    "singleEpisodeProlongedRemission",
    "Single episode of relapse followed by prolonged remission",
  ],
  ["chronicContinuousActive", "Chronic continuous active disease"],
  [
    "relapsingRemitting",
    "Relapsing and remitting disease (intermittent flares)",
  ],
  [
    "severityIncreaseAfterLowActivity",
    "Increase in the severity of disease after initial low activity",
  ],
  ["fulminantEarlyColectomy", "Fulminant course (early colectomy)"],
];

export function CourseOfDiseaseForm({
  patientId,
  editingRecord,
  onCancel,
  onSave,
  onSaveAndContinue,
  continueHint,
}: {
  patientId: string;
  editingRecord?: CourseOfDiseaseRecord | null;
  onCancel: () => void;
  onSave: (record: CourseOfDiseaseRecord) => void;
  onSaveAndContinue?: (record: CourseOfDiseaseRecord) => void;
  continueHint?: string | null;
}) {
  const [form, setForm] = useState<CourseOfDiseaseFormState>(() =>
    courseRecordToFormState(editingRecord),
  );
  const [recordId] = useState(
    () => editingRecord?.id ?? `COD-${patientId}-${Date.now()}`,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof CourseOfDiseaseFormState>(
    key: K,
    value: CourseOfDiseaseFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.colectomyAtFirstRelapse) {
      next.colectomyAtFirstRelapse = "Select Yes or No.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (andContinue = false) => {
    if (!validate()) return;
    const record = courseFormToRecord(form, patientId, recordId);
    if (andContinue && onSaveAndContinue) onSaveAndContinue(record);
    else onSave(record);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {TEXT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </Field>
          ))}
          <Field
            label="Colectomy at first relapse"
            required
            error={errors.colectomyAtFirstRelapse}
          >
            <div className="flex flex-wrap gap-4 pt-2">
              {(["Yes", "No"] as const).map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name="colectomy-at-first-relapse"
                    className="accent-teal-700"
                    checked={form.colectomyAtFirstRelapse === option}
                    onChange={() => update("colectomyAtFirstRelapse", option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>
      <FormSaveActions
        onCancel={onCancel}
        onSave={() => submit(false)}
        onSaveAndContinue={onSaveAndContinue ? () => submit(true) : undefined}
        saveLabel="Save course of disease"
        continueHint={continueHint}
      />
    </div>
  );
}
