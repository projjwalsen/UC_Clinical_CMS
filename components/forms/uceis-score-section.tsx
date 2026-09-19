"use client";

import {
  UCEIS_BLEEDING,
  UCEIS_EROSIONS_ULCERS,
  UCEIS_VASCULAR_PATTERN,
  type UceisOption,
} from "@/lib/uceis-score";
import { Field, Select } from "@/components/ui/core";

function UceisDescriptorSelect({
  title,
  options,
  value,
  onChange,
  error,
}: {
  title: string;
  options: UceisOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="md:col-span-2">
      <Field label={title} required error={error}>
        <Select
          className="w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select anchor point…</option>
          {options.map((option) => (
            <option key={option.score} value={String(option.score)}>
              {option.score} = {option.anchor} — {option.definition}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

export function UceisScoreSection({
  vascularPattern,
  bleeding,
  erosionsUlcers,
  uceisScore,
  errors,
  onChange,
}: {
  vascularPattern: string;
  bleeding: string;
  erosionsUlcers: string;
  uceisScore?: number;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">
          UCEIS (Ulcerative Colitis Endoscopic Index of Severity)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Sum of vascular pattern, bleeding, and erosions/ulcers (range 0–8).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <UceisDescriptorSelect
          title="Vascular pattern"
          options={UCEIS_VASCULAR_PATTERN}
          value={vascularPattern}
          onChange={(v) => onChange("uceisVascularPattern", v)}
          error={errors.uceisVascularPattern}
        />
        <UceisDescriptorSelect
          title="Bleeding"
          options={UCEIS_BLEEDING}
          value={bleeding}
          onChange={(v) => onChange("uceisBleeding", v)}
          error={errors.uceisBleeding}
        />
        <UceisDescriptorSelect
          title="Erosions and ulcers"
          options={UCEIS_EROSIONS_ULCERS}
          value={erosionsUlcers}
          onChange={(v) => onChange("uceisErosionsUlcers", v)}
          error={errors.uceisErosionsUlcers}
        />
      </div>

      <div className="rounded-lg border border-teal-100 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800/70">
          UCEIS total
        </p>
        <p className="mt-1 text-3xl font-bold text-teal-900">
          {uceisScore ?? "—"}
        </p>
      </div>
    </section>
  );
}
