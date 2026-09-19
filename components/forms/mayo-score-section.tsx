"use client";

import {
  MAYO_ENDOSCOPIC_FINDINGS,
  MAYO_PHYSICIAN_GLOBAL,
  MAYO_RECTAL_BLEEDING,
  MAYO_STOOL_FREQUENCY,
  completeMayoSeverity,
  partialMayoSeverity,
  type MayoCriterionOption,
} from "@/lib/mayo-score";
import { Field, Select } from "@/components/ui/core";

function MayoCriterionSelect({
  title,
  roman,
  options,
  value,
  onChange,
  error,
}: {
  title: string;
  roman: string;
  options: MayoCriterionOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="md:col-span-2">
      <Field
        label={`${roman}. ${title}`}
        required
        error={error}
      >
        <Select
          className="w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select score…</option>
          {options.map((option) => (
            <option key={option.score} value={String(option.score)}>
              {option.score} — {option.label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

export function MayoScoreSection({
  stoolFrequency,
  rectalBleeding,
  endoscopicFindings,
  physicianGlobal,
  partialMayoScore,
  completeMayoScore,
  errors,
  onChange,
}: {
  stoolFrequency: string;
  rectalBleeding: string;
  endoscopicFindings: string;
  physicianGlobal: string;
  partialMayoScore?: number;
  completeMayoScore?: number;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Mayo score</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Partial Mayo = stool frequency + rectal bleeding + physician&apos;s
          global assessment. Complete Mayo adds endoscopic findings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MayoCriterionSelect
          roman="I"
          title="Stool frequency"
          options={MAYO_STOOL_FREQUENCY}
          value={stoolFrequency}
          onChange={(v) => onChange("mayoStoolFrequency", v)}
          error={errors.mayoStoolFrequency}
        />
        <MayoCriterionSelect
          roman="II"
          title="Rectal bleeding"
          options={MAYO_RECTAL_BLEEDING}
          value={rectalBleeding}
          onChange={(v) => onChange("mayoRectalBleeding", v)}
          error={errors.mayoRectalBleeding}
        />
        <MayoCriterionSelect
          roman="III"
          title="Endoscopic findings"
          options={MAYO_ENDOSCOPIC_FINDINGS}
          value={endoscopicFindings}
          onChange={(v) => onChange("mayoEndoscopicFindings", v)}
          error={errors.mayoEndoscopicFindings}
        />
        <MayoCriterionSelect
          roman="IV"
          title="Physician's global assessment"
          options={MAYO_PHYSICIAN_GLOBAL}
          value={physicianGlobal}
          onChange={(v) => onChange("mayoPhysicianGlobalAssessment", v)}
          error={errors.mayoPhysicianGlobalAssessment}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800/70">
            Partial Mayo index
          </p>
          <p className="mt-1 text-2xl font-bold text-teal-900">
            {partialMayoScore ?? "—"}
          </p>
          {partialMayoScore !== undefined && (
            <p className="mt-1 text-xs text-teal-800">
              {partialMayoSeverity(partialMayoScore)}
              <span className="text-teal-700/80">
                {" "}
                (remission 0–1 · mild 2–4 · moderate 5–7 · severe &gt;7)
              </span>
            </p>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Complete Mayo score
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {completeMayoScore ?? "—"}
          </p>
          {completeMayoScore !== undefined && (
            <p className="mt-1 text-xs text-slate-600">
              {completeMayoSeverity(completeMayoScore)}
              <span className="text-slate-500">
                {" "}
                (remission 0–2 · mild 3–5 · moderate 6–10 · severe &gt;10)
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
