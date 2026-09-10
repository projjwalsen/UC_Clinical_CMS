import type { Patient } from "@/types/clinical";
import type {
  ClinicalDatasetRecord,
  ValidationIssue,
} from "@/types/clinical-report";
import { calculateAgeGroup } from "@/lib/report-calculations";

const CROHN_LOCATIONS = new Set([1, 2, 3, 4]);
const UC_LOCATIONS = new Set([5, 6, 7]);

export function isLocationCompatibleWithIbdType(
  ibdType?: 1 | 2 | 3,
  location?: 1 | 2 | 3 | 4 | 5 | 6 | 7,
) {
  if (ibdType === undefined || location === undefined) return true;
  if (ibdType === 2) return CROHN_LOCATIONS.has(location);
  if (ibdType === 1) return UC_LOCATIONS.has(location);
  return true;
}

export function validateClinicalDatasetRecord(
  record: ClinicalDatasetRecord,
  patient?: Patient,
  allRecords: ClinicalDatasetRecord[] = [],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!record.ibdCode?.trim()) {
    issues.push({
      field: "ibdCode",
      severity: "error",
      message: "IBD code is required for an eligible report record.",
    });
  }

  const duplicate = allRecords.filter(
    (r) => r.id !== record.id && r.ibdCode === record.ibdCode,
  );
  if (duplicate.length) {
    issues.push({
      field: "ibdCode",
      severity: "error",
      message: "Duplicate IBD code detected across clinical dataset records.",
    });
  }

  if (!patient) {
    issues.push({
      field: "patientId",
      severity: "error",
      message: "Missing patient link — no matching patient profile found.",
    });
  }

  if (record.age !== undefined && (record.age < 0 || record.age > 120)) {
    issues.push({
      field: "age",
      severity: "error",
      message: "Age must be between 0 and 120 completed years.",
    });
  }

  if (
    patient &&
    record.ageAtDiagnosis !== undefined &&
    record.ageAtDiagnosis > patient.age
  ) {
    issues.push({
      field: "ageAtDiagnosis",
      severity: "error",
      message: "Age at diagnosis cannot exceed the patient's current age.",
    });
  }

  const derivedGroup = calculateAgeGroup(record.ageAtDiagnosis);
  if (
    record.ageAtDiagnosis !== undefined &&
    derivedGroup.code === null
  ) {
    issues.push({
      field: "ageGroup",
      severity: "warning",
      message: "Age group could not be derived from age at diagnosis.",
    });
  }

  if (record.hasNoComorbidity && record.comorbidities.length) {
    issues.push({
      field: "comorbidities",
      severity: "error",
      message:
        'Conflicting comorbidity selections: "Absent" cannot be combined with recorded conditions.',
    });
  }

  if (
    !isLocationCompatibleWithIbdType(record.ibdType, record.diseaseLocation)
  ) {
    issues.push({
      field: "diseaseLocation",
      severity: "warning",
      message:
        "Disease location is incompatible with IBD type (L1–L4 for Crohn's, E1–E3 for UC).",
    });
  }

  if (
    record.dlqiAtPresentation !== undefined &&
    (record.dlqiAtPresentation < 0 || record.dlqiAtPresentation > 30)
  ) {
    issues.push({
      field: "dlqiAtPresentation",
      severity: "error",
      message: "DLQI at presentation must be between 0 and 30.",
    });
  }

  if (
    record.dlqiAtFollowUp !== undefined &&
    (record.dlqiAtFollowUp < 0 || record.dlqiAtFollowUp > 30)
  ) {
    issues.push({
      field: "dlqiAtFollowUp",
      severity: "error",
      message: "DLQI at follow-up must be between 0 and 30.",
    });
  }

  const requiredClinical = [
    record.surgicalHistory,
    record.ibdType,
    record.diseaseLocation,
    record.diseaseActivity,
  ];
  if (requiredClinical.some((v) => v === undefined)) {
    issues.push({
      field: "recordStatus",
      severity: "warning",
      message: "Missing required clinical information for a complete record.",
    });
  }

  return issues;
}

export function resolveRecordStatus(
  record: ClinicalDatasetRecord,
  patient: Patient | undefined,
  allRecords: ClinicalDatasetRecord[],
): ClinicalDatasetRecord["recordStatus"] {
  const issues = validateClinicalDatasetRecord(record, patient, allRecords);
  if (issues.some((i) => i.severity === "error")) return "review-required";
  if (
    issues.some((i) => i.severity === "warning") ||
    !record.ibdType ||
    !record.diseaseActivity
  ) {
    return issues.length ? "review-required" : "incomplete";
  }
  if (issues.length) return "incomplete";
  return record.recordStatus === "incomplete" ? "incomplete" : "complete";
}
