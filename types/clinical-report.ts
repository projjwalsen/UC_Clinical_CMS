export interface ClinicalDatasetRecord {
  id: string;
  patientId: string;
  ibdCode: string;

  serialNumber?: number;
  phoneNumber?: string;
  age?: number;
  sex?: 1 | 2;

  comorbidities: Array<1 | 2 | 3>;
  hasNoComorbidity?: boolean;
  otherComorbidity?: string;

  surgicalHistory?: 1 | 2;
  ibdType?: 1 | 2 | 3;
  diseaseLocation?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  modifiers: Array<1 | 2>;

  ageAtDiagnosis?: number;
  diseaseBehaviour?: 1 | 2 | 3;
  illnessDurationMonths?: number;
  familyHistoryOfIBD?: 0 | 1;
  diseaseActivity?: 1 | 2;

  currentTherapies: Array<1 | 2 | 3 | 4 | 5>;
  therapyDurationMonths?: number;

  skinManifestations: string[];
  nutritionalDeficiencies: string[];
  therapyAdverseEffects: Array<1 | 2 | 3 | 4>;
  skinBiopsyPerformed?: 1 | 2;
  extraintestinalManifestations: string[];
  followUpResponse?: 1 | 2 | 3 | 4;

  dlqiAtPresentation?: number;
  dlqiAtFollowUp?: number;

  recordStatus: "complete" | "incomplete" | "review-required";
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalDatasetReportRow extends ClinicalDatasetRecord {
  patientName: string;
}

export interface ReportFieldMetadata {
  key: string;
  label: string;
  shortDescription: string;
  inputType: string;
  unit?: string;
  allowedValues?: Array<{
    code: string | number;
    label: string;
    description?: string;
  }>;
  calculation?: string;
  denominatorRule?: string;
  missingValueRule: string;
  applicability?: string;
  warning?: string;
}

export interface ValidationIssue {
  field: string;
  severity: "warning" | "error";
  message: string;
}

export type ReportTableDensity = "comfortable" | "compact";

export type ReportColumnKey =
  | "serialNumber"
  | "ibdCode"
  | "patientName"
  | "phoneNumber"
  | "age"
  | "sex"
  | "comorbidity"
  | "surgicalHistory"
  | "ibdType"
  | "diseaseLocation"
  | "modifier"
  | "ageAtDiagnosis"
  | "ageGroup"
  | "diseaseBehaviour"
  | "illnessDuration"
  | "familyHistoryOfIBD"
  | "diseaseActivity"
  | "currentTherapy"
  | "therapyDuration"
  | "skinManifestation"
  | "nutritionalDeficiency"
  | "adverseEffect"
  | "skinBiopsy"
  | "extraintestinalManifestation"
  | "followUpResponse"
  | "dlqiPresentation"
  | "dlqiFollowUp"
  | "dlqiChange"
  | "recordStatus"
  | "actions";
