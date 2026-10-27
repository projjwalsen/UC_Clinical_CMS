import { formatDate } from "@/lib/utils";
import {
  endoscopySummary,
  formatColonoscopySummary,
  formatPregnancySummary,
  formatRelapseSummary,
  pregnancySummary,
  relapseSummary,
  type PatientReportEntry,
} from "@/lib/patient-report";

function dated(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return formatDate(value);
}

function cell(value: string | number | boolean | undefined | null) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
}

function sheet(
  XLSX: typeof import("xlsx"),
  headers: string[],
  rows: (string | number)[][],
) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = headers.map((header, index) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, String(row[index] ?? "").length),
      header.length,
    );
    const summary = /summary|findings|notes|remarks|address/i.test(header);
    return { wch: Math.min(summary ? 255 : 36, Math.max(12, longest + 2)) };
  });
  return worksheet;
}

export async function downloadPatientReportExcel(entries: PatientReportEntry[]) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  const maxPregnancies = Math.max(
    0,
    ...entries.map((entry) => entry.pregnancies.length),
  );
  const maxRelapses = Math.max(
    0,
    ...entries.map((entry) => entry.relapses.length),
  );
  const pregnancyColumns: [
    string,
    (item: ReturnType<typeof pregnancySummary>) => string | number,
  ][] = [
    ["number", (item) => cell(item.number)],
    ["year", (item) => cell(item.year)],
    ["month", (item) => cell(item.month)],
    ["duration (weeks)", (item) => cell(item.durationWeeks)],
    ["activity at conception", (item) => cell(item.activity)],
    ["course during pregnancy", (item) => cell(item.course)],
    ["new UC complication", (item) => cell(item.complication)],
    ["outcome", (item) => cell(item.outcome)],
    ["premature delivery", (item) => cell(item.premature)],
    ["forceps delivery", (item) => cell(item.forceps)],
    ["course after year 1", (item) => cell(item.courseAfterYear1)],
    ["course after year 2", (item) => cell(item.courseAfterYear2)],
    ["maternal low birth weight", (item) => cell(item.maternalLowBirthWeight)],
    ["maternal SGA", (item) => cell(item.maternalSga)],
    ["infant birth year", (item) => cell(item.infantYear)],
    ["infant birth weight (kg)", (item) => cell(item.infantWeight)],
    ["congenital malformation", (item) => cell(item.malformation)],
    ["infant low birth weight", (item) => cell(item.lowBirthWeight)],
    ["infant SGA", (item) => cell(item.sga)],
    ["remarks", (item) => cell(item.remarks)],
  ];
  const relapseColumns: [
    string,
    (item: ReturnType<typeof relapseSummary>) => string | number,
  ][] = [
    ["date", (item) => dated(item.date)],
    ["cause", (item) => cell(item.cause)],
    ["admission", (item) => cell(item.admission)],
    ["admission days", (item) => cell(item.admissionDays)],
    ["steroid", (item) => cell(item.steroid)],
    ["oral steroid", (item) => cell(item.oralSteroid)],
    ["IV steroid", (item) => cell(item.ivSteroid)],
    ["infection", (item) => cell(item.infection)],
    ["infection type", (item) => cell(item.infectionType)],
    ["rescue therapy", (item) => cell(item.rescue)],
    ["rescue type", (item) => cell(item.rescueType)],
    ["rescue failure", (item) => cell(item.rescueFailure)],
    ["outcome", (item) => cell(item.outcome)],
    ["colectomy", (item) => cell(item.colectomy)],
    ["anticoagulation", (item) => cell(item.anticoagulation)],
    ["death", (item) => cell(item.death)],
    ["remarks", (item) => cell(item.remarks)],
  ];

  const patientHeaders = [
    "UC ID",
    "IBD code",
    "Name",
    "Gender",
    "Age",
    "Date of birth",
    "Phone",
    "Alternate phone",
    "Email",
    "Address",
    "City",
    "State",
    "PIN",
    "Police station",
    "Religion",
    "Marital status",
    "Children",
    "Occupation",
    "Education",
    "Diet",
    "Monthly family income",
    "Socioeconomic category",
    "Diagnosis date",
    "Age at diagnosis",
    "Disease duration (years)",
    "Extent",
    "Severity",
    "Clinical status",
    "Smoking",
    "Family history",
    "Comorbidities",
    "Follow-up status",
    "Registration date",
    "Notes",
    "Last follow-up date",
    "Last visit type",
    "Last clinical state",
    "Last disease status",
    "Partial Mayo",
    "Complete Mayo",
    "Height (m)",
    "Weight (kg)",
    "BMI",
    "Follow-up extent",
    "Follow-up severity",
    "Follow-up admission",
    "Follow-up smoking",
    "Follow-up notes",
    "Total offspring",
    "Children after disease onset",
    "No. of pregnancy",
    "Pregnancy records",
    "Pregnancy summary",
    ...Array.from({ length: maxPregnancies }, (_, index) =>
      pregnancyColumns.map(([label]) => `Pregnancy ${index + 1} ${label}`),
    ).flat(),
    "First colonoscopy summary",
    "First colonoscopy date",
    "First colonoscopy findings",
    "First Mayo",
    "First UCEIS",
    "First Baron",
    "First colonoscopy extent",
    "First colonoscopy remarks",
    "Last colonoscopy summary",
    "Last colonoscopy date",
    "Last colonoscopy findings",
    "Last Mayo",
    "Last UCEIS",
    "Last Baron",
    "Last colonoscopy extent",
    "Last colonoscopy remarks",
    "Relapse count",
    "Relapse summary",
    ...Array.from({ length: maxRelapses }, (_, index) =>
      relapseColumns.map(([label]) => `Relapse ${index + 1} ${label}`),
    ).flat(),
  ];

  const patients = entries.map((entry) => {
    const { patient, lastVisit, mother } = entry;
    const first = entry.firstColonoscopy
      ? endoscopySummary(entry.firstColonoscopy)
      : null;
    const last = entry.lastColonoscopy
      ? endoscopySummary(entry.lastColonoscopy)
      : null;
    return [
      patient.id,
      cell(patient.ibdCode),
      patient.name,
      patient.gender,
      patient.age,
      dated(patient.dateOfBirth),
      patient.phone,
      cell(patient.alternatePhone),
      cell(patient.email),
      patient.address,
      patient.city,
      patient.state,
      patient.pinCode,
      cell(patient.policeStation),
      patient.religion,
      patient.maritalStatus,
      patient.children,
      cell(patient.occupationText || patient.occupation),
      patient.education,
      patient.diet,
      cell(patient.monthlyFamilyIncome),
      patient.socioeconomicCategory,
      dated(patient.diagnosisDate),
      patient.ageAtDiagnosis,
      patient.diseaseDurationYears,
      patient.diseaseExtent,
      patient.severity,
      patient.status,
      patient.smokingStatus,
      patient.familyHistory ? "Yes" : "No",
      patient.comorbidities.join(", "),
      patient.followUpStatus,
      dated(patient.registrationDate),
      patient.notes,
      dated(entry.followUpDate),
      cell(lastVisit?.type),
      cell(lastVisit?.clinicalState),
      cell(lastVisit?.diseaseStatus),
      cell(lastVisit?.partialMayoScore),
      cell(lastVisit?.completeMayoScore),
      cell(lastVisit?.heightM),
      cell(lastVisit?.weightKg),
      cell(lastVisit?.bmi),
      cell(lastVisit?.diseaseExtent),
      cell(lastVisit?.severity),
      cell(lastVisit?.admission),
      cell(lastVisit?.smokingStatus),
      cell(lastVisit?.clinicalNotes || lastVisit?.specialComment),
      patient.gender === "Female" ? cell(mother?.totalOffspring) : "",
      patient.gender === "Female" ? cell(mother?.offspringSinceIbdOnset) : "",
      patient.gender === "Female" ? cell(mother?.numberOfPregnancies) : "",
      entry.pregnancies.length,
      formatPregnancySummary(entry.pregnancies),
      ...Array.from({ length: maxPregnancies }, (_, index) => {
        const record = entry.pregnancies[index];
        const item = record ? pregnancySummary(record) : null;
        return pregnancyColumns.map(([, read]) => (item ? read(item) : ""));
      }).flat(),
      first ? formatColonoscopySummary(entry.firstColonoscopy) : "",
      dated(first?.date),
      cell(first?.findings),
      cell(first?.mayo),
      cell(first?.uceis),
      cell(first?.baron),
      cell(first?.extent),
      cell(first?.remarks),
      last ? formatColonoscopySummary(entry.lastColonoscopy) : "",
      dated(last?.date),
      cell(last?.findings),
      cell(last?.mayo),
      cell(last?.uceis),
      cell(last?.baron),
      cell(last?.extent),
      cell(last?.remarks),
      entry.relapses.length,
      formatRelapseSummary(entry.relapses),
      ...Array.from({ length: maxRelapses }, (_, index) => {
        const record = entry.relapses[index];
        const item = record ? relapseSummary(record) : null;
        return relapseColumns.map(([, read]) => (item ? read(item) : ""));
      }).flat(),
    ];
  });

  XLSX.utils.book_append_sheet(
    workbook,
    sheet(XLSX, patientHeaders, patients),
    "Patients",
  );

  const pregnancies = entries.flatMap((entry) =>
    entry.pregnancies.map((record) => {
      const item = pregnancySummary(record);
      return [
        entry.patient.id,
        entry.patient.name,
        cell(item.number),
        cell(item.year),
        cell(item.month),
        cell(item.durationWeeks),
        cell(item.activity),
        cell(item.course),
        cell(item.complication),
        cell(item.outcome),
        cell(item.premature),
        cell(item.forceps),
        cell(item.courseAfterYear1),
        cell(item.courseAfterYear2),
        cell(item.maternalLowBirthWeight),
        cell(item.maternalSga),
        cell(item.infantYear),
        cell(item.infantWeight),
        cell(item.malformation),
        cell(item.lowBirthWeight),
        cell(item.sga),
        cell(item.remarks),
      ];
    }),
  );
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      XLSX,
      [
        "UC ID",
        "Name",
        "Pregnancy number",
        "Year",
        "Month",
        "Duration (weeks)",
        "Activity at conception",
        "Course during pregnancy",
        "New UC complication",
        "Outcome",
        "Premature delivery",
        "Forceps delivery",
        "Course after year 1",
        "Course after year 2",
        "Maternal low birth weight",
        "Maternal SGA",
        "Infant birth year",
        "Infant birth weight (kg)",
        "Congenital malformation",
        "Infant low birth weight",
        "Infant SGA",
        "Remarks",
      ],
      pregnancies,
    ),
    "Pregnancies",
  );

  const colonoscopies = entries.flatMap((entry) => {
    const rows: (string | number)[][] = [];
    const push = (label: string, record: NonNullable<typeof entry.firstColonoscopy>) => {
      const item = endoscopySummary(record);
      rows.push([
        entry.patient.id,
        entry.patient.name,
        label,
        dated(item.date),
        cell(item.findings),
        cell(item.mayo),
        cell(item.uceis),
        cell(item.baron),
        cell(item.extent),
        cell(item.remarks),
      ]);
    };
    if (entry.firstColonoscopy) {
      push(entry.lastColonoscopy ? "First" : "Only", entry.firstColonoscopy);
    }
    if (entry.lastColonoscopy) push("Last", entry.lastColonoscopy);
    return rows;
  });
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      XLSX,
      [
        "UC ID",
        "Name",
        "Which",
        "Date",
        "Findings",
        "Mayo",
        "UCEIS",
        "Baron",
        "Extent",
        "Remarks",
      ],
      colonoscopies,
    ),
    "Colonoscopy",
  );

  const relapses = entries.flatMap((entry) =>
    entry.relapses.map((record) => {
      const item = relapseSummary(record);
      return [
        entry.patient.id,
        entry.patient.name,
        dated(item.date),
        cell(item.cause),
        cell(item.admission),
        cell(item.admissionDays),
        cell(item.steroid),
        cell(item.oralSteroid),
        cell(item.ivSteroid),
        cell(item.infection),
        cell(item.infectionType),
        cell(item.rescue),
        cell(item.rescueType),
        cell(item.rescueFailure),
        cell(item.outcome),
        cell(item.colectomy),
        cell(item.anticoagulation),
        cell(item.death),
        cell(item.remarks),
      ];
    }),
  );
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      XLSX,
      [
        "UC ID",
        "Name",
        "Date",
        "Cause",
        "Admission",
        "Admission days",
        "Steroid",
        "Oral steroid",
        "IV steroid",
        "Infection",
        "Infection type",
        "Rescue therapy",
        "Rescue type",
        "Rescue failure",
        "Outcome",
        "Colectomy",
        "Anticoagulation",
        "Death",
        "Remarks",
      ],
      relapses,
    ),
    "Relapses",
  );

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `patient-report-${stamp}.xlsx`);
}
