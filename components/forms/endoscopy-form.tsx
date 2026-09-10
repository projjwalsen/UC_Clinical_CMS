"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { DISEASE_EXTENT } from "@/data/lookups";
import {
  buildEndoscopyFormState,
  endoscopyFormToRecord,
  type EndoscopyFormState,
} from "@/lib/endoscopy-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { EndoscopyRecord, Visit } from "@/types/clinical";

export function EndoscopyForm({
  patientId,
  visits,
  lastEndoscopy,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  lastEndoscopy?: EndoscopyRecord | null;
  onCancel: () => void;
  onSave: (record: EndoscopyRecord) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<EndoscopyFormState>(() =>
    buildEndoscopyFormState(lastEndoscopy, defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof EndoscopyFormState>(
    key: K,
    value: EndoscopyFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Colonoscopy date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      endoscopyFormToRecord(form, patientId, `END-${patientId}-${Date.now()}`),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {lastEndoscopy && (
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
            <Field label="UCEIS">
              <Input
                type="number"
                min={0}
                max={8}
                step={1}
                value={form.uceis}
                onChange={(e) => update("uceis", e.target.value)}
                placeholder="0–8"
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
          One row per colonoscopy. Montreal disease extent uses E1/E2/E3 coding.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save endoscopy
        </Button>
      </div>
    </div>
  );
}
