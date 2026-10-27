import type { ClinicalRecords } from "@/types/clinical";

/** Set true to show the Pouchoscopy tab and include it in Save and continue. */
export const POUCHOSCOPY_SECTION_ENABLED = true;

/** Order for “Save and continue” after add patient and between section forms. */
export const CLINICAL_SECTION_CHAIN: (keyof ClinicalRecords)[] = [
  "visits",
  "symptoms",
  "eims",
  "courseOfDisease",
  "diseaseCategorization",
  "labs",
  "endoscopies",
  "histopathology",
  "imaging",
  "relapses",
  "surgeries",
  "ipaa",
  ...(POUCHOSCOPY_SECTION_ENABLED ? (["pouchoscopies"] as const) : []),
  "medications",
];

const SECTION_LABELS: Record<keyof ClinicalRecords, string> = {
  visits: "Visit & Epidemiological",
  symptoms: "Clinical Features",
  eims: "Extra-intestinal manifestations",
  courseOfDisease: "Course of Disease",
  diseaseCategorization: "Disease Categorization",
  labs: "Lab Investigations",
  medications: "Medications",
  endoscopies: "Colonoscopy and endoscopic",
  histopathology: "Histopathology",
  imaging: "Radiological investigations",
  pregnancies: "Pregnancy & offspring",
  offspring: "Offspring",
  relapses: "Relapses",
  surgeries: "Surgery",
  ipaa: "IPAA",
  pouchoscopies: "Pouchoscopy",
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
