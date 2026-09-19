import type { ClinicalRecords, Patient } from "@/types/clinical";
import type { ClinicalDatasetRecord } from "@/types/clinical-report";

export type SectionStatusItem = {
  key: string;
  label: string;
  available: boolean;
  count: number;
};

export function buildPatientSectionStatus(
  patient: Patient,
  related: ClinicalRecords,
  clinicalDatasetRecords: ClinicalDatasetRecord[],
): SectionStatusItem[] {
  const isFemale = patient.gender === "Female";
  const hasClinicalDataset = clinicalDatasetRecords.some(
    (r) => r.patientId === patient.id,
  );

  const items: SectionStatusItem[] = [
    section("visits", "Visits", related.visits.length),
    section("symptoms", "Symptoms", related.symptoms.length),
    section("eims", "Extra-intestinal manifestations", related.eims.length),
    section("labs", "Laboratory results", related.labs.length),
    section("medications", "Medications", related.medications.length),
    section(
      "endoscopies",
      "Colonoscopy and endoscopic",
      related.endoscopies.length,
    ),
    section("histopathology", "Histopathology", related.histopathology.length),
    section("imaging", "Imaging", related.imaging.length),
    {
      key: "clinical-dataset",
      label: "Clinical dataset",
      available: hasClinicalDataset,
      count: hasClinicalDataset ? 1 : 0,
    },
    section("relapses", "Relapses", related.relapses.length),
    section("surgeries", "Surgery", related.surgeries.length),
    section("ipaa", "IPAA", related.ipaa.length),
    section(
      "pouchoscopies",
      "Histology pouchoscopy",
      related.pouchoscopies.length,
    ),
  ];

  if (isFemale) {
    items.push(section("pregnancies", "Pregnancy", related.pregnancies.length));
  }
  items.push(section("offspring", "Offspring", related.offspring.length));

  return items;
}

function section(
  key: string,
  label: string,
  count: number,
): SectionStatusItem {
  return { key, label, available: count > 0, count };
}
