"use client";

import { useMemo, useState } from "react";
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
  Activity,
  CalendarCheck,
  HeartPulse,
  Plus,
  Scissors,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import {
  Button,
  Card,
  PageHeader,
  Select,
  StatusBadge,
} from "@/components/ui/core";
import { ChartCard } from "@/components/charts/chart-card";
import { formatDate } from "@/lib/utils";

const colors = ["#0f766e", "#2563eb", "#f59e0b", "#dc2626", "#8b5cf6"];
const countBy = <T,>(items: T[], get: (item: T) => string) =>
  Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const key = get(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

export function Dashboard({
  onNavigate,
  onPatient,
}: {
  onNavigate: (page: string) => void;
  onPatient: (id: string) => void;
}) {
  const { patients, records } = useDemoStore();
  const [filters, setFilters] = useState({
    gender: "All",
    age: "All",
    extent: "All",
    severity: "All",
    treatment: "All",
    outcome: "All",
  });
  const active = patients.filter((p) => !p.archived);
  const filtered = useMemo(
    () =>
      active.filter(
        (p) =>
          (filters.gender === "All" || p.gender === filters.gender) &&
          (filters.extent === "All" || p.diseaseExtent === filters.extent) &&
          (filters.severity === "All" || p.severity === filters.severity) &&
          (filters.outcome === "All" || p.status === filters.outcome) &&
          (filters.age === "All" ||
            (filters.age === "18–29"
              ? p.age < 30
              : filters.age === "30–49"
                ? p.age >= 30 && p.age < 50
                : p.age >= 50)) &&
          (filters.treatment === "All" ||
            records.medications.some(
              (m) => m.patientId === p.id && m.drugName === filters.treatment,
            )),
      ),
    [active, filters, records.medications],
  );

  const kpis = [
    ["Registered patients", filtered.length, "+8.4%", Users, "up"],
    [
      "Active patients",
      filtered.filter((p) => p.status !== "Post-surgery").length,
      "+3.1%",
      UserCheck,
      "up",
    ],
    [
      "New this month",
      filtered.filter((p) => p.registrationDate >= "2026-09-01").length,
      "+2",
      Activity,
      "up",
    ],
    [
      "In remission",
      filtered.filter((p) => p.status === "Remission").length,
      "+5.2%",
      HeartPulse,
      "up",
    ],
    [
      "Active relapses",
      filtered.filter((p) => p.status === "Relapse").length,
      "-1.8%",
      TrendingDown,
      "down",
    ],
    [
      "Surgical cases",
      records.surgeries.filter((r) =>
        filtered.some((p) => p.id === r.patientId),
      ).length,
      "No change",
      Scissors,
      "flat",
    ],
    [
      "Follow-up completion",
      `${Math.round((filtered.filter((p) => p.followUpStatus === "Complete").length / Math.max(filtered.length, 1)) * 100)}%`,
      "+4.7%",
      CalendarCheck,
      "up",
    ],
  ] as const;
  const ageData = countBy(filtered, (p) =>
    p.age < 30 ? "18–29" : p.age < 50 ? "30–49" : "50+",
  );
  const genderData = countBy(filtered, (p) => p.gender);
  const extentData = countBy(filtered, (p) => p.diseaseExtent);
  const severityData = countBy(filtered, (p) => p.severity);
  const statusData = countBy(filtered, (p) =>
    p.status === "Remission" ? "Remission" : "Active disease",
  );
  const meds = countBy(
    records.medications.filter((m) =>
      filtered.some((p) => p.id === m.patientId),
    ),
    (m) => m.drugName,
  );
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, 9 + i).toLocaleString("en", {
      month: "short",
    });
    const key = `${new Date(2025, 9 + i).getFullYear()}-${String(new Date(2025, 9 + i).getMonth() + 1).padStart(2, "0")}`;
    return {
      month,
      registrations: filtered.filter((p) => p.registrationDate.startsWith(key))
        .length,
      relapses: records.relapses.filter(
        (r) =>
          r.date.startsWith(key) && filtered.some((p) => p.id === r.patientId),
      ).length,
      followUp: 68 + ((i * 4) % 27),
    };
  });
  const recent = [...filtered]
    .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        eyebrow="Executive overview"
        title="Clinical programme dashboard"
        description="Live view of the synthetic demonstration cohort and follow-up performance."
        actions={
          <Button onClick={() => onNavigate("add-patient")}>
            <Plus className="size-4" />
            Add patient
          </Button>
        }
      />
      <Card className="mb-5 flex flex-wrap items-end gap-3 p-4">
        <div className="mr-2">
          <p className="text-xs font-bold text-slate-800">Cohort filters</p>
          <p className="text-[11px] text-slate-500">
            {filtered.length} patients match
          </p>
        </div>
        {[
          ["gender", ["All", "Male", "Female"]],
          ["age", ["All", "18–29", "30–49", "50+"]],
          ["extent", ["All", "Proctitis", "Left-sided colitis", "Pancolitis"]],
          ["severity", ["All", "Mild", "Moderate", "Severe"]],
          [
            "treatment",
            [
              "All",
              ...Array.from(
                new Set(records.medications.map((m) => m.drugName)),
              ),
            ],
          ],
          [
            "outcome",
            ["All", "Remission", "Active disease", "Relapse", "Post-surgery"],
          ],
        ].map(([key, options]) => (
          <Select
            key={key as string}
            aria-label={key as string}
            value={filters[key as keyof typeof filters]}
            onChange={(e) =>
              setFilters((f) => ({ ...f, [key as string]: e.target.value }))
            }
          >
            {(options as string[]).map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        ))}
        <Select aria-label="Date range">
          <option>Last 12 months</option>
          <option>Last 6 months</option>
          <option>Year to date</option>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setFilters({
              gender: "All",
              age: "All",
              extent: "All",
              severity: "All",
              treatment: "All",
              outcome: "All",
            })
          }
        >
          Reset
        </Button>
      </Card>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {kpis.map(([label, value, change, Icon, trend]) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-teal-50 p-2 text-teal-700">
                <Icon className="size-4" />
              </span>
              {trend === "up" ? (
                <TrendingUp className="size-4 text-emerald-600" />
              ) : trend === "down" ? (
                <TrendingDown className="size-4 text-emerald-600" />
              ) : null}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">{label}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              <span
                className={
                  trend === "up" || trend === "down"
                    ? "font-bold text-emerald-600"
                    : ""
                }
              >
                {change}
              </span>{" "}
              vs previous period
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Patient registrations"
          description="Monthly registrations in the selected cohort."
        >
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="tealArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="registrations"
              stroke="#0f766e"
              fill="url(#tealArea)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartCard>
        <ChartCard
          title="Age distribution"
          description="Registered patients grouped by current age."
        >
          <BarChart data={ageData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
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
          title="Gender distribution"
          description="Self-reported gender across the cohort."
        >
          <PieChart>
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={3}
            >
              {genderData.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard
          title="Disease extent"
          description="Montreal extent categories mapped from the workbook."
        >
          <BarChart data={extentData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              name="Patients"
              fill="#0f766e"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartCard>
        <ChartCard
          title="Disease severity"
          description="Current clinical severity classification."
        >
          <PieChart>
            <Pie
              data={severityData}
              dataKey="value"
              nameKey="name"
              outerRadius={92}
            >
              {severityData.map((_, i) => (
                <Cell key={i} fill={["#22c55e", "#f59e0b", "#dc2626"][i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard
          title="Remission vs active disease"
          description="Latest recorded clinical state."
        >
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={92}
            >
              {statusData.map((_, i) => (
                <Cell key={i} fill={["#10b981", "#f59e0b"][i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard
          title="Relapses by month"
          description="Documented relapse events over the reporting period."
        >
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="relapses"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartCard>
        <ChartCard
          title="Medication usage"
          description="Current medication episodes by drug."
        >
          <BarChart data={meds}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar
              dataKey="value"
              name="Patients"
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartCard>
        <ChartCard
          title="Surgical vs non-surgical"
          description="Patients with a recorded surgical episode."
        >
          <PieChart>
            <Pie
              data={[
                { name: "Surgical", value: records.surgeries.length },
                {
                  name: "Non-surgical",
                  value: Math.max(
                    0,
                    filtered.length - records.surgeries.length,
                  ),
                },
              ]}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={92}
            >
              <Cell fill="#2563eb" />
              <Cell fill="#cbd5e1" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard
          title="Follow-up completion trend"
          description="Monthly completion rate for scheduled follow-up."
        >
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line
              type="monotone"
              dataKey="followUp"
              name="Completion"
              stroke="#0f766e"
              strokeWidth={2}
            />
          </LineChart>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="text-sm font-bold">
                Recently registered patients
              </h3>
              <p className="text-xs text-slate-500">Newest synthetic records</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("patients")}
            >
              View all
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Extent</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onPatient(p.id)}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.id}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.diseaseExtent}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(p.registrationDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-sm font-bold">Clinical alerts</h3>
            <p className="text-xs text-slate-500">Items requiring attention</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered
              .filter(
                (p) => p.followUpStatus === "Overdue" || p.status === "Relapse",
              )
              .slice(0, 5)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPatient(p.id)}
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50"
                >
                  <span
                    className={`mt-1 size-2 rounded-full ${p.status === "Relapse" ? "bg-red-500" : "bg-amber-500"}`}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      {p.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {p.status === "Relapse"
                        ? "Active relapse requires review"
                        : "Follow-up appointment overdue"}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
