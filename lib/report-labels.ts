import type { ClinicalDatasetReportRow } from "@/types/clinical-report";
import {
  calculateAgeGroup,
  calculateDlqiChange,
} from "@/lib/report-calculations";

export const SEX_LABELS: Record<1 | 2, string> = {
  1: "Male",
  2: "Female",
};

export const COMORBIDITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Hypertension",
  2: "Type 2 Diabetes",
  3: "Other",
};

export const SURGICAL_HISTORY_LABELS: Record<1 | 2, string> = {
  1: "Yes",
  2: "No",
};

export const IBD_TYPE_LABELS: Record<1 | 2 | 3, string> = {
  1: "Ulcerative Colitis",
  2: "Crohn's Disease",
  3: "IBD-Unclassified",
};

export const DISEASE_LOCATION_LABELS: Record<
  1 | 2 | 3 | 4 | 5 | 6 | 7,
  string
> = {
  1: "L1",
  2: "L2",
  3: "L3",
  4: "L4",
  5: "E1",
  6: "E2",
  7: "E3",
};

export const MODIFIER_LABELS: Record<1 | 2, string> = {
  1: "L4",
  2: "P",
};

export const DISEASE_BEHAVIOUR_LABELS: Record<1 | 2 | 3, string> = {
  1: "Inflammatory",
  2: "Stricturing",
  3: "Penetrating",
};

export const FAMILY_HISTORY_LABELS: Record<0 | 1, string> = {
  0: "No",
  1: "Yes",
};

export const DISEASE_ACTIVITY_LABELS: Record<1 | 2, string> = {
  1: "Active",
  2: "Remission",
};

export const THERAPY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Corticosteroids",
  2: "5-ASA",
  3: "Immunomodulators",
  4: "Biologics",
  5: "JAK-2 inhibitors",
};

export const ADVERSE_EFFECT_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Steroid-associated",
  2: "Biologic-associated",
  3: "Immunomodulator-associated",
  4: "5-ASA-associated",
};

export const BIOPSY_LABELS: Record<1 | 2, string> = {
  1: "Yes",
  2: "No",
};

export const FOLLOW_UP_RESPONSE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Complete response",
  2: "Partial response",
  3: "No response",
  4: "Appearance of new lesions",
};

export function formatComorbidities(row: ClinicalDatasetReportRow) {
  if (row.hasNoComorbidity) return "Absent";
  if (!row.comorbidities.length && !row.otherComorbidity) return "Not recorded";
  const labels = row.comorbidities.map((c) => COMORBIDITY_LABELS[c]);
  if (row.otherComorbidity) labels.push(row.otherComorbidity);
  return labels.join(", ");
}

export function formatMultiTherapy(codes: Array<1 | 2 | 3 | 4 | 5>) {
  if (!codes.length) return "Not recorded";
  return codes.map((c) => THERAPY_LABELS[c]).join(", ");
}

export function formatDlqiChangeDisplay(
  presentation?: number,
  followUp?: number,
) {
  const change = calculateDlqiChange(presentation, followUp);
  if (change === null) return "Cannot calculate";
  if (change > 0) return `${change} (score decreased)`;
  if (change < 0) return `${Math.abs(change)} (score increased)`;
  return "0 (no numerical change)";
}

export function maskPhone(phone?: string, showSensitive = false) {
  if (!phone) return "";
  if (showSensitive) return phone;
  if (phone.length < 4) return "";
  return `${phone.slice(0, 2)}••••${phone.slice(-2)}`;
}

export function ageGroupForRow(row: ClinicalDatasetReportRow) {
  return calculateAgeGroup(row.ageAtDiagnosis);
}
