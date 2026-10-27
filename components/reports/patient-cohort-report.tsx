"use client";

import { useMemo, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/demo-store";
import { downloadPatientReportExcel } from "@/lib/patient-report-excel";
import {
  buildPatientReport,
  defaultPatientReportFilters,
  endoscopySummary,
  pregnancySummary,
  relapseSummary,
  showText,
  type PatientReportEntry,
  type PatientReportFilters,
} from "@/lib/patient-report";
import { formatDate } from "@/lib/utils";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  StatusBadge,
} from "@/components/ui/core";

export function PatientCohortReport() {
  const { patients, records } = useDemoStore();
  const [filters, setFilters] = useState<PatientReportFilters>(
    defaultPatientReportFilters,
  );
  const [exporting, setExporting] = useState(false);
  const cities = useMemo(
    () => Array.from(new Set(patients.map((patient) => patient.city))).sort(),
    [patients],
  );
  const results = useMemo(
    () => buildPatientReport(patients, records, filters),
    [patients, records, filters],
  );

  const set = <K extends keyof PatientReportFilters>(
    key: K,
    value: PatientReportFilters[K],
  ) => setFilters((current) => ({ ...current, [key]: value }));

  const exportExcel = async () => {
    if (!results.length) {
      toast.error("No patients match these filters");
      return;
    }
    setExporting(true);
    try {
      await downloadPatientReportExcel(results);
      toast.success(
        `Exported ${results.length} patient${results.length === 1 ? "" : "s"} to Excel`,
      );
    } catch {
      toast.error("Excel export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operator report"
        title="Patient report"
        description="Filter the cohort, review each matching patient, and download the same result as an Excel workbook."
        actions={
          <Button onClick={exportExcel} disabled={exporting || !results.length}>
            <Download className="size-4" />
            {exporting ? "Exporting…" : "Export Excel"}
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Filters
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters(defaultPatientReportFilters())}
          >
            <RotateCcw className="size-3.5" />
            Clear
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Search">
            <Input
              value={filters.query}
              placeholder="Name, UC ID, phone, address"
              onChange={(event) => set("query", event.target.value)}
            />
          </Field>
          <Field label="Gender">
            <Select
              className="w-full"
              value={filters.gender}
              onChange={(event) =>
                set("gender", event.target.value as PatientReportFilters["gender"])
              }
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </Field>
          <Field label="Age from">
            <Input
              type="number"
              min={0}
              value={filters.ageMin}
              placeholder="Any"
              onChange={(event) => set("ageMin", event.target.value)}
            />
          </Field>
          <Field label="Age to">
            <Input
              type="number"
              min={0}
              value={filters.ageMax}
              placeholder="Any"
              onChange={(event) => set("ageMax", event.target.value)}
            />
          </Field>
          <Field label="City">
            <Select
              className="w-full"
              value={filters.city}
              onChange={(event) => set("city", event.target.value)}
            >
              <option value="All">All</option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </Select>
          </Field>
          <Field label="Disease extent">
            <Select
              className="w-full"
              value={filters.extent}
              onChange={(event) => set("extent", event.target.value)}
            >
              <option value="All">All</option>
              <option>Proctitis</option>
              <option>Left-sided colitis</option>
              <option>Pancolitis</option>
            </Select>
          </Field>
          <Field label="Severity">
            <Select
              className="w-full"
              value={filters.severity}
              onChange={(event) => set("severity", event.target.value)}
            >
              <option value="All">All</option>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </Select>
          </Field>
          <Field label="Clinical status">
            <Select
              className="w-full"
              value={filters.status}
              onChange={(event) => set("status", event.target.value)}
            >
              <option value="All">All</option>
              <option>Remission</option>
              <option>Active disease</option>
              <option>Relapse</option>
              <option>Post-surgery</option>
            </Select>
          </Field>
          <Field label="Follow-up status">
            <Select
              className="w-full"
              value={filters.followUp}
              onChange={(event) => set("followUp", event.target.value)}
            >
              <option value="All">All</option>
              <option>Complete</option>
              <option>Due soon</option>
              <option>Overdue</option>
            </Select>
          </Field>
          <Field label="Follow-up from">
            <Input
              type="date"
              value={filters.followUpFrom}
              onChange={(event) => set("followUpFrom", event.target.value)}
            />
          </Field>
          <Field label="Follow-up to">
            <Input
              type="date"
              value={filters.followUpTo}
              onChange={(event) => set("followUpTo", event.target.value)}
            />
          </Field>
          <PresenceField
            label="Colonoscopy"
            value={filters.colonoscopy}
            onChange={(value) => set("colonoscopy", value)}
          />
          <PresenceField
            label="Relapse"
            value={filters.relapse}
            onChange={(value) => set("relapse", value)}
          />
          <PresenceField
            label="Pregnancy"
            value={filters.pregnancy}
            onChange={(value) => set("pregnancy", value)}
          />
        </div>
      </Card>

      <p className="mb-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{results.length}</span> of{" "}
        {patients.filter((patient) => !patient.archived).length} patients
      </p>

      {!results.length ? (
        <EmptyState
          title="No patients match"
          description="Clear a filter or widen the age and follow-up dates."
        />
      ) : (
        <div className="space-y-4">
          {results.map((entry) => (
            <PatientReportCard key={entry.patient.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function PresenceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PatientReportFilters["colonoscopy"];
  onChange: (value: PatientReportFilters["colonoscopy"]) => void;
}) {
  return (
    <Field label={label}>
      <Select
        className="w-full"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as PatientReportFilters["colonoscopy"])
        }
      >
        <option value="All">All</option>
        <option value="Recorded">Recorded</option>
        <option value="Not recorded">Not recorded</option>
      </Select>
    </Field>
  );
}

function PatientReportCard({ entry }: { entry: PatientReportEntry }) {
  const { patient, lastVisit, mother } = entry;
  const baseline: [string, string][] = [
    ["UC ID", patient.id],
    ["IBD code", showText(patient.ibdCode)],
    ["Name", patient.name],
    ["Gender", patient.gender],
    ["Age", String(patient.age)],
    ["Date of birth", formatDate(patient.dateOfBirth)],
    ["Phone", patient.phone],
    ["Alternate phone", showText(patient.alternatePhone)],
    ["Email", showText(patient.email)],
    ["Address", patient.address],
    ["City", patient.city],
    ["State", patient.state],
    ["PIN", patient.pinCode],
    ["Police station", showText(patient.policeStation)],
    ["Religion", patient.religion],
    ["Marital status", patient.maritalStatus],
    ["Children", String(patient.children)],
    ["Occupation", showText(patient.occupationText || patient.occupation)],
    ["Education", patient.education],
    ["Diet", patient.diet],
    ["Family income", showText(patient.monthlyFamilyIncome)],
    ["Socioeconomic category", patient.socioeconomicCategory],
    ["Diagnosis date", formatDate(patient.diagnosisDate)],
    ["Age at diagnosis", String(patient.ageAtDiagnosis)],
    ["Disease duration", `${patient.diseaseDurationYears} years`],
    ["Extent", patient.diseaseExtent],
    ["Severity", patient.severity],
    ["Clinical status", patient.status],
    ["Smoking", patient.smokingStatus],
    ["Family history", patient.familyHistory ? "Yes" : "No"],
    ["Comorbidities", patient.comorbidities.join(", ") || "None"],
    ["Follow-up status", patient.followUpStatus],
    ["Registered", formatDate(patient.registrationDate)],
    ["Notes", patient.notes],
  ];
  const followUp: [string, string][] = lastVisit
    ? [
        ["Date", formatDate(lastVisit.date)],
        ["Visit type", showText(lastVisit.type)],
        ["Clinical state", showText(lastVisit.clinicalState)],
        ["Disease status", showText(lastVisit.diseaseStatus)],
        ["Extent", showText(lastVisit.diseaseExtent)],
        ["Severity", showText(lastVisit.severity)],
        ["Partial Mayo", showText(lastVisit.partialMayoScore)],
        ["Complete Mayo", showText(lastVisit.completeMayoScore)],
        ["Height (m)", showText(lastVisit.heightM)],
        ["Weight (kg)", showText(lastVisit.weightKg)],
        ["BMI", showText(lastVisit.bmi)],
        ["Admission", showText(lastVisit.admission)],
        ["Smoking", showText(lastVisit.smokingStatus)],
        ["Notes", showText(lastVisit.clinicalNotes || lastVisit.specialComment)],
      ]
    : [["Last updated", formatDate(entry.followUpDate)]];

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
            {patient.id}
          </p>
          <h2 className="text-lg font-bold text-slate-950">{patient.name}</h2>
          <p className="text-sm text-slate-500">
            {patient.gender} · {patient.age} years · {patient.address}, {patient.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={patient.status} />
          <StatusBadge status={patient.followUpStatus} />
        </div>
      </div>

      <Section title="Baseline">
        <Facts items={baseline} />
      </Section>
      <Section title="Last follow-up">
        <Facts items={followUp} />
      </Section>
      {patient.gender === "Female" && (
        <Section title="Pregnancy">
          {mother && (
            <Facts
              items={[
                ["Total offspring", showText(mother.totalOffspring)],
                [
                  "Children after disease onset",
                  showText(mother.offspringSinceIbdOnset),
                ],
                ["No. of pregnancy", showText(mother.numberOfPregnancies)],
              ]}
            />
          )}
          {!entry.pregnancies.length ? (
            <p className="mt-3 text-sm text-slate-500">No pregnancy recorded.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    {["#", "Year", "Weeks", "Activity", "Course", "Outcome", "Infant", "Remarks"].map(
                      (label) => (
                        <th key={label} className="px-3 py-2 font-semibold">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {entry.pregnancies.map((record) => {
                    const item = pregnancySummary(record);
                    return (
                      <tr key={record.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{showText(item.number)}</td>
                        <td className="px-3 py-2">{showText(item.year)}</td>
                        <td className="px-3 py-2">{showText(item.durationWeeks)}</td>
                        <td className="px-3 py-2">{showText(item.activity)}</td>
                        <td className="px-3 py-2">{showText(item.course)}</td>
                        <td className="px-3 py-2">{showText(item.outcome)}</td>
                        <td className="px-3 py-2">
                          {item.infantWeight === undefined
                            ? "—"
                            : `${item.infantWeight} kg`}
                        </td>
                        <td className="px-3 py-2">{showText(item.remarks)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}
      <Section title="Colonoscopy">
        {!entry.firstColonoscopy ? (
          <p className="text-sm text-slate-500">No colonoscopy recorded.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            <ColonoscopyBlock
              label={entry.lastColonoscopy ? "First" : "Only recorded"}
              record={entry.firstColonoscopy}
            />
            {entry.lastColonoscopy && (
              <ColonoscopyBlock label="Last" record={entry.lastColonoscopy} />
            )}
          </div>
        )}
      </Section>
      <Section title="Relapses">
        {!entry.relapses.length ? (
          <p className="text-sm text-slate-500">No relapse recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  {["Date", "Cause", "Admission", "Steroid", "Infection", "Rescue", "Outcome", "Remarks"].map(
                    (label) => (
                      <th key={label} className="px-3 py-2 font-semibold">
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {entry.relapses.map((record) => {
                  const item = relapseSummary(record);
                  return (
                    <tr key={record.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{formatDate(item.date)}</td>
                      <td className="px-3 py-2">{showText(item.cause)}</td>
                      <td className="px-3 py-2">
                        {showText(item.admission)}
                        {item.admissionDays
                          ? ` · ${item.admissionDays} days`
                          : ""}
                      </td>
                      <td className="px-3 py-2">{showText(item.steroid)}</td>
                      <td className="px-3 py-2">
                        {showText(item.infection)}
                        {item.infectionType ? ` · ${item.infectionType}` : ""}
                      </td>
                      <td className="px-3 py-2">
                        {showText(item.rescue)}
                        {item.rescueType ? ` · ${item.rescueType}` : ""}
                      </td>
                      <td className="px-3 py-2">{showText(item.outcome)}</td>
                      <td className="px-3 py-2">{showText(item.remarks)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 border-t border-slate-100 pt-4 first:mt-0 first:border-0 first:pt-0">
      <h3 className="mb-3 text-sm font-bold text-teal-800">{title}</h3>
      {children}
    </section>
  );
}

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ColonoscopyBlock({
  label,
  record,
}: {
  label: string;
  record: NonNullable<PatientReportEntry["firstColonoscopy"]>;
}) {
  const item = endoscopySummary(record);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <Facts
        items={[
          ["Date", formatDate(item.date)],
          ["Findings", showText(item.findings)],
          ["Mayo", showText(item.mayo)],
          ["UCEIS", showText(item.uceis)],
          ["Baron", showText(item.baron)],
          ["Extent", showText(item.extent)],
          ["Remarks", showText(item.remarks)],
        ]}
      />
    </div>
  );
}
