"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Download,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/demo-store";
import { ChartCard } from "@/components/charts/chart-card";
import { Badge, Button, Card, PageHeader, Select } from "@/components/ui/core";
import { downloadCsv } from "@/lib/utils";

const aggregate = <T,>(items: T[], get: (i: T) => string) =>
  Object.entries(
    items.reduce<Record<string, number>>((a, i) => {
      const k = get(i);
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
const palette = ["#0f766e", "#2563eb", "#f59e0b", "#dc2626", "#8b5cf6"];

export function StatisticalReports() {
  const { patients, records } = useDemoStore();
  const [severity, setSeverity] = useState("All");
  const [gender, setGender] = useState("All");
  const [extent, setExtent] = useState("All");
  const cohort = patients.filter(
    (p) =>
      !p.archived &&
      (severity === "All" || p.severity === severity) &&
      (gender === "All" || p.gender === gender) &&
      (extent === "All" || p.diseaseExtent === extent),
  );
  const demographics = aggregate(cohort, (p) =>
    p.age < 30 ? "18–29" : p.age < 50 ? "30–49" : "50+",
  );
  const disease = aggregate(cohort, (p) => p.diseaseExtent);
  const severityData = aggregate(cohort, (p) => p.severity);
  const medications = aggregate(
    records.medications.filter((m) => cohort.some((p) => p.id === m.patientId)),
    (m) => m.drugName,
  );
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, 9 + i).toLocaleString("en", { month: "short" }),
    crp: 5 + ((i * 7) % 21),
    hb: 10 + ((i * 3) % 4),
    followUp: 68 + ((i * 5) % 28),
    relapses: records.relapses.filter((_, n) => n % 12 === i).length,
  }));
  return (
    <div>
      <PageHeader
        eyebrow="Cohort analytics"
        title="Statistical reports"
        description="Clinically plausible synthetic data for interface evaluation—not research evidence."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv(
                "statistical-report-demo.csv",
                cohort as unknown as Record<string, unknown>[],
              )
            }
          >
            <Download className="size-4" />
            Export data
          </Button>
        }
      />
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
        <p>
          <strong>Synthetic demonstration data.</strong> The information shown
          in this prototype is synthetic demonstration data and must not be used
          for clinical decisions.
        </p>
      </div>
      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <span className="mr-2 text-xs font-bold text-slate-700">
          Global report filters
        </span>
        <Select aria-label="Date range">
          <option>Last 12 months</option>
          <option>Year to date</option>
          <option>All dates</option>
        </Select>
        <Select aria-label="Age range">
          <option>All ages</option>
          <option>18–29</option>
          <option>30–49</option>
          <option>50+</option>
        </Select>
        <Select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option>All</option>
          <option>Male</option>
          <option>Female</option>
        </Select>
        <Select>
          <option>All locations</option>
          {Array.from(new Set(patients.map((p) => p.city))).map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
        <Select value={extent} onChange={(e) => setExtent(e.target.value)}>
          <option>All</option>
          <option>Proctitis</option>
          <option>Left-sided colitis</option>
          <option>Pancolitis</option>
        </Select>
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option>All</option>
          <option>Mild</option>
          <option>Moderate</option>
          <option>Severe</option>
        </Select>
        <Select>
          <option>All medications</option>
          <option>Mesalamine</option>
          <option>Infliximab</option>
        </Select>
        <Select>
          <option>Any relapse status</option>
          <option>Relapse recorded</option>
        </Select>
        <Select>
          <option>Any surgery status</option>
          <option>Surgical</option>
        </Select>
        <Select>
          <option>All outcomes</option>
          <option>Remission</option>
        </Select>
      </Card>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Patients in cohort", cohort.length],
          [
            "Mean age",
            `${Math.round(cohort.reduce((s, p) => s + p.age, 0) / Math.max(cohort.length, 1))} yrs`,
          ],
          [
            "Remission rate",
            `${Math.round((cohort.filter((p) => p.status === "Remission").length / Math.max(cohort.length, 1)) * 100)}%`,
          ],
          [
            "Follow-up complete",
            `${Math.round((cohort.filter((p) => p.followUpStatus === "Complete").length / Math.max(cohort.length, 1)) * 100)}%`,
          ],
        ].map(([k, v]) => (
          <Card key={k} className="p-5">
            <p className="text-xs font-semibold text-slate-500">{k}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{v}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Patient demographics"
          description="Age distribution in the filtered cohort."
        >
          <BarChart data={demographics}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              name="Patients"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartCard>
        <ChartCard
          title="Disease characteristics"
          description="Extent of disease at the latest assessment."
        >
          <PieChart>
            <Pie
              data={disease}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={92}
            >
              {disease.map((_, i) => (
                <Cell key={i} fill={palette[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard
          title="Clinical severity"
          description="Severity classification across the cohort."
        >
          <BarChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard
          title="Laboratory trends"
          description="Illustrative mean CRP and haemoglobin trends."
        >
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="crp" name="CRP (mg/L)" stroke="#dc2626" />
            <Line dataKey="hb" name="Hb (g/dL)" stroke="#2563eb" />
          </LineChart>
        </ChartCard>
        <ChartCard
          title="Treatment patterns"
          description="Current medication usage in matching records."
        >
          <BarChart data={medications} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={90} />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard
          title="Relapse analysis"
          description="Monthly relapse event counts."
        >
          <AreaChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area dataKey="relapses" stroke="#dc2626" fill="#fecaca" />
          </AreaChart>
        </ChartCard>
        <ChartCard
          title="Follow-up performance"
          description="Completed scheduled follow-ups by month."
        >
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              dataKey="followUp"
              name="Completion %"
              stroke="#0f766e"
              strokeWidth={3}
            />
          </LineChart>
        </ChartCard>
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-sm font-bold">Outcome matrix</h3>
            <p className="text-xs text-slate-500">
              Disease severity by latest outcome
            </p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div />
              {["Remission", "Active", "Relapse", "Surgery"].map((x) => (
                <div key={x} className="font-bold text-slate-500">
                  {x}
                </div>
              ))}
              {["Mild", "Moderate", "Severe"].flatMap((s) => (
                <>
                  <div
                    key={`${s}-label`}
                    className="py-4 font-bold text-slate-600"
                  >
                    {s}
                  </div>
                  {[
                    "Remission",
                    "Active disease",
                    "Relapse",
                    "Post-surgery",
                  ].map((o) => {
                    const n = cohort.filter(
                      (p) => p.severity === s && p.status === o,
                    ).length;
                    return (
                      <div
                        key={`${s}-${o}`}
                        className="rounded-lg py-4 font-bold text-teal-950"
                        style={{
                          backgroundColor: `rgba(13,148,136,${0.08 + n * 0.06})`,
                        }}
                      >
                        {n}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <Card className="mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Additional analytical modules</h3>
            <p className="text-xs text-slate-500">
              Available in the complete workbook-aligned reporting model.
            </p>
          </div>
          <Badge tone="teal">{cohort.length} records</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Clinical symptoms",
            "Medication response",
            "Endoscopy findings",
            "Surgery outcomes",
            "Pregnancy outcomes",
            "IPAA outcomes",
            "Pouchoscopy outcomes",
          ].map((x) => (
            <Badge key={x}>{x}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

const reportSteps = [
  "Details",
  "Population",
  "Measures",
  "Grouping",
  "Visualization",
  "Preview",
];
export function ReportBuilder() {
  const { patients, reports, saveReport } = useDemoStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Custom cohort analysis");
  const [description, setDescription] = useState(
    "Interactive synthetic cohort report.",
  );
  const [period, setPeriod] = useState("Last 12 months");
  const [gender, setGender] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [measures, setMeasures] = useState(["Patient count", "Remission rate"]);
  const [grouping, setGrouping] = useState("Disease severity");
  const [visualization, setVisualization] = useState<
    | "Bar chart"
    | "Line chart"
    | "Area chart"
    | "Donut chart"
    | "Table"
    | "Summary cards"
  >("Bar chart");
  const [legend, setLegend] = useState(true);
  const [labels, setLabels] = useState(false);
  const filtered = patients.filter(
    (p) =>
      (gender === "All" || p.gender === gender) &&
      (severity === "All" || p.severity === severity),
  );
  const groupData = aggregate(filtered, (p) =>
    grouping === "Gender"
      ? p.gender
      : grouping === "Age group"
        ? p.age < 30
          ? "18–29"
          : p.age < 50
            ? "30–49"
            : "50+"
        : grouping === "Location"
          ? p.city
          : grouping === "Outcome"
            ? p.status
            : p.severity,
  );
  const save = () => {
    saveReport({
      id: `REPORT-${Date.now()}`,
      name,
      description,
      period,
      filters: { gender, severity },
      measures,
      grouping,
      visualization:
        visualization === "Donut chart" ? "Donut chart" : visualization,
      showLegend: legend,
      showLabels: labels,
      chartTitle: name,
      updatedAt: "2026-09-07",
    });
    toast.success("Report configuration saved locally");
  };
  const preview =
    visualization === "Table" ? (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-left">{grouping}</th>
              <th className="p-3 text-right">Patients</th>
            </tr>
          </thead>
          <tbody>
            {groupData.map((r) => (
              <tr key={r.name} className="border-t border-slate-100">
                <td className="p-3">{r.name}</td>
                <td className="p-3 text-right font-bold">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : visualization === "Summary cards" ? (
      <div className="grid gap-3 sm:grid-cols-3">
        {groupData.map((r) => (
          <div key={r.name} className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs text-slate-500">{r.name}</p>
            <p className="mt-2 text-3xl font-bold">{r.value}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="h-80">
        {/* standalone responsive container supplied by ChartCard below */}
        <ChartCard
          className="border-0 shadow-none"
          title={name}
          description={`${period} · ${filtered.length} synthetic patients`}
        >
          {visualization === "Donut chart" ? (
            <PieChart>
              <Pie
                data={groupData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                label={labels}
              >
                {groupData.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
              {legend && <Legend />}
            </PieChart>
          ) : visualization === "Line chart" ? (
            <LineChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="value"
                stroke="#0f766e"
                strokeWidth={3}
                label={labels}
              />
              {legend && <Legend />}
            </LineChart>
          ) : visualization === "Area chart" ? (
            <AreaChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                dataKey="value"
                stroke="#0f766e"
                fill="#ccfbf1"
                label={labels}
              />
              {legend && <Legend />}
            </AreaChart>
          ) : (
            <BarChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#0f766e"
                radius={[6, 6, 0, 0]}
                label={labels}
              />
              {legend && <Legend />}
            </BarChart>
          )}
        </ChartCard>
      </div>
    );
  return (
    <div>
      <PageHeader
        eyebrow="Advanced analytics"
        title="Custom report builder"
        description="Configure and preview reports entirely in this browser."
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              Print / PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadCsv("custom-report.csv", groupData)}
            >
              <Download className="size-4" />
              CSV
            </Button>
            <Button onClick={save}>
              <Save className="size-4" />
              Save report
            </Button>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-6 rounded-xl border border-slate-200 bg-white">
        {reportSteps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`border-b-2 px-2 py-4 text-xs font-bold ${i === step ? "border-teal-700 text-teal-700" : "border-transparent text-slate-400"}`}
          >
            <span className="mx-auto mb-1 block">{i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <h2 className="mb-5 text-lg font-bold">{reportSteps[step]}</h2>
          {step === 0 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold">
                Report name
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block text-xs font-bold">
                Description
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <label className="block text-xs font-bold">
                Reporting period
                <Select
                  className="mt-1 w-full"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option>Last 12 months</option>
                  <option>Year to date</option>
                  <option>All dates</option>
                </Select>
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Gender", gender, setGender, ["All", "Male", "Female"]],
                [
                  "Disease severity",
                  severity,
                  setSeverity,
                  ["All", "Mild", "Moderate", "Severe"],
                ],
              ].map(([l, v, setter, opts]) => (
                <label key={l as string} className="text-xs font-bold">
                  {l as string}
                  <Select
                    className="mt-1 w-full"
                    value={v as string}
                    onChange={(e) =>
                      (setter as (v: string) => void)(e.target.value)
                    }
                  >
                    {(opts as string[]).map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                </label>
              ))}
              {[
                "Age range",
                "Location",
                "Diagnosis period",
                "Disease duration",
                "Disease extent",
                "Medication",
                "Relapse",
                "Surgery",
                "Pregnancy",
                "Current outcome",
              ].map((x) => (
                <label key={x} className="text-xs font-bold">
                  {x}
                  <Select className="mt-1 w-full">
                    <option>Any</option>
                  </Select>
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2">
              {[
                "Patient count",
                "Average age",
                "Average age at diagnosis",
                "Gender distribution",
                "Average disease duration",
                "Remission rate",
                "Relapse rate",
                "Surgery rate",
                "Medication usage",
                "Follow-up rate",
                "Laboratory averages",
                "Pregnancy outcomes",
              ].map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={measures.includes(m)}
                    onChange={() =>
                      setMeasures((v) =>
                        v.includes(m) ? v.filter((x) => x !== m) : [...v, m],
                      )
                    }
                  />
                  {m}
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Month",
                "Quarter",
                "Year",
                "Age group",
                "Gender",
                "Location",
                "Disease extent",
                "Disease severity",
                "Medication",
                "Outcome",
              ].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrouping(g)}
                  className={`rounded-lg border p-3 text-left text-sm font-semibold ${grouping === g ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Summary cards",
                  "Table",
                  "Bar chart",
                  "Line chart",
                  "Area chart",
                  "Donut chart",
                ].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisualization(v as typeof visualization)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${visualization === v ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200"}`}
                  >
                    <BarChart3 className="size-4" />
                    {v}
                  </button>
                ))}
              </div>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={legend}
                  onChange={() => setLegend(!legend)}
                />
                Show legend
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={labels}
                  onChange={() => setLabels(!labels)}
                />
                Show data labels
              </label>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <strong>{filtered.length}</strong> synthetic patients match.
              </p>
              <p>
                {measures.length} measures grouped by {grouping}.
              </p>
              <Button onClick={save}>
                <Sparkles className="size-4" />
                Save configuration
              </Button>
            </div>
          )}
          <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              Previous
            </Button>
            <Button disabled={step === 5} onClick={() => setStep(step + 1)}>
              Next step
            </Button>
          </div>
        </Card>
        <Card className="min-h-[480px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                Live preview
              </p>
              <h3 className="font-bold">{name}</h3>
            </div>
            <Badge tone="green">Generated locally</Badge>
          </div>
          {preview}
        </Card>
      </div>
      <div className="mt-5">
        <h2 className="mb-3 text-base font-bold">Saved reports</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {reports.map((r) => (
            <Card key={r.id} className="p-4">
              <p className="text-sm font-bold">{r.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {r.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge>{r.visualization}</Badge>
                <button
                  className="text-xs font-bold text-teal-700"
                  onClick={() => {
                    setName(`${r.name} copy`);
                    setGrouping(r.grouping);
                    toast.success("Report duplicated into builder");
                  }}
                >
                  Duplicate
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
