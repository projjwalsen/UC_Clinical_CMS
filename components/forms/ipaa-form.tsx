"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  INCONTINENCE_LEVELS,
  POUCH_TYPES,
  YES_NO,
} from "@/data/lookups";
import {
  buildIpaaFormState,
  computeTotalStoolFrequency,
  ipaaFormToRecord,
  type IpaaFormState,
} from "@/lib/ipaa-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { IPAARecord, Visit } from "@/types/clinical";

const YES_NO_OPTIONS = YES_NO.filter((value) => value !== "Not known");

export function IpaaForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (record: IPAARecord) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<IpaaFormState>(() =>
    buildIpaaFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalStoolFrequency = useMemo(
    () => computeTotalStoolFrequency(form.stoolFrequencyDay, form.stoolFrequencyNight),
    [form.stoolFrequencyDay, form.stoolFrequencyNight],
  );

  const update = <K extends keyof IpaaFormState>(
    key: K,
    value: IpaaFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Follow-up date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      ipaaFormToRecord(form, patientId, `IPAA-${patientId}-${Date.now()}`),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Follow-up date" required error={errors.date}>
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
          <Field label="Pouch type">
            <Select
              className="w-full"
              value={form.pouchType}
              onChange={(e) => update("pouchType", e.target.value)}
            >
              <option value="">Select pouch type</option>
              {POUCH_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </Field>
        </div>

        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <h3 className="text-sm font-bold text-slate-800">Stool frequency</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Stool frequency (day)">
              <Input
                type="number"
                min={0}
                step={1}
                value={form.stoolFrequencyDay}
                onChange={(e) => update("stoolFrequencyDay", e.target.value)}
              />
            </Field>
            <Field label="Stool frequency (night)">
              <Input
                type="number"
                min={0}
                step={1}
                value={form.stoolFrequencyNight}
                onChange={(e) => update("stoolFrequencyNight", e.target.value)}
              />
            </Field>
            <Field label="Total stool frequency">
              <p className="pt-2 text-sm font-bold text-slate-800">
                {totalStoolFrequency ?? "—"}
              </p>
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <h3 className="text-sm font-bold text-slate-800">Continence</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Daytime continence">
              <Select
                className="w-full"
                value={form.daytimeContinence}
                onChange={(e) => update("daytimeContinence", e.target.value)}
              >
                <option value="">Select</option>
                {INCONTINENCE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Nighttime continence">
              <Select
                className="w-full"
                value={form.nighttimeContinence}
                onChange={(e) => update("nighttimeContinence", e.target.value)}
              >
                <option value="">Select</option>
                {INCONTINENCE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Incontinence">
              <Select
                className="w-full"
                value={form.incontinence}
                onChange={(e) => update("incontinence", e.target.value)}
              >
                <option value="">Select</option>
                {INCONTINENCE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Blood in stool">
              <Select
                className="w-full"
                value={form.bloodInStool}
                onChange={(e) => update("bloodInStool", e.target.value)}
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label="Stool / flatus distinction">
              <Select
                className="w-full"
                value={form.stoolFlatusDistinction}
                onChange={(e) =>
                  update("stoolFlatusDistinction", e.target.value)
                }
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label="Antimotility agents">
              <Select
                className="w-full"
                value={form.antimotilityAgents}
                onChange={(e) => update("antimotilityAgents", e.target.value)}
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <Field label="Treatment">
          <Textarea
            value={form.treatment}
            onChange={(e) => update("treatment", e.target.value)}
            placeholder="Current treatment for pouch function"
          />
        </Field>
        <Field label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            placeholder="Optional notes"
          />
        </Field>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          One row per post-IPAA follow-up encounter, linked to the selected
          visit. Total stool frequency is calculated automatically.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save IPAA follow-up
        </Button>
      </div>
    </div>
  );
}
