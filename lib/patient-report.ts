import {
  endoscopyMayoScore,
  endoscopyUceisScore,
} from "@/lib/endoscopy-utils";
import { getLastOffspring } from "@/lib/offspring-utils";
import { formatDate } from "@/lib/utils";
import {
  pregnancyOutcomeLabel,
  pregnancyRemarks,
  pregnancyYear,
} from "@/lib/pregnancy-utils";
import {
  relapseAdmission,
  relapseCauseLabel,
  relapseOutcomeLabel,
} from "@/lib/relapse-utils";
import type {
  ClinicalRecords,
  EndoscopyRecord,
  OffspringRecord,
  Patient,
  PregnancyRecord,
  RelapseRecord,
  Visit,
} from "@/types/clinical";

export type PresenceFilter = "All" | "Recorded" | "Not recorded";

export type PatientReportFilters = {
  query: string;
  gender: "All" | "Male" | "Female";
  ageMin: string;
  ageMax: string;
  city: string;
  extent: string;
  severity: string;
  status: string;
  followUp: string;
  colonoscopy: PresenceFilter;
  relapse: PresenceFilter;
  pregnancy: PresenceFilter;
  followUpFrom: string;
  followUpTo: string;
};

export function defaultPatientReportFilters(): PatientReportFilters {
  return {
    query: "",
    gender: "All",
    ageMin: "",
    ageMax: "",
    city: "All",
    extent: "All",
    severity: "All",
    status: "All",
    followUp: "All",
    colonoscopy: "All",
    relapse: "All",
    pregnancy: "All",
    followUpFrom: "",
    followUpTo: "",
  };
}

export type PatientReportEntry = {
  patient: Patient;
  lastVisit: Visit | null;
  followUpDate: string;
  pregnancies: PregnancyRecord[];
  mother: OffspringRecord | null;
  colonoscopies: EndoscopyRecord[];
  firstColonoscopy: EndoscopyRecord | null;
  lastColonoscopy: EndoscopyRecord | null;
  relapses: RelapseRecord[];
};

const byDate = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => a.date.localeCompare(b.date));

export function buildPatientReport(
  patients: Patient[],
  records: ClinicalRecords,
  filters: PatientReportFilters,
): PatientReportEntry[] {
  return patients
    .filter((patient) => !patient.archived)
    .map((patient) => toEntry(patient, records))
    .filter((entry) => matchesFilters(entry, filters))
    .sort((a, b) => a.patient.name.localeCompare(b.patient.name));
}

function toEntry(patient: Patient, records: ClinicalRecords): PatientReportEntry {
  const visits = byDate(
    records.visits.filter((visit) => visit.patientId === patient.id),
  );
  const colonoscopies = byDate(
    records.endoscopies.filter((record) => record.patientId === patient.id),
  );
  const firstColonoscopy = colonoscopies[0] ?? null;
  const newest = colonoscopies.at(-1) ?? null;
  const lastVisit = visits.at(-1) ?? null;
  return {
    patient,
    lastVisit,
    followUpDate: lastVisit?.date || patient.lastVisit,
    pregnancies: records.pregnancies
      .filter((record) => record.patientId === patient.id)
      .sort(
        (a, b) =>
          (a.pregnancyNumber ?? 0) - (b.pregnancyNumber ?? 0) ||
          (pregnancyYear(a) ?? 0) - (pregnancyYear(b) ?? 0),
      ),
    mother:
      patient.gender === "Female"
        ? getLastOffspring(
            records.offspring.filter((record) => record.patientId === patient.id),
          )
        : null,
    colonoscopies,
    firstColonoscopy,
    lastColonoscopy:
      newest && newest.id !== firstColonoscopy?.id ? newest : null,
    relapses: byDate(
      records.relapses.filter((record) => record.patientId === patient.id),
    ),
  };
}

function matchesFilters(entry: PatientReportEntry, filters: PatientReportFilters) {
  const { patient } = entry;
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const haystack = [
      patient.name,
      patient.id,
      patient.ibdCode,
      patient.phone,
      patient.alternatePhone,
      patient.address,
      patient.city,
      patient.pinCode,
      patient.occupationText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.gender !== "All" && patient.gender !== filters.gender) return false;
  if (filters.ageMin !== "" && patient.age < Number(filters.ageMin)) return false;
  if (filters.ageMax !== "" && patient.age > Number(filters.ageMax)) return false;
  if (filters.city !== "All" && patient.city !== filters.city) return false;
  if (filters.extent !== "All" && patient.diseaseExtent !== filters.extent) {
    return false;
  }
  if (filters.severity !== "All" && patient.severity !== filters.severity) {
    return false;
  }
  if (filters.status !== "All" && patient.status !== filters.status) return false;
  if (filters.followUp !== "All" && patient.followUpStatus !== filters.followUp) {
    return false;
  }
  if (!presence(filters.colonoscopy, entry.colonoscopies.length > 0)) return false;
  if (!presence(filters.relapse, entry.relapses.length > 0)) return false;
  if (!presence(filters.pregnancy, entry.pregnancies.length > 0)) return false;
  if (
    filters.followUpFrom &&
    (!entry.followUpDate || entry.followUpDate < filters.followUpFrom)
  ) {
    return false;
  }
  if (
    filters.followUpTo &&
    (!entry.followUpDate || entry.followUpDate > filters.followUpTo)
  ) {
    return false;
  }
  return true;
}

function presence(filter: PresenceFilter, recorded: boolean) {
  if (filter === "Recorded") return recorded;
  if (filter === "Not recorded") return !recorded;
  return true;
}

