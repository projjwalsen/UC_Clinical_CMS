import { DISEASE_EXTENT } from "@/data/lookups";
import type { EndoscopyRecord } from "@/types/clinical";

export type EndoscopyFormState = {
  date: string;
  visitId: string;
  findings: string;
  baronScore: string;
  mayoEndoscopicScore: string;
  uceis: string;
  diseaseExtent: string;
  remarks: string;
};

export function getLastEndoscopy(endoscopies: EndoscopyRecord[]) {
  if (!endoscopies.length) return null;
  return [...endoscopies].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function endoscopyMayoScore(record: EndoscopyRecord) {
  return record.mayoEndoscopicScore ?? record.mayoScore;
}

export function buildEndoscopyFormState(
  lastEndoscopy: EndoscopyRecord | null | undefined,
  defaultVisitId = "",
  today = "2026-09-07",
): EndoscopyFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    findings: lastEndoscopy?.findings ?? "",
    baronScore: str(lastEndoscopy?.baronScore),
    mayoEndoscopicScore: str(
      lastEndoscopy ? endoscopyMayoScore(lastEndoscopy) : undefined,
    ),
    uceis: str(lastEndoscopy?.uceis),
    diseaseExtent: lastEndoscopy?.diseaseExtent ?? DISEASE_EXTENT[0],
    remarks: lastEndoscopy?.remarks ?? "",
  };
}

export function endoscopyFormToRecord(
  form: EndoscopyFormState,
  patientId: string,
  id: string,
): EndoscopyRecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return {
    id,
    patientId,
    visitId: form.visitId,
    date: form.date,
    findings: form.findings || undefined,
    baronScore: num(form.baronScore),
    mayoEndoscopicScore: num(form.mayoEndoscopicScore),
    uceis: num(form.uceis),
    diseaseExtent: form.diseaseExtent || undefined,
    remarks: form.remarks || undefined,
  };
}

const str = (value?: string | number) =>
  value === undefined || value === null ? "" : String(value);
