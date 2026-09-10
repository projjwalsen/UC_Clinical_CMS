import type { ImagingRecord } from "@/types/clinical";

export type ImagingFormState = {
  date: string;
  visitId: string;
  investigationType: string;
  findings: string;
  impression: string;
  remarks: string;
};

export function buildImagingFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): ImagingFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    investigationType: "",
    findings: "",
    impression: "",
    remarks: "",
  };
}

export function imagingFormToRecord(
  form: ImagingFormState,
  patientId: string,
  id: string,
): ImagingRecord {
  return {
    id,
    patientId,
    visitId: form.visitId,
    date: form.date,
    investigationType: form.investigationType,
    findings: form.findings || undefined,
    impression: form.impression || undefined,
    remarks: form.remarks || undefined,
  };
}
