"use client";

import { useCallback, useMemo, useState } from "react";
import { VisitLinkedDataBanner } from "@/components/forms/visit-linked-data-banner";
import { useSyncRecordsOnVisitContext } from "@/hooks/use-sync-records-on-visit-context";
import { Check } from "lucide-react";
import { SYMPTOMS, YES_NO } from "@/data/lookups";
import {
  buildSymptomFormState,
  symptomFormToRecords,
  type SymptomFormState,
  type SymptomRowState,
} from "@/lib/symptom-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { SymptomRecord, Visit } from "@/types/clinical";

export function SymptomForm({
  patientId,
  visits,
  patientRecords,
  initialAssessment,
  lastAssessment,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  patientRecords: SymptomRecord[];
  initialAssessment?: SymptomRecord[] | null;
  lastAssessment?: SymptomRecord[] | null;
  onCancel: () => void;
  onSave: (records: SymptomRecord[]) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const seedAssessment = initialAssessment ?? lastAssessment ?? null;
  const [form, setForm] = useState<SymptomFormState>(() =>
    buildSymptomFormState(seedAssessment, defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedExisting, setLoadedExisting] = useState(
    () => !!initialAssessment?.length,
  );
  const [existingIdsBySymptom, setExistingIdsBySymptom] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      (initialAssessment ?? []).map((record) => [record.symptom, record.id]),
    ),
  );
  const assessmentId = useMemo(
    () =>
      initialAssessment?.[0]?.id.split("-").slice(0, -1).join("-") ||
      `SYM-${patientId}-${Date.now()}`,
    [initialAssessment, patientId],
  );

  const onMatched = useCallback(
    (records: SymptomRecord[]) => {
      setForm(buildSymptomFormState(records, form.visitId));
      setExistingIdsBySymptom(
        Object.fromEntries(records.map((record) => [record.symptom, record.id])),
      );
      setLoadedExisting(true);
    },
    [form.visitId],
  );

  useSyncRecordsOnVisitContext({
    visitId: form.visitId,
    date: form.date,
    visits,
    pool: patientRecords,
    enabled: !initialAssessment?.length,
    onMatched,
  });

  const updateRow = (
    symptom: string,
    key: keyof SymptomRowState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      symptoms: {
        ...current.symptoms,
        [symptom]: { ...current.symptoms[symptom], [key]: value },
      },
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Assessment date is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      symptomFormToRecords(
        form,
        patientId,
        assessmentId,
        existingIdsBySymptom,
      ),
    );
  };

  const presentCount = SYMPTOMS.filter(
    (symptom) => form.symptoms[symptom].present === "Yes",
  ).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Field label="Assessment date" required error={errors.date}>
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

        {loadedExisting && (
          <VisitLinkedDataBanner message="Existing symptom data for this visit date is loaded. Saving will update those entries." />
        )}
        {!loadedExisting && lastAssessment && (
          <p className="mb-4 rounded-lg bg-teal-50 px-4 py-3 text-xs text-teal-800">
            Symptom rows pre-filled from the last assessment. Weight and remarks
            apply to this visit as a whole.
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800">
              Clinical features
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Mark each symptom as present or absent and record duration where
              applicable.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-white text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Symptom</th>
                  <th className="px-4 py-3">Present</th>
                  <th className="px-4 py-3">Duration (months)</th>
                </tr>
              </thead>
              <tbody>
                {SYMPTOMS.map((symptom) => {
                  const row = form.symptoms[symptom];
                  const isYes = row.present === "Yes";
                  return (
                    <tr key={symptom} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {symptom}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          className="w-full min-w-28"
                          value={row.present}
                          onChange={(e) =>
                            updateRow(symptom, "present", e.target.value)
                          }
                        >
                          {YES_NO.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          disabled={!isYes}
                          value={row.durationMonths}
                          onChange={(e) =>
                            updateRow(symptom, "durationMonths", e.target.value)
                          }
                          placeholder="months"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Visit-level details
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Weight and remarks apply to this assessment, not individual
              symptoms.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Weight lost (kg)">
              <Input
                type="number"
                min="0"
                value={form.weightLostKg}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    weightLostKg: e.target.value,
                  }))
                }
                placeholder="kg"
              />
            </Field>
            <Field label="Present weight (kg)">
              <Input
                type="number"
                min="0"
                value={form.presentWeightKg}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    presentWeightKg: e.target.value,
                  }))
                }
                placeholder="kg"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Remarks">
                <Textarea
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Assessment notes for this visit…"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {presentCount} of {SYMPTOMS.length} symptoms marked present. Saving
          creates one record per symptom for this assessment.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save assessment
        </Button>
      </div>
    </div>
  );
}
