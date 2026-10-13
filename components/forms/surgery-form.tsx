"use client";

import { useState } from "react";
import { FormSaveActions } from "@/components/forms/form-save-actions";
import {
  SURGERY_INDICATIONS,
  SURGERY_STAGES,
} from "@/data/lookups";
import {
  buildSurgeryFormState,
  surgeryFormToRecord,
  surgeryRecordToFormState,
  type SurgeryFormState,
} from "@/lib/surgery-utils";
import { Field, Input, Select } from "@/components/ui/core";
import type { SurgeryRecord, Visit } from "@/types/clinical";

export function SurgeryForm({
  patientId,
  visits,
  editingRecord,
  onCancel,
  onSave,
  onSaveAndContinue,
  continueHint,
}: {
  patientId: string;
  visits: Visit[];
  editingRecord?: SurgeryRecord | null;
  onCancel: () => void;
  onSave: (record: SurgeryRecord) => void;
  onSaveAndContinue?: (record: SurgeryRecord) => void;
  continueHint?: string | null;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<SurgeryFormState>(() =>
    editingRecord
      ? surgeryRecordToFormState(editingRecord)
      : buildSurgeryFormState(defaultVisitId),
  );
  const [recordId] = useState(
    () => editingRecord?.id ?? `SUR-${patientId}-${Date.now()}`,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof SurgeryFormState>(
    key: K,
    value: SurgeryFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Surgery date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    if (!form.stage) next.stage = "Select a surgical stage.";
    if (!form.indication) {
      next.indication = "Indication of surgery is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (andContinue = false) => {
    if (!validate()) return;
    const record = surgeryFormToRecord(form, patientId, recordId);
    if (andContinue && onSaveAndContinue) onSaveAndContinue(record);
    else onSave(record);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Surgery date" required error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </Field>
          <Field label="Linked visit" required error={errors.visitId}>
            <Select
              className="w-full"
              value={form.visitId}
              onChange={(e) => update("visitId", e.target.value)}
            >
              <option value="">Select visit</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {visit.id} · {visit.type} · {visit.date}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Surgical stage" required error={errors.stage}>
            <Select
              className="w-full"
              value={form.stage}
              onChange={(e) => update("stage", e.target.value)}
            >
              {SURGERY_STAGES.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Indication of Surgery"
            required
            error={errors.indication}
          >
            <Select
              className="w-full"
              value={form.indication}
              onChange={(e) => update("indication", e.target.value)}
            >
              <option value="">Select indication</option>
              {SURGERY_INDICATIONS.map((indication) => (
                <option key={indication}>{indication}</option>
              ))}
            </Select>
          </Field>
          <Field label="Duration of Staying in The Hospital">
            <Input
              type="number"
              min={0}
              step={1}
              value={form.hospitalStayDays}
              onChange={(e) => update("hospitalStayDays", e.target.value)}
              placeholder="Days in hospital"
            />
          </Field>
          <Field label="Surgical Complications">
            <Input
              type="text"
              value={form.surgicalComplications}
              onChange={(e) =>
                update("surgicalComplications", e.target.value)
              }
              placeholder="Optional"
            />
          </Field>
        </div>
      </div>

      <FormSaveActions
        onCancel={onCancel}
        onSave={() => submit(false)}
        onSaveAndContinue={
          onSaveAndContinue ? () => submit(true) : undefined
        }
        saveLabel="Save surgery"
        continueHint={continueHint}
      />
    </div>
  );
}
