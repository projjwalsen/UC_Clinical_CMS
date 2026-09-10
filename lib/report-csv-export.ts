import type { ClinicalDatasetReportRow } from "@/types/clinical-report";
import {
  ADVERSE_EFFECT_LABELS,
  BIOPSY_LABELS,
  DISEASE_ACTIVITY_LABELS,
  DISEASE_BEHAVIOUR_LABELS,
  DISEASE_LOCATION_LABELS,
  FOLLOW_UP_RESPONSE_LABELS,
  IBD_TYPE_LABELS,
  SEX_LABELS,
  SURGICAL_HISTORY_LABELS,
  THERAPY_LABELS,
  formatComorbidities,
} from "@/lib/report-labels";
import {
  calculateAgeGroupCode,
  formatCodes,
  formatComorbidityCodes,
  formatDlqiChangeCode,
  formatReportCell,
  formatTextList,
} from "@/lib/report-table-format";

export function clinicalReportRowsToCsv(
  rows: ClinicalDatasetReportRow[],
  options?: { includeDescriptions?: boolean; serialOffset?: number },
) {
  const serialOffset = options?.serialOffset ?? 0;
  const withDescriptions = options?.includeDescriptions ?? false;

  return rows.map((row, index) => {
    const base: Record<string, string | number> = {
      "SERIAL NO": serialOffset + index + 1,
      "IBD CODE": row.ibdCode,
      NAME: row.patientName,
      "PHONE NUMBER": formatReportCell(row.phoneNumber),
      AGE: formatReportCell(row.age),
      SEX: formatReportCell(row.sex),
      COMORBIDITY: formatComorbidityCodes(row),
      "SURGICAL HISTORY": formatReportCell(row.surgicalHistory),
      "IBD TYPE": formatReportCell(row.ibdType),
      "DISEASE LOCATION": formatReportCell(row.diseaseLocation),
      MODIFIER: formatCodes(row.modifiers),
      "AGE AT DIAGNOSIS": formatReportCell(row.ageAtDiagnosis),
      "AGE GROUP": formatReportCell(calculateAgeGroupCode(row.ageAtDiagnosis)),
      "DISEASE BEHAVIOUR": formatReportCell(row.diseaseBehaviour),
      "DURATION OF ILLNESS": formatReportCell(row.illnessDurationMonths),
      "FAMILY HISTORY OF IBD": formatReportCell(row.familyHistoryOfIBD),
      "DISEASE ACTIVITY": formatReportCell(row.diseaseActivity),
      "CURRENT THERAPY": formatCodes(row.currentTherapies),
      "DURATION OF THERAPY": formatReportCell(row.therapyDurationMonths),
      "SKIN MANIFESTATION": formatTextList(row.skinManifestations),
      "NUTRITIONAL DEFICIENCY": formatTextList(row.nutritionalDeficiencies),
      "ADVERSE EFFECT OF THERAPY": formatCodes(row.therapyAdverseEffects),
      "SKIN BIOPSY PERFORMED": formatReportCell(row.skinBiopsyPerformed),
      "EXTRAINTESTINAL MANIFESTATION": formatTextList(
        row.extraintestinalManifestations,
      ),
      "FOLLOW-UP RESPONSE": formatReportCell(row.followUpResponse),
      "DLQI AT PRESENTATION": formatReportCell(row.dlqiAtPresentation),
      "DLQI AT FOLLOW-UP": formatReportCell(row.dlqiAtFollowUp),
      "DLQI CHANGE": formatDlqiChangeCode(
        row.dlqiAtPresentation,
        row.dlqiAtFollowUp,
      ),
      "RECORD STATUS": row.recordStatus,
      "PATIENT ID": row.patientId,
    };

    if (!withDescriptions) return base;

    return {
      ...base,
      "SEX DESCRIPTION": row.sex ? SEX_LABELS[row.sex] : "",
      "COMORBIDITY DESCRIPTION": formatComorbidities(row),
      "SURGICAL HISTORY DESCRIPTION": row.surgicalHistory
        ? SURGICAL_HISTORY_LABELS[row.surgicalHistory]
        : "",
      "IBD TYPE DESCRIPTION": row.ibdType ? IBD_TYPE_LABELS[row.ibdType] : "",
      "DISEASE LOCATION DESCRIPTION": row.diseaseLocation
        ? DISEASE_LOCATION_LABELS[row.diseaseLocation]
        : "",
      "DISEASE BEHAVIOUR DESCRIPTION": row.diseaseBehaviour
        ? DISEASE_BEHAVIOUR_LABELS[row.diseaseBehaviour]
        : "",
      "DISEASE ACTIVITY DESCRIPTION": row.diseaseActivity
        ? DISEASE_ACTIVITY_LABELS[row.diseaseActivity]
        : "",
      "CURRENT THERAPY DESCRIPTION": row.currentTherapies.length
        ? row.currentTherapies.map((c) => THERAPY_LABELS[c]).join("|")
        : "",
      "ADVERSE EFFECT DESCRIPTION": row.therapyAdverseEffects.length
        ? row.therapyAdverseEffects
            .map((c) => ADVERSE_EFFECT_LABELS[c])
            .join("|")
        : "",
      "SKIN BIOPSY DESCRIPTION": row.skinBiopsyPerformed
        ? BIOPSY_LABELS[row.skinBiopsyPerformed]
        : "",
      "FOLLOW-UP RESPONSE DESCRIPTION": row.followUpResponse
        ? FOLLOW_UP_RESPONSE_LABELS[row.followUpResponse]
        : "",
    };
  });
}
