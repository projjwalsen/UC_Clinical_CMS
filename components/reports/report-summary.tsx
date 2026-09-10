"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClinicalDatasetReportRow } from "@/types/clinical-report";
import { calculateRate, meanAge, dataCompletenessScore } from "@/lib/report-calculations";
import {
  DISEASE_ACTIVITY_LABELS,
  FOLLOW_UP_RESPONSE_LABELS,
  IBD_TYPE_LABELS,
  THERAPY_LABELS,
} from "@/lib/report-labels";
import { Card } from "@/components/ui/core";
import { ChartCard } from "@/components/charts/chart-card";

const palette = ["#0f766e", "#2563eb", "#f59e0b", "#dc2626", "#8b5cf6"];

function rateLabel(title: string, rate: ReturnType<typeof calculateRate>) {
  if (rate.percentage === null) return `${title}: not enough eligible records`;
  return `${title}: ${rate.numerator} of ${rate.denominator} eligible (${rate.percentage}%)`;
}

export function ReportSummary({
  rows,
}: {
  rows: ClinicalDatasetReportRow[];
}) {
  const activeRate = calculateRate(
    rows,
    (r) => r.diseaseActivity === 1,
    (r) => r.diseaseActivity === 1 || r.diseaseActivity === 2,
  );
  const remissionRate = calculateRate(
    rows,
    (r) => r.diseaseActivity === 2,
    (r) => r.diseaseActivity === 1 || r.diseaseActivity === 2,
  );
  const biopsyRate = calculateRate(
    rows,
    (r) => r.skinBiopsyPerformed === 1,
    (r) => r.skinBiopsyPerformed === 1 || r.skinBiopsyPerformed === 2,
  );
  const completeResponseRate = calculateRate(
    rows,
    (r) => r.followUpResponse === 1,
    (r) => r.followUpResponse !== undefined,
  );
  const reviewCount = rows.filter((r) => r.recordStatus === "review-required").length;
  const completenessKeys = [
    "ibdType",
    "diseaseActivity",
    "diseaseLocation",
    "currentTherapies",
    "dlqiAtPresentation",
  ];
  const completeness =
    rows.length === 0
      ? 0
      : Math.round(
          rows.reduce(
            (sum, row) =>
              sum +
              dataCompletenessScore(
                row as unknown as Record<string, unknown>,
                completenessKeys,
              ),
            0,
          ) / rows.length,
        );

  const ibdTypeData = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      if (!row.ibdType) return acc;
      const label = IBD_TYPE_LABELS[row.ibdType];
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const activityData = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      if (!row.diseaseActivity) return acc;
      const label = DISEASE_ACTIVITY_LABELS[row.diseaseActivity];
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const therapyData = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      row.currentTherapies.forEach((code) => {
        const label = THERAPY_LABELS[code];
        acc[label] = (acc[label] || 0) + 1;
      });
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const responseData = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      if (!row.followUpResponse) return acc;
      const label = FOLLOW_UP_RESPONSE_LABELS[row.followUpResponse];
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const cards = [
    { label: "Filtered patients", value: String(rows.length) },
    { label: "Mean age", value: meanAge(rows)?.toString() ?? "—" },
    {
      label: "Active disease rate",
      value: activeRate.percentage !== null ? `${activeRate.percentage}%` : "—",
      title: rateLabel("Active disease", activeRate),
    },
    {
      label: "Remission rate",
      value: remissionRate.percentage !== null ? `${remissionRate.percentage}%` : "—",
      title: rateLabel("Remission", remissionRate),
    },
    {
      label: "Biopsy rate",
      value: biopsyRate.percentage !== null ? `${biopsyRate.percentage}%` : "—",
      title: rateLabel("Biopsy performed", biopsyRate),
    },
    {
      label: "Complete response rate",
      value:
        completeResponseRate.percentage !== null
          ? `${completeResponseRate.percentage}%`
          : "—",
      title: rateLabel("Complete response", completeResponseRate),
    },
    { label: "Records requiring review", value: String(reviewCount) },
    { label: "Overall data completeness", value: `${completeness}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <div title={card.title}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="IBD type distribution" description="Filtered cohort">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ibdTypeData} dataKey="value" nameKey="name" outerRadius={70}>
                {ibdTypeData.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Patients"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Disease activity" description="Recorded activity only">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} width={28} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Current therapy usage" description="Patients may appear in multiple classes">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={therapyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Follow-up response" description="Recorded responses in filtered set">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={responseData} dataKey="value" nameKey="name" outerRadius={70}>
                {responseData.map((_, i) => (
                  <Cell key={i} fill={palette[(i + 2) % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Patients"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
