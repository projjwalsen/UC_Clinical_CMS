"use client";

import { useCallback, useMemo, useState } from "react";
import { VisitLinkedDataBanner } from "@/components/forms/visit-linked-data-banner";
import { useSyncRecordsOnVisitContext } from "@/hooks/use-sync-records-on-visit-context";
import { Check } from "lucide-react";
import { UceisScoreSection } from "@/components/forms/uceis-score-section";
import { DISEASE_EXTENT } from "@/data/lookups";
import {
  buildEndoscopyFormState,
  endoscopyFormToRecord,
  endoscopyRecordToFormState,
  uceisScoreFromEndoscopyForm,
  type EndoscopyFormState,
} from "@/lib/endoscopy-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { EndoscopyRecord, Visit } from "@/types/clinical";

export function EndoscopyForm({
  patientId,
  visits,
  patientRecords,
  editingRecord,
  lastEndoscopy,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  patientRecords: EndoscopyRecord[];
  editingRecord?: EndoscopyRecord | null;
  lastEndoscopy?: EndoscopyRecord | null;
  onCancel: () => void;
  onSave: (record: EndoscopyRecord) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<EndoscopyFormState>(() =>
    editingRecord
      ? endoscopyRecordToFormState(editingRecord)
      : buildEndoscopyFormState(lastEndoscopy, defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recordId, setRecordId] = useState(
    () => editingRecord?.id ?? `END-${patientId}-${Date.now()}`,
  );
  const [loadedExisting, setLoadedExisting] = useState(() => !!editingRecord);
  const uceisScore = useMemo(
    () => uceisScoreFromEndoscopyForm(form),
    [form],
  );

  const onMatched = useCallback((records: EndoscopyRecord[]) => {
    const record = records[0];
    setForm(endoscopyRecordToFormState(record));
    setRecordId(record.id);
    setLoadedExisting(true);
  }, []);

  useSyncRecordsOnVisitContext({
    visitId: form.visitId,
    date: form.date,
    visits,
    pool: patientRecords,
    enabled: !editingRecord,
    onMatched,
  });

  const update = <K extends keyof EndoscopyFormState>(
    key: K,
    value: EndoscopyFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateUceis = (key: string, value: string) => {
    update(key as keyof EndoscopyFormState, value);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Colonoscopy date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    if (!form.uceisVascularPattern)
      next.uceisVascularPattern = "Select vascular pattern.";
    if (!form.uceisBleeding) next.uceisBleeding = "Select bleeding.";
    if (!form.uceisErosionsUlcers)
      next.uceisErosionsUlcers = "Select erosions and ulcers.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(endoscopyFormToRecord(form, patientId, recordId));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {loadedExisting && (
          <VisitLinkedDataBanner message="Existing colonoscopy data for this visit is loaded. Saving will update it." />
        )}
        {!loadedExisting && lastEndoscopy && (
          <p className="mb-4 rounded-lg bg-teal-50 px-4 py-3 text-xs text-teal-800">
            Scores and findings pre-filled from the last colonoscopy record.
            Update values for this procedure.
          </p>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Field label="Colonoscopy date" required error={errors.date}>
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
        </div>

        <div className="space-y-4">
          <Field label="Findings">
            <Textarea
              value={form.findings}
              onChange={(e) => update("findings", e.target.value)}
              placeholder="Endoscopic findings for this colonoscopy"
            />
          </Field>

          <UceisScoreSection
            vascularPattern={form.uceisVascularPattern}
            bleeding={form.uceisBleeding}
            erosionsUlcers={form.uceisErosionsUlcers}
            uceisScore={uceisScore}
            errors={errors}
            onChange={updateUceis}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Baron score">
              <Input
                type="number"
                min={0}
                max={3}
                step={1}
                value={form.baronScore}
                onChange={(e) => update("baronScore", e.target.value)}
                placeholder="0–3"
              />
            </Field>
            <Field label="Mayo endoscopic score">
              <Input
                type="number"
                min={0}
                max={3}
                step={1}
                value={form.mayoEndoscopicScore}
                onChange={(e) => update("mayoEndoscopicScore", e.target.value)}
                placeholder="0–3"
              />
            </Field>
            <Field label="Disease extent (Montreal)">
              <Select
                className="w-full"
                value={form.diseaseExtent}
                onChange={(e) => update("diseaseExtent", e.target.value)}
              >
                {DISEASE_EXTENT.map((extent) => (
                  <option key={extent}>{extent}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Remarks">
            <Textarea
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Optional notes"
            />
          </Field>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          One row per colonoscopy. UCEIS is the sum of the three descriptor
          scores. Montreal disease extent uses E1/E2/E3 coding.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save colonoscopy
        </Button>
      </div>
    </div>
  );
}