export function showText(value: string | number | boolean | undefined | null) {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function datedText(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return formatDate(value);
}

export function endoscopySummary(record: EndoscopyRecord) {
  const mayo = endoscopyMayoScore(record);
  const uceis = endoscopyUceisScore(record);
  return {
    date: record.date,
    findings: record.findings,
    mayo: mayo === undefined ? undefined : String(mayo),
    uceis: uceis === undefined ? undefined : String(uceis),
    extent: record.diseaseExtent,
    baron: record.baronScore === undefined ? undefined : String(record.baronScore),
    remarks: record.remarks,
  };
}

export function pregnancySummary(record: PregnancyRecord) {
  return {
    number: record.pregnancyNumber,
    year: pregnancyYear(record),
    month: record.pregnancyMonth,
    durationWeeks: record.durationWeeks,
    activity: record.activityAtConception,
    course: record.courseDuringPregnancy,
    complication: record.newUcComplication,
    outcome: pregnancyOutcomeLabel(record),
    premature: record.prematureDelivery,
    forceps: record.forcepsDelivery,
    courseAfterYear1: record.courseAfterYear1,
    courseAfterYear2: record.courseAfterYear2,
    maternalLowBirthWeight: record.maternalLowBirthWeightFlag,
    maternalSga: record.maternalSgaFlag,
    infantYear: record.infantBirthYear,
    infantWeight: record.infantBirthWeightKg,
    malformation: record.congenitalMalformation,
    lowBirthWeight: record.infantLowBirthWeight,
    sga: record.infantSga,
    remarks: pregnancyRemarks(record),
  };
}

export function formatPregnancySummary(records: PregnancyRecord[]) {
  return records
    .map((record) => {
      const item = pregnancySummary(record);
      return [
        `Pregnancy ${showText(item.number)}`,
        `Year: ${showText(item.year)}`,
        `Month: ${showText(item.month)}`,
        `Duration (weeks): ${showText(item.durationWeeks)}`,
        `Activity at conception: ${showText(item.activity)}`,
        `Course during pregnancy: ${showText(item.course)}`,
        `New UC complication: ${showText(item.complication)}`,
        `Outcome: ${showText(item.outcome)}`,
        `Premature delivery: ${showText(item.premature)}`,
        `Forceps delivery: ${showText(item.forceps)}`,
        `Course after year 1: ${showText(item.courseAfterYear1)}`,
        `Course after year 2: ${showText(item.courseAfterYear2)}`,
        `Maternal low birth weight: ${showText(item.maternalLowBirthWeight)}`,
        `Maternal SGA: ${showText(item.maternalSga)}`,
        `Infant birth year: ${showText(item.infantYear)}`,
        `Infant birth weight (kg): ${showText(item.infantWeight)}`,
        `Congenital malformation: ${showText(item.malformation)}`,
        `Infant low birth weight: ${showText(item.lowBirthWeight)}`,
        `Infant SGA: ${showText(item.sga)}`,
        `Remarks: ${showText(item.remarks)}`,
      ].join("; ");
    })
    .join(" || ");
}

export function formatColonoscopySummary(record: EndoscopyRecord | null) {
  if (!record) return "";
  const item = endoscopySummary(record);
  return [
    `Date: ${datedText(item.date)}`,
    `Findings: ${showText(item.findings)}`,
    `Mayo: ${showText(item.mayo)}`,
    `UCEIS: ${showText(item.uceis)}`,
    `Baron: ${showText(item.baron)}`,
    `Extent: ${showText(item.extent)}`,
    `Remarks: ${showText(item.remarks)}`,
  ].join("; ");
}

export function formatRelapseSummary(records: RelapseRecord[]) {
  return records
    .map((record) => {
      const item = relapseSummary(record);
      return [
        `Date: ${datedText(item.date)}`,
        `Cause: ${showText(item.cause)}`,
        `Admission: ${showText(item.admission)}`,
        `Admission days: ${showText(item.admissionDays)}`,
        `Steroid: ${showText(item.steroid)}`,
        `Oral steroid: ${showText(item.oralSteroid)}`,
        `IV steroid: ${showText(item.ivSteroid)}`,
        `Infection: ${showText(item.infection)}`,
        `Infection type: ${showText(item.infectionType)}`,
        `Rescue therapy: ${showText(item.rescue)}`,
        `Rescue type: ${showText(item.rescueType)}`,
        `Rescue failure: ${showText(item.rescueFailure)}`,
        `Outcome: ${showText(item.outcome)}`,
        `Colectomy: ${showText(item.colectomy)}`,
        `Anticoagulation: ${showText(item.anticoagulation)}`,
        `Death: ${showText(item.death)}`,
        `Remarks: ${showText(item.remarks)}`,
      ].join("; ");
    })
    .join(" || ");
}

export function relapseSummary(record: RelapseRecord) {
  const cause = relapseCauseLabel(record);
  return {
    date: record.date,
    cause: cause === "Other" && record.causeOther ? record.causeOther : cause,
    admission: relapseAdmission(record),
    admissionDays: record.admissionDurationDays,
    steroid: record.steroid,
    oralSteroid: record.oralSteroid,
    ivSteroid: record.ivSteroid,
    infection: record.infection,
    infectionType: [record.infectionType, record.infectionTypeDetail]
      .filter(Boolean)
      .join(" — "),
    rescue: record.rescueTherapy,
    rescueType: record.rescueTherapyType,
    rescueFailure: record.rescueTherapyFailure,
    outcome: relapseOutcomeLabel(record),
    colectomy: record.colectomy,
    anticoagulation: record.anticoagulation,
    death: record.death,
    remarks: record.remarks,
  };
}
