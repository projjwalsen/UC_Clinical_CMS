"use client";

import {
  KUPPUSWAMY_EDUCATION,
  KUPPUSWAMY_INCOME,
  KUPPUSWAMY_OCCUPATION,
  calculateKuppuswamy,
} from "@/lib/kuppuswamy";

function ScoreTable({
  title,
  subtitle,
  options,
  value,
  onChange,
  error,
}: {
  title: string;
  subtitle: string;
  options: readonly { label: string; score: number }[];
  value: string;
  onChange: (label: string) => void;
  error?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {options.map((option) => (
          <label
            key={option.label}
            className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-slate-50 ${value === option.label ? "bg-teal-50/60" : ""}`}
          >
            <input
              type="radio"
              name={title}
              checked={value === option.label}
              onChange={() => onChange(option.label)}
              className="size-4 accent-teal-700"
            />
            <span className="flex-1 text-sm text-slate-700">{option.label}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {option.score}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="px-4 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function KuppuswamySection({
  education,
  occupation,
  monthlyFamilyIncome,
  onEducationChange,
  onOccupationChange,
  onIncomeChange,
  errors,
}: {
  education: string;
  occupation: string;
  monthlyFamilyIncome: string;
  onEducationChange: (value: string) => void;
  onOccupationChange: (value: string) => void;
  onIncomeChange: (value: string) => void;
  errors: {
    education?: string;
    occupation?: string;
    monthlyFamilyIncome?: string;
  };
}) {
  const result = calculateKuppuswamy(education, occupation, monthlyFamilyIncome);
  const complete =
    result.educationScore > 0 &&
    result.occupationScore > 0 &&
    result.incomeScore > 0;

  return (
    <div className="mt-8 space-y-6 border-t border-slate-100 pt-8">
      <div>
        <h2 className="text-lg font-bold">Kuppuswamy socioeconomic scale</h2>
        <p className="mt-1 text-sm text-slate-500">
          Updated 2022 scoring for education, occupation of the head of the
          family, and total monthly family income. Socioeconomic class is
          calculated automatically.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ScoreTable
          title="Education of the head of the family"
          subtitle="Select the highest educational qualification"
          options={KUPPUSWAMY_EDUCATION}
          value={education}
          onChange={onEducationChange}
          error={errors.education}
        />
        <ScoreTable
          title="Occupation of the head of the family"
          subtitle="Select the primary occupation type"
          options={KUPPUSWAMY_OCCUPATION}
          value={occupation}
          onChange={onOccupationChange}
          error={errors.occupation}
        />
      </div>

      <ScoreTable
        title="Total monthly income of the family"
        subtitle="Updated monthly family income in rupees (2022)"
        options={KUPPUSWAMY_INCOME}
        value={monthlyFamilyIncome}
        onChange={onIncomeChange}
        error={errors.monthlyFamilyIncome}
      />

      <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
              Calculated score
            </p>
            <p className="mt-1 text-3xl font-black text-teal-900">
              {complete ? result.totalScore : "—"}
              <span className="ml-2 text-sm font-semibold text-teal-700">
                / 29
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
              Socioeconomic class
            </p>
            <p className="mt-1 text-lg font-bold text-teal-900">
              {complete ? result.socioeconomicCategory : "Pending selection"}
            </p>
          </div>
        </div>
        {complete && (
          <div className="mt-4 grid gap-2 border-t border-teal-200/60 pt-4 text-sm sm:grid-cols-3">
            <p>
              <span className="text-slate-500">Education:</span>{" "}
              <span className="font-semibold">{result.educationScore}</span>
            </p>
            <p>
              <span className="text-slate-500">Occupation:</span>{" "}
              <span className="font-semibold">{result.occupationScore}</span>
            </p>
            <p>
              <span className="text-slate-500">Income:</span>{" "}
              <span className="font-semibold">{result.incomeScore}</span>
            </p>
          </div>
        )}
        <div className="mt-4 rounded-lg bg-white/70 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Class mapping</p>
          <p className="mt-1">
            26–29 Upper (I) · 16–25 Upper middle (II) · 11–15 Lower middle (III)
            · 5–10 Upper lower (IV) · &lt;5 Lower (V)
          </p>
        </div>
      </div>
    </div>
  );
}
