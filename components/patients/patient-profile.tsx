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
  SurgeryRecord,
  Visit,
} from "@/types/clinical";
import { SectionDataChecklist } from "@/components/patients/section-data-checklist";
import { RecordRowActions } from "@/components/patients/record-row-actions";
import { buildPatientSectionStatus } from "@/lib/patient-section-status";
import {
  assessmentGroupKey,
  resolveVisitContext,
} from "@/lib/record-visit-matching";
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
  endoscopyUceisScore,
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
import { nextPouchoscopySerialNumber } from "@/lib/pouchoscopy-utils";
import { ClinicalDatasetPatientTab } from "@/components/reports/clinical-dataset-patient-tab";
import { PatientPhoneDefaultEditor } from "@/components/patients/patient-phone-default";
import { PatientEditForm } from "@/components/forms/patient-edit-form";
import { getPatientDisplayPhone } from "@/lib/patient-contact";
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
  ["Colonoscopy and endoscopic", "endoscopies"],
  ["Histopathology", "histopathology"],
  ["Imaging", "imaging"],
] as const;

type DrawerPrefill = {
  visit?: Visit;
  symptomRecords?: SymptomRecord[];
  eimRecords?: EIMRecord[];
  labRecords?: LaboratoryResult[];
  endoscopy?: EndoscopyRecord;
  histopathology?: HistopathologyRecord[];
  imaging?: ImagingRecord;
  medicationRecords?: MedicationRecord[];
  relapse?: RelapseRecord;
  ipaa?: IPAARecord;
  pouchoscopy?: PouchoscopyRecord;
  offspring?: OffspringRecord;
  pregnancyRecords?: PregnancyRecord[];
  surgery?: SurgeryRecord;
};

