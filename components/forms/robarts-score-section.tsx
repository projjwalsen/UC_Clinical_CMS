"use client";

import {
  ROBARTS_CHRONIC_INFLAMMATORY_INFILTRATE,
  ROBARTS_EROSION_ULCERATION,
  ROBARTS_NEUTROPHILS_EPITHELIUM,
  ROBARTS_NEUTROPHILS_LAMINA_PROPRIA,
  type RobartsCriterionOption,
} from "@/lib/robarts-histopathology-index";
import { Field, Select } from "@/components/ui/core";

function RobartsCriterionSelect({
  title,
  weight,
  options,
  value,
  onChange,
  error,
}: {
  title: string;
  weight: number;
  options: RobartsCriterionOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="md:col-span-2">
      <Field label={`${title} (${weight}×)`} required error={error}>
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

export function RobartsScoreSection({
  chronicInflammatoryInfiltrate,
  neutrophilsLaminaPropria,
  neutrophilsEpithelium,
  erosionUlceration,
  histopathologyScore,
  errors,
  onChange,
}: {
  chronicInflammatoryInfiltrate: string;
  neutrophilsLaminaPropria: string;
  neutrophilsEpithelium: string;
  erosionUlceration: string;
  histopathologyScore?: number;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <section className="mb-8 space-y-4 rounded-xl border border-teal-100 bg-teal-50/30 p-5">
      <div>
        <h3 className="text-sm font-bold text-slate-800">
          Histopathology score (Robarts index)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          One score per examination. Weighted sum: chronic infiltrate (1×),
          lamina propria neutrophils (2×), epithelial neutrophils (3×), erosion
          or ulceration (5×).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RobartsCriterionSelect
          title="Chronic inflammatory infiltrate"
          weight={1}
          options={ROBARTS_CHRONIC_INFLAMMATORY_INFILTRATE}
          value={chronicInflammatoryInfiltrate}
          onChange={(v) => onChange("robartsChronicInflammatoryInfiltrate", v)}
          error={errors.robartsChronicInflammatoryInfiltrate}
        />
        <RobartsCriterionSelect
          title="Neutrophils in lamina propria"
          weight={2}
          options={ROBARTS_NEUTROPHILS_LAMINA_PROPRIA}
          value={neutrophilsLaminaPropria}
          onChange={(v) => onChange("robartsNeutrophilsLaminaPropria", v)}
          error={errors.robartsNeutrophilsLaminaPropria}
        />
        <RobartsCriterionSelect
          title="Neutrophils in epithelium"
          weight={3}
          options={ROBARTS_NEUTROPHILS_EPITHELIUM}
          value={neutrophilsEpithelium}
          onChange={(v) => onChange("robartsNeutrophilsEpithelium", v)}
          error={errors.robartsNeutrophilsEpithelium}
        />
        <div className="md:col-span-2">
          <Field
            label="Erosion or ulceration (5×)"
            required
            error={errors.robartsErosionUlceration}
          >
            <Select
              className="w-full"
              value={erosionUlceration}
              onChange={(e) =>
                onChange("robartsErosionUlceration", e.target.value)
              }
            >
              <option value="">Select score…</option>
              {ROBARTS_EROSION_ULCERATION.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.score} — {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div className="rounded-lg border border-teal-200 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800/70">
          Histopathology score
        </p>
        <p className="mt-1 text-3xl font-bold text-teal-900">
          {histopathologyScore ?? "—"}
        </p>
      </div>
    </section>
  );
}
