import type { SurgeryRecord } from "@/types/clinical";

export type SurgeryFormState = {
  date: string;
  visitId: string;
  stage: string;
  indication: string;
  hospitalStayDays: string;
  surgicalComplications: string;
};

export function buildSurgeryFormState(defaultVisitId: string): SurgeryFormState {
  return {
    date: "2026-09-07",
    visitId: defaultVisitId,
    stage: "Stage 1",
    indication: "",
    hospitalStayDays: "",
    surgicalComplications: "",
  };
}

export function surgeryRecordToFormState(record: SurgeryRecord): SurgeryFormState {
  return {
    date: record.date,
    visitId: record.visitId,
    stage: record.stage,
    indication: record.indication,
    hospitalStayDays:
      record.hospitalStayDays !== undefined
        ? String(record.hospitalStayDays)
        : "",
    surgicalComplications: record.surgicalComplications ?? "",
  };
}

export function surgeryFormToRecord(
  form: SurgeryFormState,
  patientId: string,
  recordId: string,
): SurgeryRecord {
  return {
    id: recordId,
    patientId,
    visitId: form.visitId,
    date: form.date,
    stage: form.stage,
    indication: form.indication,
    hospitalStayDays: Number(form.hospitalStayDays) || 0,
    surgicalComplications: form.surgicalComplications.trim() || undefined,
  };
}
