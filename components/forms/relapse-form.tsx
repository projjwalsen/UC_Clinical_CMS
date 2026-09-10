"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import {
  INFECTION_TYPES,
  RELAPSE_CAUSES,
  RESCUE_OUTCOMES,
  RESCUE_THERAPY_TYPES,
  YES_NO,
} from "@/data/lookups";
import {
  buildRelapseFormState,
  relapseFormToRecord,
  type RelapseFormState,
} from "@/lib/relapse-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { RelapseRecord, Visit } from "@/types/clinical";

const YES_NO_OPTIONS = YES_NO.filter((value) => value !== "Not known");

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <Select className="w-full" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {YES_NO_OPTIONS.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </Select>
    </Field>
  );
}

export function RelapseForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (record: RelapseRecord) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<RelapseFormState>(() =>
    buildRelapseFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof RelapseFormState>(
    key: K,
    value: RelapseFormState[K],
  ) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "relapseCause" && value !== "Other") next.causeOther = "";
      if (key === "infection" && value !== "Yes") next.infectionType = "";
      if (key === "rescueTherapy" && value !== "Yes") {
        next.rescueTherapyType = "";
        next.rescueTherapyFailure = "";
        next.rescueOutcome = "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Relapse date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    if (!form.relapseCause) next.relapseCause = "Relapse cause is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      relapseFormToRecord(form, patientId, `REL-${patientId}-${Date.now()}`),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Relapse date" required error={errors.date}>
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

        <Section title="Relapse cause">
          <Field label="Relapse cause" required error={errors.relapseCause}>
            <Select
              className="w-full"
              value={form.relapseCause}
              onChange={(e) => update("relapseCause", e.target.value)}
            >
              <option value="">Select cause</option>
              {RELAPSE_CAUSES.map((cause) => (
                <option key={cause}>{cause}</option>
              ))}
            </Select>
          </Field>
          {form.relapseCause === "Other" && (
            <Field label="Other cause">
              <Input
                value={form.causeOther}
                onChange={(e) => update("causeOther", e.target.value)}
                placeholder="Specify other cause"
              />
            </Field>
          )}
        </Section>

        <Section title="Treatment">
          <YesNoField
            label="Admission"
            value={form.admission}
            onChange={(value) => update("admission", value)}
          />
          <YesNoField
            label="Steroid"
            value={form.steroid}
            onChange={(value) => update("steroid", value)}
          />
          <YesNoField
            label="Oral steroid"
            value={form.oralSteroid}
            onChange={(value) => update("oralSteroid", value)}
          />
          <YesNoField
            label="IV steroid"
            value={form.ivSteroid}
            onChange={(value) => update("ivSteroid", value)}
          />
          <Field label="Admission duration (days)">
            <Input
              type="number"
              min={0}
              step={1}
              value={form.admissionDurationDays}
              onChange={(e) =>
                update("admissionDurationDays", e.target.value)
              }
            />
          </Field>
        </Section>

        <Section title="Infection">
          <YesNoField
            label="Infection"
            value={form.infection}
            onChange={(value) => update("infection", value)}
          />
          {form.infection === "Yes" && (
            <Field label="Infection type">
              <Select
                className="w-full"
                value={form.infectionType}
                onChange={(e) => update("infectionType", e.target.value)}
              >
                <option value="">Select type</option>
                {INFECTION_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </Select>
            </Field>
          )}
        </Section>

        <Section title="Rescue therapy">
          <YesNoField
            label="Rescue therapy"
            value={form.rescueTherapy}
            onChange={(value) => update("rescueTherapy", value)}
          />
          {form.rescueTherapy === "Yes" && (
            <>
              <Field label="Rescue therapy type">
                <Select
                  className="w-full"
                  value={form.rescueTherapyType}
                  onChange={(e) =>
                    update("rescueTherapyType", e.target.value)
                  }
                >
                  <option value="">Select type</option>
                  {RESCUE_THERAPY_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </Select>
              </Field>
              <YesNoField
                label="Rescue therapy failure"
                value={form.rescueTherapyFailure}
                onChange={(value) => update("rescueTherapyFailure", value)}
              />
              <Field label="Rescue outcome">
                <Select
                  className="w-full"
                  value={form.rescueOutcome}
                  onChange={(e) => update("rescueOutcome", e.target.value)}
                >
                  <option value="">Select outcome</option>
                  {RESCUE_OUTCOMES.map((outcome) => (
                    <option key={outcome}>{outcome}</option>
                  ))}
                </Select>
              </Field>
            </>
          )}
        </Section>

        <Section title="Outcomes">
          <YesNoField
            label="Colectomy"
            value={form.colectomy}
            onChange={(value) => update("colectomy", value)}
          />
          <YesNoField
            label="Anticoagulation"
            value={form.anticoagulation}
            onChange={(value) => update("anticoagulation", value)}
          />
          <YesNoField
            label="Death"
            value={form.death}
            onChange={(value) => update("death", value)}
          />
        </Section>

        <Field label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            placeholder="Optional notes for this relapse event"
          />
        </Field>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          One row per relapse event, linked to the selected visit.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save relapse
        </Button>
      </div>
    </div>
  );
}