const tabsAfterReproductive: [string, keyof ClinicalRecords | "overview" | "clinical-dataset"][] = [
  ["Clinical dataset", "clinical-dataset"],
  ["Relapses", "relapses"],
  ["Surgery", "surgeries"],
  ["IPAA", "ipaa"],
  ["Histology pouchoscopy", "pouchoscopies"],
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
  const {
    patients,
    records,
    clinicalDatasetRecords,
    addRecord,
    addRecords,
    updateRecord,
    deleteRecord,
    deleteRecordsForVisitContext,
    updatePatient,
  } = useDemoStore();
  const patient = patients.find((p) => p.id === patientId);
  const [tab, setTab] = useState<
    keyof ClinicalRecords | "overview" | "clinical-dataset"
  >(initialTab ?? "overview");
  const [drawer, setDrawer] = useState<keyof ClinicalRecords | null>(null);
  const [drawerPrefill, setDrawerPrefill] = useState<DrawerPrefill | null>(
    null,
  );

  const closeDrawer = () => {
    setDrawer(null);
    setDrawerPrefill(null);
  };

  const openAddDrawer = (kind: keyof ClinicalRecords) => {
    setDrawerPrefill(null);
    setDrawer(kind);
  };
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
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
  const histologyPouchoscopyRows = useMemo(
    () =>
      [...(related.pouchoscopies as PouchoscopyRecord[])].sort(
        (a, b) =>
          (a.serialNumber ?? 0) - (b.serialNumber ?? 0) ||
          a.date.localeCompare(b.date),
      ),
    [related.pouchoscopies],
  );
  const nextPouchoscopySl = useMemo(
    () => nextPouchoscopySerialNumber(records.pouchoscopies, patientId),
    [records.pouchoscopies, patientId],
  );
  const sectionStatusItems = useMemo(
    () =>
      patient
        ? buildPatientSectionStatus(
            patient,
            related,
            clinicalDatasetRecords,
          )
        : [],
    [patient, related, clinicalDatasetRecords],
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
    closeDrawer();
    toast.success("Clinical record added to local demo data");
  };

  const upsertVisitContextBatch = <T extends { date: string; visitId?: string }>(
    kind: keyof ClinicalRecords,
    batch: T[],
  ) => {
    if (!batch.length) return;
    const ctx = resolveVisitContext(
      related.visits as Visit[],
      batch[0].visitId ?? "",
      batch[0].date,
    );
    deleteRecordsForVisitContext(kind, patientId, ctx);
    addRecords(kind, batch as never);
  };

  const saveVisit = (visit: Visit) => {
    const exists = records.visits.some((v) => v.id === visit.id);
    if (exists) updateRecord("visits", visit);
    else addRecord("visits", visit);
    closeDrawer();
    toast.success(exists ? "Visit updated" : "Visit added");
  };
  const saveSymptoms = (symptomRecords: SymptomRecord[]) => {
    upsertVisitContextBatch("symptoms", symptomRecords);
    closeDrawer();
    toast.success("Symptom assessment saved");
  };
  const saveEims = (eimRecords: EIMRecord[]) => {
    upsertVisitContextBatch("eims", eimRecords);
    closeDrawer();
    toast.success("EIM assessment saved");
  };
  const saveLabs = (labRecords: LaboratoryResult[]) => {
    upsertVisitContextBatch("labs", labRecords);
    closeDrawer();
    toast.success("Lab results saved");
  };
  const saveEndoscopy = (endoscopyRecord: EndoscopyRecord) => {
    const exists = records.endoscopies.some((r) => r.id === endoscopyRecord.id);
    if (exists) updateRecord("endoscopies", endoscopyRecord);
    else addRecord("endoscopies", endoscopyRecord);
    closeDrawer();
    toast.success(exists ? "Colonoscopy updated" : "Colonoscopy record saved");
  };
  const saveHistopathology = (histopathologyRecords: HistopathologyRecord[]) => {
    upsertVisitContextBatch("histopathology", histopathologyRecords);
    closeDrawer();
    toast.success("Histopathology records saved");
  };
  const saveImaging = (imagingRecord: ImagingRecord) => {
    const exists = records.imaging.some((r) => r.id === imagingRecord.id);
    if (exists) updateRecord("imaging", imagingRecord);
    else addRecord("imaging", imagingRecord);
    closeDrawer();
    toast.success(exists ? "Imaging updated" : "Imaging record saved");
  };
  const saveMedications = (medicationRecords: MedicationRecord[]) => {
    if (!medicationRecords.length) return;
    const visitId = medicationRecords[0].visitId;
    related.medications
      .filter((m) => m.patientId === patientId && m.visitId === visitId)
      .forEach((m) => deleteRecord("medications", m.id));
    addRecords("medications", medicationRecords);
    closeDrawer();
    toast.success("Medication records saved");
  };
  const savePregnancy = (pregnancyRecords: PregnancyRecord[]) => {
    pregnancyRecords.forEach((record) => {
      const exists = records.pregnancies.some((r) => r.id === record.id);
      if (exists) updateRecord("pregnancies", record);
      else addRecord("pregnancies", record);
    });
    closeDrawer();
    toast.success(
      pregnancyRecords.length === 1
        ? "Pregnancy record saved"
        : "Pregnancy records saved",
    );
  };
  const saveOffspring = (offspringRecord: OffspringRecord) => {
    const exists = records.offspring.some((r) => r.id === offspringRecord.id);
    if (exists) updateRecord("offspring", offspringRecord);
    else addRecord("offspring", offspringRecord);
    closeDrawer();
    toast.success(exists ? "Offspring updated" : "Offspring record saved");
  };
  const saveRelapse = (relapseRecord: RelapseRecord) => {
    const exists = records.relapses.some((r) => r.id === relapseRecord.id);
    if (exists) updateRecord("relapses", relapseRecord);
    else addRecord("relapses", relapseRecord);
    closeDrawer();
    toast.success(exists ? "Relapse updated" : "Relapse record saved");
  };
  const saveIpaa = (ipaaRecord: IPAARecord) => {
    const exists = records.ipaa.some((r) => r.id === ipaaRecord.id);
    if (exists) updateRecord("ipaa", ipaaRecord);
    else addRecord("ipaa", ipaaRecord);
    closeDrawer();
    toast.success(exists ? "IPAA updated" : "IPAA follow-up saved");
  };
  const savePouchoscopy = (pouchoscopyRecord: PouchoscopyRecord) => {
    const exists = records.pouchoscopies.some(
      (r) => r.id === pouchoscopyRecord.id,
    );
    if (exists) updateRecord("pouchoscopies", pouchoscopyRecord);
    else addRecord("pouchoscopies", pouchoscopyRecord);
    closeDrawer();
    toast.success(
      exists ? "Histology pouchoscopy updated" : "Pouchoscopy record saved",
    );
  };

  const handleDeleteRecord = (
    kind: keyof ClinicalRecords,
    recordId: string,
  ) => {
    deleteRecord(kind, recordId);
    toast.success("Entry deleted");
  };

  const openEditVisit = (visit: Visit) => {
    setDrawerPrefill({ visit });
    setDrawer("visits");
  };

  const openEditSymptoms = (row: SymptomRecord) => {
    const group = (related.symptoms as SymptomRecord[]).filter(
      (r) => assessmentGroupKey(r) === assessmentGroupKey(row),
    );
    setDrawerPrefill({ symptomRecords: group });
    setDrawer("symptoms");
  };

  const openEditEndoscopy = (row: EndoscopyRecord) => {
    setDrawerPrefill({ endoscopy: row });
    setDrawer("endoscopies");
  };

  const actionsHeader = (
    <th className="px-4 py-3 text-right text-[11px] uppercase text-slate-500">
      Actions
    </th>
  );
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
  const endoscopyColumns: [
    string,
    keyof EndoscopyRecord | "mayoScore" | "uceisScore",
  ][] = [
    ["Date", "date"],
    ["Visit", "visitId"],
    ["Baron", "baronScore"],
    ["Mayo", "mayoScore"],
    ["UCEIS", "uceisScore"],
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
    keyof PouchoscopyRecord | "serialDisplay",
  ][] = [
    ["Sl. No", "serialDisplay"],
    ["Date of FU", "date"],
    ["Acute inflammation", "acuteInflammation"],
    ["Chronic inflammation", "chronicInflammation"],
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
              onClick={() => setEditPersonalOpen(true)}
            >
              <Edit3 className="size-4" />
              Edit personal info
            </Button>
            <Button variant="secondary" onClick={() => openAddDrawer("visits")}>
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
            <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-bold">Patient details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ["Default contact", getPatientDisplayPhone(patient)],
                    ["Email", patient.email || "Not provided"],
                    ["Police station", patient.policeStation || "Not recorded"],
                    [
                      "Location",
                      `${patient.city}, ${patient.state}${patient.country ? `, ${patient.country}` : ""}`,
                    ],
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
                <PatientPhoneDefaultEditor
                  patient={patient}
                  onUpdate={updatePatient}
                />
                {(patient.wageLossPerMonthRs ||
                  patient.daysAbsentFromWorkPerMonth ||
                  patient.treatmentCostPerMonthRs ||
                  patient.otherSocioEconomicInfo) && (
                  <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
                    {patient.wageLossPerMonthRs ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Wage loss / month</dt>
                        <dd className="font-semibold">Rs. {patient.wageLossPerMonthRs}</dd>
                      </div>
                    ) : null}
                    {patient.daysAbsentFromWorkPerMonth ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Days absent / month</dt>
                        <dd className="font-semibold">
                          {patient.daysAbsentFromWorkPerMonth}
                        </dd>
                      </div>
                    ) : null}
                    {patient.treatmentCostPerMonthRs ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Treatment cost / month</dt>
                        <dd className="font-semibold">
                          Rs. {patient.treatmentCostPerMonthRs}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                )}
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
            <SectionDataChecklist
              items={sectionStatusItems}
              onSelectSection={(key) => {
                if (key === "clinical-dataset") setTab("clinical-dataset");
                else setTab(key as keyof ClinicalRecords | "overview");
              }}
            />
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
                    onClick={() => openAddDrawer(tab as keyof ClinicalRecords)}
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
                    title="No histology pouchoscopy records"
                    description="Add a histology pouchoscopy follow-up row."
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
                        {histologyPouchoscopyRows.map((row, index) => (
                            <tr key={row.id} className="border-t border-slate-100">
                              {pouchoscopyColumns.map(([label, key]) => (
                                <td
                                  key={label}
                                  className="max-w-56 px-4 py-3 text-slate-600"
                                >
                                  {key === "serialDisplay"
                                    ? String(row.serialNumber ?? index + 1)
                                    : key === "date"
                                      ? formatDate(row.date)
                                      : String(
                                          row[key as keyof PouchoscopyRecord] ??
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
                        {actionsHeader}
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
                          <td className="px-4 py-3 text-right">
                            <RecordRowActions
                              onEdit={() => openEditVisit(row)}
                              onDelete={() =>
                                handleDeleteRecord("visits", row.id)
                              }
                            />
                          </td>
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
                        {actionsHeader}
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
                          <td className="px-4 py-3 text-right">
                            <RecordRowActions
                              onEdit={() => openEditSymptoms(row)}
                              onDelete={() =>
                                handleDeleteRecord("symptoms", row.id)
                              }
                            />
                          </td>
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
                        {actionsHeader}
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
                                  : key === "uceisScore"
                                    ? String(endoscopyUceisScore(row) ?? "—")
                                    : String(
                                        row[key as keyof EndoscopyRecord] ??
                                          "—",
                                      )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <RecordRowActions
                              onEdit={() => openEditEndoscopy(row)}
                              onDelete={() =>
                                handleDeleteRecord("endoscopies", row.id)
                              }
                            />
                          </td>
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
                        {actionsHeader}
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
                          {typeof row.id === "string" ? (
                            <td className="px-4 py-3 text-right">
                              <RecordRowActions
                                onEdit={() => {
                                  const kind = tab as keyof ClinicalRecords;
                                  if (kind === "relapses") {
                                    setDrawerPrefill({
                                      relapse: row as unknown as RelapseRecord,
                                    });
                                  } else if (kind === "pouchoscopies") {
                                    setDrawerPrefill({
                                      pouchoscopy:
                                        row as unknown as PouchoscopyRecord,
                                    });
                                  } else if (kind === "ipaa") {
                                    setDrawerPrefill({
                                      ipaa: row as unknown as IPAARecord,
                                    });
                                  } else if (kind === "offspring") {
                                    setDrawerPrefill({
                                      offspring:
                                        row as unknown as OffspringRecord,
                                    });
                                  } else if (kind === "surgeries") {
                                    setDrawerPrefill({
                                      surgery: row as unknown as SurgeryRecord,
                                    });
                                  }
                                  setDrawer(kind);
                                }}
                                onDelete={() =>
                                  handleDeleteRecord(
                                    tab as keyof ClinicalRecords,
                                    String(row.id),
                                  )
                                }
                              />
                            </td>
                          ) : null}
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
      {editPersonalOpen && patient && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-[1px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditPersonalOpen(false);
          }}
        >
          <aside className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                  Patient registry
                </p>
                <h2 className="text-lg font-bold">Edit personal information</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setEditPersonalOpen(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
            </div>
            <PatientEditForm
              patient={patient}
              onCancel={() => setEditPersonalOpen(false)}
              onSaved={(updated) => {
                updatePatient(updated);
                setEditPersonalOpen(false);
              }}
            />
          </aside>
        </div>
      )}
      {drawer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-[1px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
        >
          <aside
            className={`absolute right-0 top-0 h-full w-full overflow-y-auto bg-white shadow-2xl ${drawer === "visits" || drawer === "pregnancies" || drawer === "relapses" || drawer === "ipaa" || drawer === "pouchoscopies" || drawer === "endoscopies" ? "max-w-3xl" : drawer === "symptoms" || drawer === "eims" || drawer === "labs" || drawer === "histopathology" || drawer === "medications" ? "max-w-5xl" : drawer === "imaging" || drawer === "offspring" ? "max-w-2xl" : "max-w-lg"}`}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <VisitForm
                  patientId={patientId}
                  visitCount={related.visits.length}
                  patientVisits={related.visits as Visit[]}
                  editingVisit={drawerPrefill?.visit ?? null}
                  lastVisit={lastVisit}
                  onCancel={closeDrawer}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <SymptomForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  patientRecords={related.symptoms as SymptomRecord[]}
                  initialAssessment={drawerPrefill?.symptomRecords ?? null}
                  lastAssessment={lastSymptomAssessment}
                  onCancel={closeDrawer}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <EimForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  lastAssessment={lastEimAssessment}
                  onCancel={() => closeDrawer()}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <LabForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => closeDrawer()}
                  onSave={saveLabs}
                />
              </>
            ) : drawer === "endoscopies" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Colonoscopy and endoscopic
                    </p>
                    <h2 className="text-lg font-bold">Add colonoscopy</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <EndoscopyForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  patientRecords={related.endoscopies as EndoscopyRecord[]}
                  editingRecord={drawerPrefill?.endoscopy ?? null}
                  lastEndoscopy={lastEndoscopy}
                  onCancel={closeDrawer}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <HistopathologyForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  initialRecords={drawerPrefill?.histopathology ?? null}
                  onCancel={closeDrawer}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <ImagingForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => closeDrawer()}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <MedicationForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => closeDrawer()}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <PregnancyForm
                  patientId={patientId}
                  existingRecords={related.pregnancies as PregnancyRecord[]}
                  onCancel={() => closeDrawer()}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <OffspringForm
                  patientId={patientId}
                  lastRecord={lastOffspring}
                  onCancel={() => closeDrawer()}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <RelapseForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  editingRecord={drawerPrefill?.relapse ?? null}
                  onCancel={closeDrawer}
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
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <IpaaForm
                  patientId={patientId}
                  visits={related.visits as Visit[]}
                  onCancel={() => closeDrawer()}
                  onSave={saveIpaa}
                />
              </>
            ) : drawer === "pouchoscopies" ? (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                      Histology pouchoscopy
                    </p>
                    <h2 className="text-lg font-bold">Add histology pouchoscopy</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => closeDrawer()}
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
                <PouchoscopyForm
                  patientId={patientId}
                  serialNumber={nextPouchoscopySl}
                  editingRecord={drawerPrefill?.pouchoscopy ?? null}
                  onCancel={closeDrawer}
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
                onClick={() => closeDrawer()}
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
              <Button variant="secondary" onClick={() => closeDrawer()}>
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
