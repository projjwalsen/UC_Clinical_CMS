import type { PouchoscopyRecord } from "@/types/clinical";

export type PouchoscopyFormState = {
  date: string;
  visitId: string;
  cuffFindings: string;
  bodyFinding: string;
  inletFindings: string;
  tipOfPouchFindings: string;
  prePouchIleumFindings: string;
  diagnosis: string;
  acuteInflammation: string;
  chronicInflammation: string;
  scoreType: string;
  scoreValue: string;
  inference: string;
  remarks: string;
};

export function buildPouchoscopyFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): PouchoscopyFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    cuffFindings: "",
    bodyFinding: "",
    inletFindings: "",
    tipOfPouchFindings: "",
    prePouchIleumFindings: "",
    diagnosis: "",
    acuteInflammation: "",
    chronicInflammation: "",
    scoreType: "",
    scoreValue: "",
    inference: "",
    remarks: "",
  };
}

export function pouchoscopyFormToRecord(
  form: PouchoscopyFormState,
  patientId: string,
  id: string,
): PouchoscopyRecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return {
    id,
    patientId,
    visitId: form.visitId,
    date: form.date,
    cuffFindings: form.cuffFindings || undefined,
    bodyFinding: form.bodyFinding || undefined,
    inletFindings: form.inletFindings || undefined,
    tipOfPouchFindings: form.tipOfPouchFindings || undefined,
    prePouchIleumFindings: form.prePouchIleumFindings || undefined,
    diagnosis: form.diagnosis || undefined,
    acuteInflammation: form.acuteInflammation || undefined,
    chronicInflammation: form.chronicInflammation || undefined,
    scoreType: form.scoreType || undefined,
    scoreValue: num(form.scoreValue),
    inference: form.inference || undefined,
    remarks: form.remarks || undefined,
  };
}

export function pouchoscopyScore(record: PouchoscopyRecord) {
  return record.scoreValue ?? record.score;
}
