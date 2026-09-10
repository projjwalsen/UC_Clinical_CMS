"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  Download,
  Edit3,
  FileUp,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/demo-store";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
} from "@/components/ui/core";
import { downloadCsv, formatDate } from "@/lib/utils";
import type {
  ClinicalRecords,
  EIMRecord,
  EndoscopyRecord,
  HistopathologyRecord,
  ImagingRecord,
  LaboratoryResult,
  MedicationRecord,
  PregnancyRecord,
  OffspringRecord,
  RelapseRecord,
  IPAARecord,
  PouchoscopyRecord,
  SymptomRecord,
  Visit,
} from "@/types/clinical";
import { VisitForm } from "@/components/forms/visit-form";
import { SymptomForm } from "@/components/forms/symptom-form";
import { EimForm } from "@/components/forms/eim-form";
import { LabForm } from "@/components/forms/lab-form";
import { EndoscopyForm } from "@/components/forms/endoscopy-form";
import { HistopathologyForm } from "@/components/forms/histopathology-form";
import { ImagingForm } from "@/components/forms/imaging-form";
import { MedicationForm } from "@/components/forms/medication-form";
import { PregnancyForm } from "@/components/forms/pregnancy-form";
import { OffspringForm } from "@/components/forms/offspring-form";
import { RelapseForm } from "@/components/forms/relapse-form";
import { IpaaForm } from "@/components/forms/ipaa-form";
import { PouchoscopyForm } from "@/components/forms/pouchoscopy-form";
import { getLastVisit } from "@/lib/visit-utils";
import { formatPresent, getLastSymptomAssessment } from "@/lib/symptom-utils";
import { formatEimPresent, getLastEimAssessment } from "@/lib/eim-utils";
import {
  endoscopyMayoScore,
  getLastEndoscopy,
} from "@/lib/endoscopy-utils";
import {
  formatHistopathologyPresent,
  histopathologyScoreValue,
} from "@/lib/histopathology-utils";
import { medicationRemarks } from "@/lib/medication-utils";
import {
  pregnancyOutcomeLabel,
  pregnancyRemarks,
  pregnancyYear,
} from "@/lib/pregnancy-utils";
import { getLastOffspring } from "@/lib/offspring-utils";
import {
  relapseAdmission,
  relapseCauseLabel,
  relapseOutcomeLabel,
} from "@/lib/relapse-utils";
import { ipaaTotalStoolFrequency } from "@/lib/ipaa-utils";
import { pouchoscopyScore } from "@/lib/pouchoscopy-utils";
import { ClinicalDatasetPatientTab } from "@/components/reports/clinical-dataset-patient-tab";
import {
  formatLabResult,
  labAbnormalFlag,
  labNumericValue,
} from "@/lib/lab-utils";

const tabsBeforeReproductive: [string, keyof ClinicalRecords | "overview"][] = [
  ["Overview", "overview"],
  ["Visits", "visits"],
  ["Symptoms", "symptoms"],
  ["Extra-intestinal manifestations", "eims"],
  ["Laboratory results", "labs"],
  ["Medications", "medications"],
  ["Endoscopy", "endoscopies"],
  ["Histopathology", "histopathology"],
  ["Imaging", "imaging"],
] as const;

const tabsAfterReproductive: [string, keyof ClinicalRecords | "overview" | "clinical-dataset"][] = [
  ["Clinical dataset", "clinical-dataset"],
  ["Relapses", "relapses"],
  ["Surgery", "surgeries"],
  ["IPAA", "ipaa"],
  ["Pouchoscopy", "pouchoscopies"],
  ["Outcomes", "outcomes"],
  ["Documents", "overview"],
];

