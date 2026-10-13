"use client";

import { useMemo, useState } from "react";
import { FormSaveActions } from "@/components/forms/form-save-actions";
import { PdaiScoreSection } from "@/components/forms/pdai-score-section";
import {
  buildPouchoscopyFormState,
  pdaiScoreFromForm,
  pouchoscopyFormToRecord,
  pouchoscopyRecordToFormState,
  resolvePouchoscopyFollowUpDate,
  type PouchoscopyFormState,
} from "@/lib/pouchoscopy-utils";
import { Field, Input, Select, Textarea } from "@/components/ui/core";
import type { PouchoscopyRecord, Visit } from "@/types/clinical";

const PDAI_RADIO_KEYS = [
  "pdaiStoolFrequencyId",
  "pdaiRectalBleedingId",
  "pdaiFecalUrgencyId",
  "pdaiFeverId",
  "pdaiPolymorphInfiltrationId",
  "pdaiUlcerationLpfId",
] as const;

export function PouchoscopyForm({
  patientId,
  visits,
  serialNumber,
  editingRecord,
  onCancel,
  onSave,
  onSaveAndContinue,
  continueHint,
}: {
  patientId: string;
  visits: Visit[];
  serialNumber: number;
  editingRecord?: PouchoscopyRecord | null;
  onCancel: () => void;
  onSave: (record: PouchoscopyRecord) => void;
  onSaveAndContinue?: (record: PouchoscopyRecord) => void;
  continueHint?: string | null;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<PouchoscopyFormState>(() =>
    editingRecord
      ? pouchoscopyRecordToFormState(editingRecord)
      : buildPouchoscopyFormState(defaultVisitId),
  );
  const [recordId] = useState(
    () => editingRecord?.id ?? `POUCH-${patientId}-${Date.now()}`,
  );
  const slNo = editingRecord?.serialNumber ?? serialNumber;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const followUpDate = useMemo(
    () =>
      resolvePouchoscopyFollowUpDate(
        form,
        visits,
        editingRecord?.date ?? "",
      ),
    [form, visits, editingRecord?.date],
  );

  const pdaiScore = useMemo(() => pdaiScoreFromForm(form), [form]);

  const update = <K extends keyof PouchoscopyFormState>(
    key: K,
    value: PouchoscopyFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const onRadioChange = (key: string, optionId: string) => {
    update(key as keyof PouchoscopyFormState, optionId);
  };

  const onEndoscopicChange = (id: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      pdaiEndoscopic: { ...current.pdaiEndoscopic, [id]: checked },
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.visitId) next.visitId = "Select a follow-up visit.";
    for (const key of PDAI_RADIO_KEYS) {
      if (!form[key]) next[key] = "Select a score.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (andContinue = false) => {
    if (!validate()) return;
    const record = pouchoscopyFormToRecord(
      form,
      patientId,
      recordId,
      slNo,
      visits,
      editingRecord?.date ?? "",
    );
    if (andContinue && onSaveAndContinue) onSaveAndContinue(record);
    else onSave(record);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-sm font-bold text-teal-800">Follow-up</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Follow-up visit" required error={errors.visitId}>
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
            <Field label="Follow-up date">
              <Input value={followUpDate || "—"} disabled />
            </Field>
          </div>
        </section>

        <PdaiScoreSection
          pdaiStoolFrequencyId={form.pdaiStoolFrequencyId}
          pdaiRectalBleedingId={form.pdaiRectalBleedingId}
          pdaiFecalUrgencyId={form.pdaiFecalUrgencyId}
          pdaiFeverId={form.pdaiFeverId}
          pdaiEndoscopic={form.pdaiEndoscopic}
          pdaiPolymorphInfiltrationId={form.pdaiPolymorphInfiltrationId}
          pdaiUlcerationLpfId={form.pdaiUlcerationLpfId}
          pdaiScore={pdaiScore}
          errors={errors}
          onRadioChange={onRadioChange}
          onEndoscopicChange={onEndoscopicChange}
        />

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Acute inflammation">
              <Textarea
                value={form.acuteInflammation}
                onChange={(e) => update("acuteInflammation", e.target.value)}
                placeholder="Acute inflammation"
              />
            </Field>
            <Field label="Chronic inflammation">
              <Textarea
                value={form.chronicInflammation}
                onChange={(e) => update("chronicInflammation", e.target.value)}
                placeholder="Chronic inflammation"
              />
            </Field>
          </div>
        </section>
      </div>

      <FormSaveActions
        onCancel={onCancel}
        onSave={() => submit(false)}
        onSaveAndContinue={
          onSaveAndContinue ? () => submit(true) : undefined
        }
        saveLabel="Save pouchoscopy"
        continueHint={continueHint}
      />
    </div>
  );
}
