import type { ClinicalRecords } from "@/types/clinical";

/** Order for “Save and continue” after add patient and between section forms. */
export const CLINICAL_SECTION_CHAIN: (keyof ClinicalRecords)[] = [
  "visits",
  "symptoms",
  "eims",
  "labs",
  "medications",
  "endoscopies",
  "histopathology",
  "imaging",
  "relapses",
  "surgeries",
  "ipaa",
  "pouchoscopies",
];

const SECTION_LABELS: Record<keyof ClinicalRecords, string> = {
  visits: "Visit",
  symptoms: "Symptoms",
  eims: "Extra-intestinal manifestations",
  labs: "Laboratory results",
  medications: "Medications",
  endoscopies: "Colonoscopy and endoscopic",
  histopathology: "Histopathology",
  imaging: "Imaging",
  pregnancies: "Pregnancy",
  offspring: "Offspring",
  relapses: "Relapses",
  surgeries: "Surgery",
  ipaa: "IPAA",
  pouchoscopies: "Histology pouchoscopy",
  outcomes: "Outcomes",
};

export function getClinicalSectionLabel(section: keyof ClinicalRecords): string {
  return SECTION_LABELS[section];
}

export function getNextClinicalSection(
  current: keyof ClinicalRecords | "patient",
): keyof ClinicalRecords | null {
  if (current === "patient") {
    return CLINICAL_SECTION_CHAIN[0] ?? null;
  }
  const idx = CLINICAL_SECTION_CHAIN.indexOf(current);
  if (idx === -1) return null;
  return CLINICAL_SECTION_CHAIN[idx + 1] ?? null;
}

export function getContinueSectionLabel(
  current: keyof ClinicalRecords | "patient",
): string | null {
  const next = getNextClinicalSection(current);
  return next ? getClinicalSectionLabel(next) : null;
}
