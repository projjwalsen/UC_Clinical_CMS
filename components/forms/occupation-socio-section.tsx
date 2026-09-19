"use client";

import { Field, Input, Textarea } from "@/components/ui/core";

export function OccupationSocioSection({
  wageLossPerMonthRs,
  daysAbsentFromWorkPerMonth,
  treatmentCostPerMonthRs,
  otherSocioEconomicInfo,
  onChange,
}: {
  wageLossPerMonthRs: string;
  daysAbsentFromWorkPerMonth: string;
  treatmentCostPerMonthRs: string;
  otherSocioEconomicInfo: string;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="mt-8 space-y-4 border-t border-slate-100 pt-8">
      <div>
        <h2 className="text-lg font-bold">Occupation &amp; work impact</h2>
        <p className="mt-1 text-sm text-slate-500">
          Optional socioeconomic impact fields aligned with the reference
          follow-up workbook (demo values only).
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Wage loss due to disease per month (Rs.)">
          <Input
            type="number"
            min={0}
            value={wageLossPerMonthRs}
            onChange={(e) => onChange("wageLossPerMonthRs", e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Days absent from work per month">
          <Input
            type="number"
            min={0}
            max={31}
            value={daysAbsentFromWorkPerMonth}
            onChange={(e) =>
              onChange("daysAbsentFromWorkPerMonth", e.target.value)
            }
            placeholder="Optional"
          />
        </Field>
        <Field label="Money spent for treatment per month (Rs.)">
          <Input
            type="number"
            min={0}
            value={treatmentCostPerMonthRs}
            onChange={(e) => onChange("treatmentCostPerMonthRs", e.target.value)}
            placeholder="Optional"
          />
        </Field>
      </div>
      <Field label="Other socio-economic information">
        <Textarea
          value={otherSocioEconomicInfo}
          onChange={(e) => onChange("otherSocioEconomicInfo", e.target.value)}
          placeholder="Optional notes on employment, insurance, or household impact"
        />
      </Field>
    </div>
  );
}
