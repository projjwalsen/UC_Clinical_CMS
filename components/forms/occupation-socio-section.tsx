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
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Wage Loss Due to Diseases Per Month (Rs.)">
          <Input
            type="number"
            min={0}
            value={wageLossPerMonthRs}
            onChange={(e) => onChange("wageLossPerMonthRs", e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field label="Days Absent from Work Per Month">
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
        <Field label="Money Spent for Treatment Per Month (Rs.)">
          <Input
            type="number"
            min={0}
            value={treatmentCostPerMonthRs}
            onChange={(e) => onChange("treatmentCostPerMonthRs", e.target.value)}
            placeholder="Optional"
          />
        </Field>
      </div>
      <Field label="Other Socio-Economic Information">
        <Textarea
          value={otherSocioEconomicInfo}
          onChange={(e) => onChange("otherSocioEconomicInfo", e.target.value)}
          placeholder="Optional notes on employment, insurance, or household impact"
        />
      </Field>
    </div>
  );
}
