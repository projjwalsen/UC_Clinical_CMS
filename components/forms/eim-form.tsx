"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { EIM_MANIFESTATIONS, YES_NO } from "@/data/lookups";
import {
  buildEimFormState,
  eimFormToRecords,
  type EimFormState,
  type EimRowState,
} from "@/lib/eim-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { EIMRecord, Visit } from "@/types/clinical";

export function EimForm({
  patientId,
  visits,
  lastAssessment,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  lastAssessment?: EIMRecord[] | null;
  onCancel: () => void;
  onSave: (records: EIMRecord[]) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<EimFormState>(() =>
    buildEimFormState(lastAssessment ?? null, defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const assessmentId = useMemo(
    () => `EIM-${patientId}-${Date.now()}`,
    [patientId],
  );

  const updateRow = (
    manifestation: string,
    key: keyof EimRowState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      manifestations: {
        ...current.manifestations,
        [manifestation]: {
          ...current.manifestations[manifestation],
          [key]: value,
        },
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
    onSave(eimFormToRecords(form, patientId, assessmentId));
  };

  const presentCount = EIM_MANIFESTATIONS.filter(
    (manifestation) => form.manifestations[manifestation].present === "Yes",
  ).length;
  const thromboticPresent =
    form.manifestations["Thrombotic Episodes"]?.present === "Yes";

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

        {lastAssessment && (
          <p className="mb-4 rounded-lg bg-teal-50 px-4 py-3 text-xs text-teal-800">
            Manifestation rows pre-filled from the last assessment. Visit-level
            fields apply to this assessment as a whole.
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800">
              Extra-intestinal manifestations
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Mark each manifestation as present or absent and record timing after
              IBD onset where applicable.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Manifestation</th>
                  <th className="px-4 py-3">Present</th>
                  <th className="px-4 py-3">After IBD onset</th>
                </tr>
              </thead>
              <tbody>
                {EIM_MANIFESTATIONS.map((manifestation) => {
                  const row = form.manifestations[manifestation];
                  const isYes = row.present === "Yes";
                  return (
                    <tr
                      key={manifestation}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {manifestation}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          className="w-full min-w-28"
                          value={row.present}
                          onChange={(e) =>
                            updateRow(manifestation, "present", e.target.value)
                          }
                        >
                          {YES_NO.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          className="w-full min-w-28"
                          value={row.afterIbdOnset}
                          disabled={!isYes}
                          onChange={(e) =>
                            updateRow(
                              manifestation,
                              "afterIbdOnset",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">—</option>
                          {YES_NO.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </Select>
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
              Vein thrombosed applies when thrombotic episodes are present.
              Remarks apply to this assessment.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Vein thrombosed">
              <Input
                value={form.veinThrombosed}
                disabled={!thromboticPresent}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    veinThrombosed: e.target.value,
                  }))
                }
                placeholder={
                  thromboticPresent ? "Describe vein involved" : "Not applicable"
                }
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
          {presentCount} of {EIM_MANIFESTATIONS.length} manifestations marked
          present. Saving creates one record per manifestation for this
          assessment.
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
