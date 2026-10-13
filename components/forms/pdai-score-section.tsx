"use client";

import {
  PDAI_ENDOSCOPIC_CRITERIA,
  PDAI_FECAL_URGENCY,
  PDAI_FEVER,
  PDAI_POLYMORPH_INFILTRATION,
  PDAI_POUCHITIS_THRESHOLD,
  PDAI_RECTAL_BLEEDING,
  PDAI_STOOL_FREQUENCY,
  PDAI_ULCERATION_LPF,
  pdaiInferenceFromScore,
  type PdaiOption,
} from "@/lib/pdai-score";
import { Field, Input, Select } from "@/components/ui/core";

function PdaiCriteriaSelect({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: PdaiOption[];
  value: string;
  onChange: (optionId: string) => void;
  error?: string;
}) {
  return (
    <Field label={label} required error={error}>
      <Select
        className="w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select criterion…</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.score} — {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function PdaiScoreSection({
  pdaiStoolFrequencyId,
  pdaiRectalBleedingId,
  pdaiFecalUrgencyId,
  pdaiFeverId,
  pdaiEndoscopic,
  pdaiPolymorphInfiltrationId,
  pdaiUlcerationLpfId,
  pdaiScore,
  errors,
  onRadioChange,
  onEndoscopicChange,
}: {
  pdaiStoolFrequencyId: string;
  pdaiRectalBleedingId: string;
  pdaiFecalUrgencyId: string;
  pdaiFeverId: string;
  pdaiEndoscopic: Record<string, boolean>;
  pdaiPolymorphInfiltrationId: string;
  pdaiUlcerationLpfId: string;
  pdaiScore: number;
  errors: Record<string, string>;
  onRadioChange: (key: string, optionId: string) => void;
  onEndoscopicChange: (id: string, checked: boolean) => void;
}) {
  const inference = pdaiInferenceFromScore(pdaiScore);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-bold text-teal-800">
          Pouchitis Disease Activity Index (PDAI)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Each dropdown shows the score prefix (e.g. 0 — usual frequency). Total
          updates automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PdaiCriteriaSelect
          label="Stool frequency"
          options={PDAI_STOOL_FREQUENCY}
          value={pdaiStoolFrequencyId}
          onChange={(id) => onRadioChange("pdaiStoolFrequencyId", id)}
          error={errors.pdaiStoolFrequencyId}
        />
        <PdaiCriteriaSelect
          label="Rectal bleeding"
          options={PDAI_RECTAL_BLEEDING}
          value={pdaiRectalBleedingId}
          onChange={(id) => onRadioChange("pdaiRectalBleedingId", id)}
          error={errors.pdaiRectalBleedingId}
        />
        <PdaiCriteriaSelect
          label="Fecal urgency / abdominal cramps"
          options={PDAI_FECAL_URGENCY}
          value={pdaiFecalUrgencyId}
          onChange={(id) => onRadioChange("pdaiFecalUrgencyId", id)}
          error={errors.pdaiFecalUrgencyId}
        />
        <PdaiCriteriaSelect
          label="Fever (temperature > 100.5 °F)"
          options={PDAI_FEVER}
          value={pdaiFeverId}
          onChange={(id) => onRadioChange("pdaiFeverId", id)}
          error={errors.pdaiFeverId}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <p className="mb-3 text-sm font-semibold text-teal-800">
          Endoscopic criteria
        </p>
        <p className="mb-3 text-xs text-slate-500">
          Check all that apply (1 point each).
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PDAI_ENDOSCOPIC_CRITERIA.map(({ id, label }) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                className="accent-teal-700"
                checked={!!pdaiEndoscopic[id]}
                onChange={(e) => onEndoscopicChange(id, e.target.checked)}
              />
              <span>
                {label}{" "}
                <span className="text-slate-400">(+1)</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-teal-800">
          Acute histologic criteria
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <PdaiCriteriaSelect
            label="Polymorph infiltration"
            options={PDAI_POLYMORPH_INFILTRATION}
            value={pdaiPolymorphInfiltrationId}
            onChange={(id) => onRadioChange("pdaiPolymorphInfiltrationId", id)}
            error={errors.pdaiPolymorphInfiltrationId}
          />
          <PdaiCriteriaSelect
            label="Ulceration per low-power field (average)"
            options={PDAI_ULCERATION_LPF}
            value={pdaiUlcerationLpfId}
            onChange={(id) => onRadioChange("pdaiUlcerationLpfId", id)}
            error={errors.pdaiUlcerationLpfId}
          />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-600">
        Pouchitis is defined as a total PDAI score ≥{PDAI_POUCHITIS_THRESHOLD}{" "}
        points. Adapted with permission from: Sandborn WJ, Tremaine WJ, Batts
        KP, Pemberton JH, Phillips SF. Pouchitis following ileal pouch-anal
        anastomosis: a pouchitis disease activity index. Mayo Clin Proc
        1994;69:409-415.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="PDAI score">
          <Input value={String(pdaiScore)} disabled />
        </Field>
        <Field label="Interpretation">
          <Input value={inference} disabled />
        </Field>
      </div>
    </section>
  );
}
