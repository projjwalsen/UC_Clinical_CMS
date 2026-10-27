import type { DiseaseCategorizationRecord } from "@/types/clinical";

export type DiseaseCategorizationFormState = {
  extentAtPresentation: string;
  severityAtPresentation: string;
  ageAtPresentation: string;
};

export function categorizationRecordToFormState(
  record?: DiseaseCategorizationRecord | null,
): DiseaseCategorizationFormState {
  return {
    extentAtPresentation: record?.extentAtPresentation ?? "",
    severityAtPresentation: record?.severityAtPresentation ?? "",
    ageAtPresentation:
      record?.ageAtPresentation === undefined
        ? ""
        : String(record.ageAtPresentation),
  };
}

export function categorizationFormToRecord(
  form: DiseaseCategorizationFormState,
  patientId: string,
  id: string,
): DiseaseCategorizationRecord {
  return {
    id,
    patientId,
    extentAtPresentation: form.extentAtPresentation || undefined,
    severityAtPresentation: form.severityAtPresentation || undefined,
    ageAtPresentation:
      form.ageAtPresentation === "" ? undefined : Number(form.ageAtPresentation),
  };
}
