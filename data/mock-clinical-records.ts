import type { Patient } from "@/types/clinical";
import type { ClinicalDatasetRecord } from "@/types/clinical-report";
import { seedPatients } from "@/data/mock-data";

const skinExamples = [
  ["Erythema nodosum"],
  ["Pyoderma gangrenosum", "Oral aphthae"],
  ["Psoriasiform rash"],
  [],
  ["Perianal tags"],
];
const nutritionExamples = [
  ["Vitamin B12 deficiency"],
  ["Zinc deficiency"],
  ["Niacin deficiency", "Iron deficiency"],
  [],
];
const eimExamples = [
  ["Arthralgia"],
  ["Episcleritis"],
  ["Uveitis"],
  [],
];

function isoNow(offsetDays = 0) {
  const d = new Date(2026, 8, 10);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString();
}

export function buildClinicalRecordForPatient(
  patient: Patient,
  index: number,
): ClinicalDatasetRecord {
  const ibdCode = patient.ibdCode ?? `IBD-${String(index + 1).padStart(4, "0")}`;
  const ibdType = ([1, 1, 2, 3, 1, 2][index % 6] ?? 1) as 1 | 2 | 3;
  const ucLocation = ([5, 6, 7][index % 3] ?? 5) as 5 | 6 | 7;
  const cdLocation = ([1, 2, 3, 4][index % 4] ?? 1) as 1 | 2 | 3 | 4;
  const diseaseLocation =
    ibdType === 2
      ? cdLocation
      : ibdType === 1
        ? ucLocation
        : ((index % 2 ? ucLocation : cdLocation) as ClinicalDatasetRecord["diseaseLocation"]);

  const forceIncompatible = index === 7;
  const finalLocation = forceIncompatible
    ? (5 as const)
    : diseaseLocation;

  const hasNoComorbidity = index % 11 === 0;
  const comorbidities: Array<1 | 2 | 3> = hasNoComorbidity
    ? []
    : index % 4 === 0
      ? [1]
      : index % 5 === 0
        ? [2]
        : index % 6 === 0
          ? [1, 3]
          : index % 8 === 0
            ? []
            : [1];

  const incomplete = index % 9 === 0;
  const reviewCase = index === 7 || index === 13;

  const therapies: Array<1 | 2 | 3 | 4 | 5> =
    index % 3 === 0
      ? [2, 3]
      : index % 5 === 0
        ? [4]
        : index % 7 === 0
          ? [1, 2, 5]
          : [2];

  const createdAt = isoNow(120 + index);
  const updatedAt = isoNow(index % 30);

  return {
    id: `CDR-${patient.id}`,
    patientId: patient.id,
    ibdCode,
    comorbidities: reviewCase && index === 13 ? [1] : comorbidities,
    hasNoComorbidity: reviewCase && index === 13 ? true : hasNoComorbidity,
    otherComorbidity: index % 6 === 0 ? "Hypothyroidism" : undefined,
    surgicalHistory: incomplete ? undefined : index % 2 === 0 ? 1 : 2,
    ibdType: incomplete ? undefined : ibdType,
    diseaseLocation: incomplete ? undefined : finalLocation,
    modifiers: index % 4 === 0 ? [2] : index % 6 === 0 ? [1] : [],
    ageAtDiagnosis: patient.ageAtDiagnosis,
    diseaseBehaviour: ((index % 3) + 1) as 1 | 2 | 3,
    illnessDurationMonths: patient.diseaseDurationYears * 12 + (index % 6),
    familyHistoryOfIBD: patient.familyHistory ? 1 : 0,
    diseaseActivity: incomplete ? undefined : index % 3 === 0 ? 1 : 2,
    currentTherapies: therapies,
    therapyDurationMonths: incomplete ? undefined : 6 + (index % 48),
    skinManifestations: skinExamples[index % skinExamples.length],
    nutritionalDeficiencies: nutritionExamples[index % nutritionExamples.length],
    therapyAdverseEffects:
      index % 10 === 0 ? [] : index % 4 === 0 ? [2] : index % 5 === 0 ? [3, 4] : [1],
    skinBiopsyPerformed: index % 7 === 0 ? undefined : index % 2 === 0 ? 1 : 2,
    extraintestinalManifestations: eimExamples[index % eimExamples.length],
    followUpResponse:
      index % 8 === 0 ? undefined : ((index % 4) + 1) as 1 | 2 | 3 | 4,
    dlqiAtPresentation: index % 12 === 0 ? undefined : 4 + (index % 20),
    dlqiAtFollowUp:
      index % 12 === 0 || index % 5 === 0
        ? undefined
        : 2 + (index % 15),
    recordStatus: reviewCase
      ? "review-required"
      : incomplete
        ? "incomplete"
        : "complete",
    createdAt,
    updatedAt,
  };
}

export const seedClinicalDatasetRecords: ClinicalDatasetRecord[] =
  seedPatients.map((patient, index) =>
    buildClinicalRecordForPatient(patient, index),
  );
