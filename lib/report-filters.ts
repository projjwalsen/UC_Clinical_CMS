import type { ClinicalDatasetReportRow } from "@/types/clinical-report";
import { calculateAgeGroup } from "@/lib/report-calculations";
import {
  DISEASE_ACTIVITY_LABELS,
  IBD_TYPE_LABELS,
  THERAPY_LABELS,
  formatComorbidities,
} from "@/lib/report-labels";

export interface ClinicalReportFilterState {
  search: string;
  ibdCode: string;
  patientName: string;
  ageMin: string;
  ageMax: string;
  sex: string;
  comorbidity: string;
  surgicalHistory: string;
  ibdType: string;
  diseaseLocation: string;
  ageGroup: string;
  diseaseBehaviour: string;
  familyHistory: string;
  diseaseActivity: string;
  currentTherapy: string;
  skinManifestation: string;
  nutritionalDeficiency: string;
  adverseEffect: string;
  biopsyStatus: string;
  extraintestinal: string;
  followUpResponse: string;
  dlqiMin: string;
  dlqiMax: string;
  recordStatus: string;
}

export const emptyReportFilters = (): ClinicalReportFilterState => ({
  search: "",
  ibdCode: "",
  patientName: "",
  ageMin: "",
  ageMax: "",
  sex: "",
  comorbidity: "",
  surgicalHistory: "",
  ibdType: "",
  diseaseLocation: "",
  ageGroup: "",
  diseaseBehaviour: "",
  familyHistory: "",
  diseaseActivity: "",
  currentTherapy: "",
  skinManifestation: "",
  nutritionalDeficiency: "",
  adverseEffect: "",
  biopsyStatus: "",
  extraintestinal: "",
  followUpResponse: "",
  dlqiMin: "",
  dlqiMax: "",
  recordStatus: "",
});

export function filterClinicalReportRows(
  rows: ClinicalDatasetReportRow[],
  filters: ClinicalReportFilterState,
) {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (
      q &&
      !`${row.ibdCode} ${row.patientName} ${row.patientId}`
        .toLowerCase()
        .includes(q)
    ) {
      return false;
    }
    if (filters.ibdCode && !row.ibdCode.includes(filters.ibdCode)) return false;
    if (
      filters.patientName &&
      !row.patientName.toLowerCase().includes(filters.patientName.toLowerCase())
    ) {
      return false;
    }
    if (filters.ageMin && (row.age ?? -1) < Number(filters.ageMin)) return false;
    if (filters.ageMax && (row.age ?? 999) > Number(filters.ageMax)) return false;
    if (filters.sex && String(row.sex ?? "") !== filters.sex) return false;
    if (
      filters.comorbidity &&
      !formatComorbidities(row).toLowerCase().includes(filters.comorbidity.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.surgicalHistory &&
      String(row.surgicalHistory ?? "") !== filters.surgicalHistory
    ) {
      return false;
    }
    if (filters.ibdType && String(row.ibdType ?? "") !== filters.ibdType) {
      return false;
    }
    if (
      filters.diseaseLocation &&
      String(row.diseaseLocation ?? "") !== filters.diseaseLocation
    ) {
      return false;
    }
    if (filters.ageGroup) {
      const group = calculateAgeGroup(row.ageAtDiagnosis);
      if (String(group.code ?? "") !== filters.ageGroup) return false;
    }
    if (
      filters.diseaseBehaviour &&
      String(row.diseaseBehaviour ?? "") !== filters.diseaseBehaviour
    ) {
      return false;
    }
    if (
      filters.familyHistory &&
      String(row.familyHistoryOfIBD ?? "") !== filters.familyHistory
    ) {
      return false;
    }
    if (
      filters.diseaseActivity &&
      String(row.diseaseActivity ?? "") !== filters.diseaseActivity
    ) {
      return false;
    }
    if (filters.currentTherapy) {
      const code = Number(filters.currentTherapy) as 1 | 2 | 3 | 4 | 5;
      if (!row.currentTherapies.includes(code)) return false;
    }
    if (
      filters.skinManifestation &&
      !row.skinManifestations.some((s) =>
        s.toLowerCase().includes(filters.skinManifestation.toLowerCase()),
      )
    ) {
      return false;
    }
    if (
      filters.nutritionalDeficiency &&
      !row.nutritionalDeficiencies.some((s) =>
        s.toLowerCase().includes(filters.nutritionalDeficiency.toLowerCase()),
      )
    ) {
      return false;
    }
    if (filters.adverseEffect) {
      const code = Number(filters.adverseEffect) as 1 | 2 | 3 | 4;
      if (!row.therapyAdverseEffects.includes(code)) return false;
    }
    if (
      filters.biopsyStatus &&
      String(row.skinBiopsyPerformed ?? "") !== filters.biopsyStatus
    ) {
      return false;
    }
    if (
      filters.extraintestinal &&
      !row.extraintestinalManifestations.some((s) =>
        s.toLowerCase().includes(filters.extraintestinal.toLowerCase()),
      )
    ) {
      return false;
    }
    if (
      filters.followUpResponse &&
      String(row.followUpResponse ?? "") !== filters.followUpResponse
    ) {
      return false;
    }
    if (
      filters.dlqiMin &&
      (row.dlqiAtPresentation ?? -1) < Number(filters.dlqiMin)
    ) {
      return false;
    }
    if (
      filters.dlqiMax &&
      (row.dlqiAtPresentation ?? 999) > Number(filters.dlqiMax)
    ) {
      return false;
    }
    if (filters.recordStatus && row.recordStatus !== filters.recordStatus) {
      return false;
    }
    return true;
  });
}

export function activeFilterChips(filters: ClinicalReportFilterState) {
  const chips: { key: keyof ClinicalReportFilterState; label: string }[] = [];
  const push = (key: keyof ClinicalReportFilterState, label: string, value: string) => {
    if (value) chips.push({ key, label: `${label}: ${value}` });
  };
  push("search", "Search", filters.search);
  push("ibdCode", "IBD code", filters.ibdCode);
  push("patientName", "Name", filters.patientName);
  if (filters.ageMin || filters.ageMax) {
    chips.push({
      key: "ageMin",
      label: `Age: ${filters.ageMin || "…"}–${filters.ageMax || "…"}`,
    });
  }
  if (filters.sex) {
    chips.push({
      key: "sex",
      label: `Sex: ${filters.sex === "1" ? "Male" : "Female"}`,
    });
  }
  push("ibdType", "IBD type", filters.ibdType ? IBD_TYPE_LABELS[Number(filters.ibdType) as 1 | 2 | 3] : "");
  push("diseaseActivity", "Activity", filters.diseaseActivity ? DISEASE_ACTIVITY_LABELS[Number(filters.diseaseActivity) as 1 | 2] : "");
  push("currentTherapy", "Therapy", filters.currentTherapy ? THERAPY_LABELS[Number(filters.currentTherapy) as 1 | 2 | 3 | 4 | 5] : "");
  push("recordStatus", "Status", filters.recordStatus);
  return chips;
}
