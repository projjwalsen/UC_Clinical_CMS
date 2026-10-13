import { POUCHOSCOPY_SECTION_ENABLED } from "@/lib/clinical-workflow";
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
    section("visits", "Visit & Epidemiological", related.visits.length),
    section("symptoms", "Clinical Features", related.symptoms.length),
    section("eims", "Extra-intestinal manifestations", related.eims.length),
    section("offspring", "Offspring", related.offspring.length),
    section("labs", "Lab Investigations", related.labs.length),
    section(
      "endoscopies",
      "Colonoscopy and endoscopic",
      related.endoscopies.length,
    ),
    section("histopathology", "Histopathology", related.histopathology.length),
    section("imaging", "Radiological investigations", related.imaging.length),
    section("relapses", "Relapses", related.relapses.length),
    section("surgeries", "Surgery", related.surgeries.length),
    section("ipaa", "IPAA", related.ipaa.length),
    ...(POUCHOSCOPY_SECTION_ENABLED
      ? [section("pouchoscopies", "Pouchoscopy", related.pouchoscopies.length)]
      : []),
    section("medications", "Medications", related.medications.length),
    {
      key: "clinical-dataset",
      label: "Clinical dataset",
      available: hasClinicalDataset,
      count: hasClinicalDataset ? 1 : 0,
    },
  ];

  if (isFemale) {
    items.push(section("pregnancies", "Pregnancy", related.pregnancies.length));
  }

  return items;
}

function section(
  key: string,
  label: string,
  count: number,
): SectionStatusItem {
  return { key, label, available: count > 0, count };
}