export function PatientProfile({
  patientId,
  onBack,
  initialTab,
}: {
  patientId: string;
  onBack: () => void;
  initialTab?: "clinical-dataset";
}) {
  const { patients, records, addRecord, addRecords } = useDemoStore();
  const patient = patients.find((p) => p.id === patientId);
  const [tab, setTab] = useState<
    keyof ClinicalRecords | "overview" | "clinical-dataset"
  >(initialTab ?? "overview");
  const [drawer, setDrawer] = useState<keyof ClinicalRecords | null>(null);
  const [record, setRecord] = useState({
    date: "2026-09-07",
    type: "Follow-up",
    value: "",
    status: "Normal",
    notes: "",
  });
  const related = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(records).map(([key, value]) => [
          key,
          (value as { patientId: string }[]).filter(
            (r) => r.patientId === patientId,
          ),
        ]),
      ) as unknown as ClinicalRecords,
    [records, patientId],
  );
  if (!patient)
    return (
      <EmptyState
        title="Patient not found"
        description="This local demonstration record may have been reset."
      />
    );
  const isFemalePatient = patient.gender === "Female";
  const profileTabs = useMemo(
    (): [string, keyof ClinicalRecords | "overview" | "clinical-dataset"][] => [
      ...tabsBeforeReproductive,
      isFemalePatient
        ? ["Pregnancy & offspring", "pregnancies"]
        : ["Offspring", "offspring"],
      ...tabsAfterReproductive,
    ],
    [isFemalePatient],
  );
  const lastOffspring = useMemo(
    () => getLastOffspring(related.offspring as OffspringRecord[]),
    [related.offspring],
  );
  const labHb = related.labs.find(
    (l) => l.testName === "Hb" || l.testName === "Haemoglobin",
  );
  const crp = related.labs.find((l) => l.testName === "CRP");
  const med = related.medications.find((m) => m.status === "Current");
  const endoscopy = related.endoscopies[0];
  const summary = [
    ["Disease duration", `${patient.diseaseDurationYears} years`],
    ["Current severity", patient.severity],
    ["Current treatment", med?.drugName || "No current record"],
    [
      "Latest haemoglobin",
      labHb ? formatLabResult(labHb) : "Not recorded",
    ],
    ["Latest CRP", crp ? formatLabResult(crp) : "Not recorded"],
    ["Last endoscopy", endoscopy ? formatDate(endoscopy.date) : "Not recorded"],
    ["Relapses", related.relapses.length],
    ["Surgery status", related.surgeries.length ? "Surgical" : "Non-surgical"],
  ];
  const currentRows =
    tab === "overview" || tab === "clinical-dataset"
      ? []
      : (related[tab] as unknown as Record<string, unknown>[]);
  const saveRecord = () => {
    if (
      !drawer ||
      drawer === "visits" ||
      drawer === "symptoms" ||
      drawer === "eims" ||
      drawer === "labs" ||
      drawer === "endoscopies" ||
      drawer === "histopathology" ||
      drawer === "imaging" ||
      drawer === "medications" ||
      drawer === "pregnancies" ||
      drawer === "offspring" ||
      drawer === "relapses" ||
      drawer === "ipaa" ||
      drawer === "pouchoscopies"
    )
      return;
    const base = {
      id: `${drawer.toUpperCase()}-${Date.now()}`,
      patientId,
      visitId: `${patientId}-V${related.visits.length + 1}`,
      date: record.date,
      notes: record.notes,
    };
    const extras: Record<string, unknown> =
      drawer === "surgeries"
                ? {
                    stage: record.type,
                    indication: record.notes,
                    hospitalStayDays: Number(record.value) || 0,
                    outcome: record.status,
                  }
                : {
                    findings: record.notes,
                    outcome: record.status,
                    type: record.type,
                    value: record.value,
                  };
    addRecord(drawer, { ...base, ...extras } as never);
    setDrawer(null);
    toast.success("Clinical record added to local demo data");
  };
  const saveVisit = (visit: Visit) => {
    addRecord("visits", visit);
    setDrawer(null);
    toast.success("Visit added to local demo data");
  };
  const saveSymptoms = (symptomRecords: SymptomRecord[]) => {
    addRecords("symptoms", symptomRecords);
    setDrawer(null);
    toast.success("Symptom assessment saved");
  };
  const saveEims = (eimRecords: EIMRecord[]) => {
    addRecords("eims", eimRecords);
    setDrawer(null);
    toast.success("EIM assessment saved");
  };
  const saveLabs = (labRecords: LaboratoryResult[]) => {
    addRecords("labs", labRecords);
    setDrawer(null);
    toast.success("Lab results saved");
  };
  const saveEndoscopy = (endoscopyRecord: EndoscopyRecord) => {
    addRecord("endoscopies", endoscopyRecord);
    setDrawer(null);
    toast.success("Endoscopy record saved");
  };
  const saveHistopathology = (records: HistopathologyRecord[]) => {
    addRecords("histopathology", records);
    setDrawer(null);
    toast.success("Histopathology records saved");
  };
  const saveImaging = (imagingRecord: ImagingRecord) => {
    addRecord("imaging", imagingRecord);
    setDrawer(null);
    toast.success("Imaging record saved");
  };
  const saveMedications = (medicationRecords: MedicationRecord[]) => {
    addRecords("medications", medicationRecords);
    setDrawer(null);
    toast.success("Medication records saved");
  };
  const savePregnancy = (pregnancyRecords: PregnancyRecord[]) => {
    addRecords("pregnancies", pregnancyRecords);
    setDrawer(null);
    toast.success(
      pregnancyRecords.length === 1
        ? "Pregnancy record saved"
        : "Pregnancy records saved",
    );
  };
  const saveOffspring = (offspringRecord: OffspringRecord) => {
    addRecord("offspring", offspringRecord);
    setDrawer(null);
    toast.success("Offspring record saved");
  };
  const saveRelapse = (relapseRecord: RelapseRecord) => {
    addRecord("relapses", relapseRecord);
    setDrawer(null);
    toast.success("Relapse record saved");
  };
  const saveIpaa = (ipaaRecord: IPAARecord) => {
    addRecord("ipaa", ipaaRecord);
    setDrawer(null);
    toast.success("IPAA follow-up saved");
  };
  const savePouchoscopy = (pouchoscopyRecord: PouchoscopyRecord) => {
    addRecord("pouchoscopies", pouchoscopyRecord);
    setDrawer(null);
    toast.success("Pouchoscopy record saved");
  };
  const lastVisit = useMemo(
    () => getLastVisit(related.visits as Visit[]),
    [related.visits],
  );
  const lastSymptomAssessment = useMemo(
    () => getLastSymptomAssessment(related.symptoms as SymptomRecord[]),
    [related.symptoms],
  );
  const lastEimAssessment = useMemo(
    () => getLastEimAssessment(related.eims as EIMRecord[]),
    [related.eims],
  );
  const lastEndoscopy = useMemo(
    () => getLastEndoscopy(related.endoscopies as EndoscopyRecord[]),
    [related.endoscopies],
  );
  const visitColumns: [string, keyof Visit][] = [
    ["Date", "date"],
    ["Type", "type"],
    ["Clinical state", "clinicalState"],
    ["Montreal", "montrealExtent"],
    ["Partial Mayo", "partialMayoScore"],
    ["Weight (kg)", "weightKg"],
    ["BMI", "bmi"],
  ];
  const symptomColumns: [string, keyof SymptomRecord][] = [
    ["Date", "date"],
    ["Symptom", "symptom"],
    ["Present", "present"],
    ["Duration", "durationMonths"],
  ];
  const eimColumns: [string, keyof EIMRecord][] = [
    ["Date", "date"],
    ["Manifestation", "manifestation"],
    ["Present", "present"],
    ["After IBD onset", "afterIbdOnset"],
  ];
  const labColumns: [string, keyof LaboratoryResult | "result"][] = [
    ["Date", "date"],
    ["Category", "category"],
    ["Test", "testName"],
    ["Result", "result"],
    ["Flag", "abnormalFlag"],
  ];
  const medicationColumns: [
    string,
    keyof MedicationRecord | "startDateDisplay" | "remarksDisplay",
  ][] = [
    ["Drug", "drugName"],
    ["Visit", "visitId"],
    ["Dose", "dose"],
    ["Route", "route"],
    ["Start", "startDateDisplay"],
    ["Status", "status"],
    ["Remarks", "remarksDisplay"],
  ];
  const endoscopyColumns: [string, keyof EndoscopyRecord | "mayoScore"][] = [
    ["Date", "date"],
    ["Visit", "visitId"],
    ["Baron", "baronScore"],
    ["Mayo", "mayoScore"],
    ["UCEIS", "uceis"],
    ["Extent", "diseaseExtent"],
    ["Findings", "findings"],
  ];
  const histopathologyColumns: [
    string,
    keyof HistopathologyRecord | "presentDisplay" | "scoreDisplay",
  ][] = [
    ["Date", "date"],
    ["Section", "section"],
    ["Parameter", "parameter"],
    ["Present", "presentDisplay"],
    ["Score grade", "scoreGrade"],
    ["Histo score", "scoreDisplay"],
    ["Remarks", "remarks"],
  ];
  const imagingColumns: [string, keyof ImagingRecord][] = [
    ["Date", "date"],
    ["Visit", "visitId"],
    ["Investigation", "investigationType"],
    ["Findings", "findings"],
    ["Impression", "impression"],
    ["Remarks", "remarks"],
  ];
  const pregnancyColumns: [
    string,
    keyof PregnancyRecord | "yearDisplay" | "outcomeDisplay" | "remarksDisplay",
  ][] = [
    ["#", "pregnancyNumber"],
    ["Year", "yearDisplay"],
    ["Duration", "durationWeeks"],
    ["Activity", "activityAtConception"],
    ["Course", "courseDuringPregnancy"],
    ["Outcome", "outcomeDisplay"],
    ["Remarks", "remarksDisplay"],
  ];
  const offspringColumns: [string, keyof OffspringRecord][] = [
    ["Infertility", "anyInfertility"],
    ["Period (mo)", "infertilityPeriodMonths"],
    ["Total offspring", "totalOffspring"],
    ["Since IBD onset", "offspringSinceIbdOnset"],
    ["Remarks", "remarks"],
  ];
  const relapseColumns: [
    string,
    keyof RelapseRecord | "causeDisplay" | "outcomeDisplay" | "admissionDisplay",
  ][] = [
    ["Date", "date"],
    ["Visit", "visitId"],
    ["Cause", "causeDisplay"],
    ["Admission", "admissionDisplay"],
    ["Steroid", "steroid"],
    ["Rescue", "rescueTherapy"],
    ["Outcome", "outcomeDisplay"],
    ["Remarks", "remarks"],
  ];
  const ipaaColumns: [
    string,
    keyof IPAARecord | "totalStoolDisplay",
  ][] = [
    ["Date", "date"],
    ["Visit", "visitId"],
    ["Pouch", "pouchType"],
    ["Day", "stoolFrequencyDay"],
    ["Night", "stoolFrequencyNight"],
    ["Total", "totalStoolDisplay"],
    ["Incontinence", "incontinence"],
    ["Remarks", "remarks"],
  ];
  const pouchoscopyColumns: [
    string,
    keyof PouchoscopyRecord | "scoreDisplay",
  ][] = [
    ["Date", "date"],
    ["Visit", "visitId"],
    ["Diagnosis", "diagnosis"],
    ["Body", "bodyFinding"],
    ["Score", "scoreDisplay"],
    ["Inference", "inference"],
    ["Remarks", "remarks"],
  ];
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700"
      >
        <ArrowLeft className="size-4" />
        Back to patients
      </button>
      <PageHeader
        eyebrow={patient.id}
        title={patient.name}
        description={`${patient.age} years · ${patient.gender} · Last visit ${formatDate(patient.lastVisit)}`}
        actions={
          <>
            <StatusBadge status={patient.status} />
            <Button
              variant="secondary"
              onClick={() =>
                toast.info(
                  "Edit flow uses the same validated patient form in the production implementation.",
                )
              }
            >
              <Edit3 className="size-4" />
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setDrawer("visits")}>
              <CalendarPlus className="size-4" />
              Add record
            </Button>
            <Button
              onClick={() =>
                downloadCsv(`${patient.id}-report.csv`, [
                  {
                    patient: patient.name,
                    id: patient.id,
                    status: patient.status,
                    ...summary.reduce((a, [k, v]) => ({ ...a, [k]: v }), {}),
                  },
                ])
              }
            >
              <Download className="size-4" />
              Generate report
            </Button>
          </>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {summary.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max px-3">
            {profileTabs.map(([label, key], i) => (
              <button
                key={`${label}-${i}`}
                onClick={() => setTab(key)}
                className={`border-b-2 px-3 py-4 text-xs font-semibold transition ${tab === key ? "border-teal-700 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {tab === "overview" ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-bold">Patient details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ["Phone", patient.phone],
                    ["Email", patient.email || "Not provided"],
                    ["Police station", patient.policeStation || "Not recorded"],
                    ["Location", `${patient.city}, ${patient.state}`],
                    ["Occupation", patient.occupation],
                    ["Education", patient.education],
                    ["Monthly income", patient.monthlyFamilyIncome || "Not recorded"],
                    [
                      "Kuppuswamy score",
                      patient.kuppuswamyScore ?? "Not calculated",
                    ],
                    ["Socioeconomic class", patient.socioeconomicCategory],
                    ["Diet", patient.diet],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="text-right font-semibold text-slate-800">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-bold">Disease profile</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ["Diagnosed", formatDate(patient.diagnosisDate)],
                    ["Extent", patient.diseaseExtent],
                    ["Family history", patient.familyHistory ? "Yes" : "No"],
                    ["Smoking", patient.smokingStatus],
                    [
                      "Comorbidities",
                      patient.comorbidities.join(", ") || "None",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="text-right font-semibold text-slate-800">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="rounded-xl border border-teal-100 bg-teal-50/50 p-5">
                <h3 className="text-sm font-bold text-teal-900">Care notes</h3>
                <p className="mt-3 text-sm leading-6 text-teal-800">
                  {patient.notes}
                </p>
                <Badge tone="teal" className="mt-4">
                  Synthetic record
                </Badge>
              </section>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold capitalize">
                    {profileTabs.find(([, key]) => key === tab)?.[0]}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tab === "clinical-dataset"
                      ? "Linked clinical dataset record used by the cohort report (demographics from this profile)."
                      : tab === "pregnancies"
                      ? "Pregnancy and offspring summaries. Not linked to a visit."
                      : tab === "offspring"
                        ? "Offspring summary. Not linked to a visit."
                        : "Longitudinal observations linked by patient and visit ID."}
                  </p>
                </div>
                {tab === "pregnancies" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDrawer("pregnancies")}
                    >
                      <Plus className="size-4" />
                      Add pregnancy
                    </Button>
                    <Button size="sm" onClick={() => setDrawer("offspring")}>
                      <Plus className="size-4" />
                      Add offspring
                    </Button>
                  </div>
                ) : tab === "offspring" ? (
                  <Button size="sm" onClick={() => setDrawer("offspring")}>
                    <Plus className="size-4" />
                    Add record
                  </Button>
                ) : tab === "clinical-dataset" ? null : (
                  <Button
                    size="sm"
                    onClick={() => setDrawer(tab as keyof ClinicalRecords)}
                  >
                    <Plus className="size-4" />
                    Add record
                  </Button>
                )}
              </div>
              {tab === "clinical-dataset" ? (
                <ClinicalDatasetPatientTab patient={patient} />
              ) : tab === "pregnancies" ? (
                <div className="space-y-8">
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">
                        Pregnancies
                      </h4>
                    </div>
                    {!related.pregnancies.length ? (
                      <EmptyState
                        title="No pregnancy records"
                        description="Add a pregnancy record for this patient."
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                            <tr>
                              {pregnancyColumns.map(([label]) => (
                                <th key={label} className="px-4 py-3">
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(related.pregnancies as PregnancyRecord[]).map(
                              (row) => (
                                <tr
                                  key={row.id}
                                  className="border-t border-slate-100"
                                >
                                  {pregnancyColumns.map(([label, key]) => (
                                    <td
                                      key={label}
                                      className="max-w-56 px-4 py-3 text-slate-600"
                                    >
                                      {key === "yearDisplay"
                                        ? String(pregnancyYear(row) ?? "—")
                                        : key === "outcomeDisplay"
                                          ? pregnancyOutcomeLabel(row) ?? "—"
                                          : key === "remarksDisplay"
                                            ? pregnancyRemarks(row) ?? "—"
                                            : key === "durationWeeks"
                                              ? row.durationWeeks !== undefined
                                                ? `${row.durationWeeks} wk`
                                                : "—"
                                              : String(
                                                  row[
                                                    key as keyof PregnancyRecord
                                                  ] ?? "—",
                                                )}
                                    </td>
                                  ))}
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">
                        Offspring
                      </h4>
                    </div>
                    {!related.offspring.length ? (
                      <EmptyState
                        title="No offspring records"
                        description="Add an offspring summary for this patient."
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                            <tr>
                              {offspringColumns.map(([label]) => (
                                <th key={label} className="px-4 py-3">
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(related.offspring as OffspringRecord[]).map(
                              (row) => (
                                <tr
                                  key={row.id}
                                  className="border-t border-slate-100"
                                >
                                  {offspringColumns.map(([label, key]) => (
                                    <td
                                      key={label}
                                      className="max-w-56 px-4 py-3 text-slate-600"
                                    >
                                      {String(row[key] ?? "—")}
                                    </td>
                                  ))}
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </div>
              ) : tab === "offspring" ? (
                !related.offspring.length ? (
                  <EmptyState
                    title="No offspring records"
                    description="Add an offspring summary for this patient."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                        <tr>
                          {offspringColumns.map(([label]) => (
                            <th key={label} className="px-4 py-3">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(related.offspring as OffspringRecord[]).map((row) => (
                          <tr key={row.id} className="border-t border-slate-100">
                            {offspringColumns.map(([label, key]) => (
                              <td
                                key={label}
                                className="max-w-56 px-4 py-3 text-slate-600"
                              >
                                {String(row[key] ?? "—")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : tab === "relapses" ? (
                !related.relapses.length ? (
                  <EmptyState
                    title="No relapse records"
                    description="Add a relapse event linked to a visit."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                        <tr>
                          {relapseColumns.map(([label]) => (
                            <th key={label} className="px-4 py-3">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(related.relapses as RelapseRecord[]).map((row) => (
                          <tr key={row.id} className="border-t border-slate-100">
                            {relapseColumns.map(([label, key]) => (
                              <td
                                key={label}
                                className="max-w-56 px-4 py-3 text-slate-600"
                              >
                                {key === "date"
                                  ? formatDate(row.date)
                                  : key === "causeDisplay"
                                    ? relapseCauseLabel(row) ?? "—"
                                    : key === "outcomeDisplay"
                                      ? relapseOutcomeLabel(row) ?? "—"
                                      : key === "admissionDisplay"
                                        ? relapseAdmission(row) ?? "—"
                                        : String(
                                            row[key as keyof RelapseRecord] ??
                                              "—",
                                          )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : tab === "ipaa" ? (
                !related.ipaa.length ? (
                  <EmptyState
                    title="No IPAA records"
                    description="Add a post-IPAA follow-up linked to a visit."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                        <tr>
                          {ipaaColumns.map(([label]) => (
                            <th key={label} className="px-4 py-3">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(related.ipaa as IPAARecord[]).map((row) => (
                          <tr key={row.id} className="border-t border-slate-100">
                            {ipaaColumns.map(([label, key]) => (
                              <td
                                key={label}
                                className="max-w-56 px-4 py-3 text-slate-600"
                              >
                                {key === "date"
                                  ? formatDate(row.date)
                                  : key === "totalStoolDisplay"
                                    ? String(ipaaTotalStoolFrequency(row) ?? "—")
                                    : String(row[key as keyof IPAARecord] ?? "—")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : tab === "pouchoscopies" ? (
                !related.pouchoscopies.length ? (
                  <EmptyState
                    title="No pouchoscopy records"
                    description="Add a pouchoscopy assessment linked to a visit."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                        <tr>
                          {pouchoscopyColumns.map(([label]) => (
                            <th key={label} className="px-4 py-3">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(related.pouchoscopies as PouchoscopyRecord[]).map(
                          (row) => (
                            <tr key={row.id} className="border-t border-slate-100">
                              {pouchoscopyColumns.map(([label, key]) => (
                                <td
                                  key={label}
                                  className="max-w-56 px-4 py-3 text-slate-600"
                                >
                                  {key === "date"
                                    ? formatDate(row.date)
                                    : key === "scoreDisplay"
                                      ? row.scoreType
                                        ? `${row.scoreType}: ${pouchoscopyScore(row) ?? "—"}`
                                        : String(pouchoscopyScore(row) ?? "—")
                                      : String(
                                          row[key as keyof PouchoscopyRecord] ??
                                            "—",
                                        )}
                                </td>
                              ))}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              ) : !currentRows.length ? (
                <EmptyState
                  title={`No ${tab} records`}
                  description="Add a synthetic observation to demonstrate this module."
                />
              ) : tab === "visits" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {visitColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.visits as Visit[]).map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-slate-100"
                        >
                          {visitColumns.map(([label, key]) => (
                            <td
                              key={label}
                              className="max-w-56 px-4 py-3 text-slate-600"
                            >
                              {key === "date"
                                ? formatDate(row.date)
                                : key === "montrealExtent"
                                  ? `${row.montrealExtent ?? "—"} / ${row.montrealSeverity ?? "—"}`
                                  : String(row[key] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "symptoms" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {symptomColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.symptoms as SymptomRecord[]).map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          {symptomColumns.map(([label, key]) => (
                            <td
                              key={label}
                              className="max-w-56 px-4 py-3 text-slate-600"
                            >
                              {key === "date"
                                ? formatDate(row.date)
                                : key === "present"
                                  ? formatPresent(row.present)
                                  : key === "durationMonths"
                                    ? row.durationMonths !== undefined
                                      ? `${row.durationMonths} mo`
                                      : "—"
                                    : String(row[key] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "eims" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {eimColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.eims as EIMRecord[]).map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          {eimColumns.map(([label, key]) => (
                            <td
                              key={label}
                              className="max-w-56 px-4 py-3 text-slate-600"
                            >
                              {key === "date"
                                ? formatDate(row.date)
                                : key === "present" || key === "afterIbdOnset"
                                  ? formatEimPresent(String(row[key] ?? "—"))
                                  : String(row[key] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "labs" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {labColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.labs as LaboratoryResult[]).map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          {labColumns.map(([label, key]) => (
                            <td
                              key={label}
                              className="max-w-56 px-4 py-3 text-slate-600"
                            >
                              {key === "date"
                                ? formatDate(row.date)
                                : key === "result"
                                  ? formatLabResult(row)
                                  : key === "abnormalFlag"
                                    ? labAbnormalFlag(row) ?? "—"
                                    : String(row[key as keyof LaboratoryResult] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "medications" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {medicationColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.medications as MedicationRecord[]).map(
                        (row) => (
                          <tr key={row.id} className="border-t border-slate-100">
                            {medicationColumns.map(([label, key]) => (
                              <td
                                key={label}
                                className="max-w-56 px-4 py-3 text-slate-600"
                              >
                                {key === "startDateDisplay"
                                  ? formatDate(row.startDate)
                                  : key === "remarksDisplay"
                                    ? medicationRemarks(row) ?? "—"
                                    : String(
                                        row[key as keyof MedicationRecord] ??
                                          "—",
                                      )}
                              </td>
                            ))}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : tab === "endoscopies" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {endoscopyColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.endoscopies as EndoscopyRecord[]).map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          {endoscopyColumns.map(([label, key]) => (
                            <td
                              key={label}
                              className="max-w-56 px-4 py-3 text-slate-600"
                            >
                              {key === "date"
                                ? formatDate(row.date)
                                : key === "mayoScore"
                                  ? String(endoscopyMayoScore(row) ?? "—")
                                  : String(row[key as keyof EndoscopyRecord] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "histopathology" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {histopathologyColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.histopathology as HistopathologyRecord[]).map(
                        (row) => (
                          <tr key={row.id} className="border-t border-slate-100">
                            {histopathologyColumns.map(([label, key]) => (
                              <td
                                key={label}
                                className="max-w-56 px-4 py-3 text-slate-600"
                              >
                                {key === "date"
                                  ? formatDate(row.date)
                                  : key === "presentDisplay"
                                    ? formatHistopathologyPresent(row)
                                    : key === "scoreDisplay"
                                      ? String(
                                          histopathologyScoreValue(row) ?? "—",
                                        )
                                      : String(
                                          row[key as keyof HistopathologyRecord] ??
                                            "—",
                                        )}
                              </td>
                            ))}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : tab === "imaging" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {imagingColumns.map(([label]) => (
                          <th key={label} className="px-4 py-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(related.imaging as ImagingRecord[]).map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          {imagingColumns.map(([label, key]) => (
                            <td
                              key={label}
                              className="max-w-56 px-4 py-3 text-slate-600"
                            >
                              {key === "date"
                                ? formatDate(row.date)
                                : String(row[key] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                      <tr>
                        {Object.keys(currentRows[0])
                          .filter((k) => !["patientId"].includes(k))
                          .slice(0, 7)
                          .map((k) => (
                            <th key={k} className="px-4 py-3">
                              {k.replace(/([A-Z])/g, " $1")}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows.map((row, i) => (
                        <tr
                          key={String(row.id || i)}
                          className="border-t border-slate-100"
                        >
                          {Object.entries(row)
                            .filter(([k]) => !["patientId"].includes(k))
                            .slice(0, 7)
                            .map(([k, v]) => (
                              <td
                                key={k}
                                className="max-w-56 px-4 py-3 text-slate-600"
                              >
                                {k === "date" || k.endsWith("Date")
                                  ? formatDate(String(v))
                                  : typeof v === "boolean"
                                    ? v
                                      ? "Yes"
                                      : "No"
                                    : String(v ?? "—")}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      {drawer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-[1px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDrawer(null);
          }}
        >
          <aside
            className={`absolute right-0 top-0 h-full w-full overflow-y-auto bg-white shadow-2xl ${drawer === "visits" || drawer === "pregnancies" || drawer === "relapses" || drawer === "ipaa" || drawer === "pouchoscopies" ? "max-w-3xl" : drawer === "symptoms" || drawer === "eims" || drawer === "labs" || drawer === "histopathology" || drawer === "medications" ? "max-w-5xl" : drawer === "endoscopies" || drawer === "imaging" || drawer === "offspring" ? "max-w-2xl" : "max-w-lg"}`}
          >
            {drawer === "visits" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Epidemiological / clinical follow-up
                    </p>
                    <h2 className="text-lg font-bold">Add visit</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <VisitForm
                  patientId={patientId}
                  visitCount={related.visits.length}
                  lastVisit={lastVisit}
                  onCancel={() => setDrawer(null)}
                  onSave={saveVisit}
                />
              </>
            ) : drawer === "symptoms" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Clinical features
                    </p>
                    <h2 className="text-lg font-bold">Add symptom assessment</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <SymptomForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  lastAssessment={lastSymptomAssessment}
                  onCancel={() => setDrawer(null)}
                  onSave={saveSymptoms}
                />
              </>
            ) : drawer === "eims" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Extra-intestinal features
                    </p>
                    <h2 className="text-lg font-bold">Add EIM assessment</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <EimForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  lastAssessment={lastEimAssessment}
                  onCancel={() => setDrawer(null)}
                  onSave={saveEims}
                />
              </>
            ) : drawer === "labs" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Lab investigations
                    </p>
                    <h2 className="text-lg font-bold">Add laboratory results</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <LabForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={saveLabs}
                />
              </>
            ) : drawer === "endoscopies" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Colonoscopy and endoscopic scores
                    </p>
                    <h2 className="text-lg font-bold">Add endoscopy</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <EndoscopyForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  lastEndoscopy={lastEndoscopy}
                  onCancel={() => setDrawer(null)}
                  onSave={saveEndoscopy}
                />
              </>
            ) : drawer === "histopathology" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Histopathology examination
                    </p>
                    <h2 className="text-lg font-bold">Add histopathology</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <HistopathologyForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={saveHistopathology}
                />
              </>
            ) : drawer === "imaging" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Radiological investigations
                    </p>
                    <h2 className="text-lg font-bold">Add imaging</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <ImagingForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={saveImaging}
                />
              </>
            ) : drawer === "medications" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Medication history
                    </p>
                    <h2 className="text-lg font-bold">Add medications</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <MedicationForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={saveMedications}
                />
              </>
            ) : drawer === "pregnancies" && isFemalePatient ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Pregnancy and birth outcomes
                    </p>
                    <h2 className="text-lg font-bold">Add pregnancy</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <PregnancyForm
                  patientId={patientId}
                  existingRecords={related.pregnancies as PregnancyRecord[]}
                  onCancel={() => setDrawer(null)}
                  onSave={savePregnancy}
                />
              </>
            ) : drawer === "offspring" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Offspring summary
                    </p>
                    <h2 className="text-lg font-bold">Add offspring</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <OffspringForm
                  patientId={patientId}
                  lastRecord={lastOffspring}
                  onCancel={() => setDrawer(null)}
                  onSave={saveOffspring}
                />
              </>
            ) : drawer === "relapses" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Relapse events
                    </p>
                    <h2 className="text-lg font-bold">Add relapse</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <RelapseForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={saveRelapse}
                />
              </>
            ) : drawer === "ipaa" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Post-IPAA follow-up
                    </p>
                    <h2 className="text-lg font-bold">Add IPAA follow-up</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <IpaaForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={saveIpaa}
                />
              </>
            ) : drawer === "pouchoscopies" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Pouchoscopy and histology
                    </p>
                    <h2 className="text-lg font-bold">Add pouchoscopy</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setDrawer(null)}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <PouchoscopyForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => setDrawer(null)}
                  onSave={savePouchoscopy}
                />
              </>
            ) : (
              <>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                  Clinical record
                </p>
                <h2 className="text-lg font-bold capitalize">
                  Add {drawer.replace(/([A-Z])/g, " $1")}
                </h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setDrawer(null)}
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="space-y-5 p-6">
              <Field label="Assessment date" required>
                <Input
                  type="date"
                  value={record.date}
                  onChange={(e) =>
                    setRecord({ ...record, date: e.target.value })
                  }
                />
              </Field>
              <Field label="Record type" required>
                <Select
                  className="w-full"
                  value={record.type}
                  onChange={(e) =>
                    setRecord({ ...record, type: e.target.value })
                  }
                >
                  {(drawer === "surgeries"
                      ? ["Stage 1", "Stage 2", "Stage 3"]
                      : ["Follow-up", "Baseline", "Review"]
                  ).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Value / duration">
                <Input
                  type="text"
                  value={record.value}
                  onChange={(e) =>
                    setRecord({ ...record, value: e.target.value })
                  }
                />
              </Field>
              <Field label="Status / outcome">
                <Select
                  className="w-full"
                  value={record.status}
                  onChange={(e) =>
                    setRecord({ ...record, status: e.target.value })
                  }
                >
                  <option>Normal</option>
                  <option>Remission</option>
                  <option>Active disease</option>
                  <option>Recovered</option>
                  <option>High</option>
                  <option>Low</option>
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea
                  value={record.notes}
                  onChange={(e) =>
                    setRecord({ ...record, notes: e.target.value })
                  }
                />
              </Field>
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                <FileUp className="mx-auto size-6 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  File placeholder
                </p>
                <p className="text-xs text-slate-400">
                  Files are not uploaded in Demo Mode.
                </p>
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" className="mt-1" />
                Mark as reviewed during this visit
              </label>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
              <Button variant="secondary" onClick={() => setDrawer(null)}>
                Cancel
              </Button>
              <Button onClick={saveRecord}>Save record</Button>
            </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
