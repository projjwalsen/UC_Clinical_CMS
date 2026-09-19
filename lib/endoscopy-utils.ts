import { DISEASE_EXTENT } from "@/data/lookups";
import {
  computeUceisScore,
  parseUceisComponent,
} from "@/lib/uceis-score";
import type { EndoscopyRecord } from "@/types/clinical";

export type EndoscopyFormState = {
  date: string;
  visitId: string;
  findings: string;
  baronScore: string;
  mayoEndoscopicScore: string;
  uceisVascularPattern: string;
  uceisBleeding: string;
  uceisErosionsUlcers: string;
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

export function endoscopyUceisScore(record: EndoscopyRecord) {
  if (record.uceis !== undefined) return record.uceis;
  return computeUceisScore({
    vascularPattern: record.uceisVascularPattern as 0 | 1 | 2 | undefined,
    bleeding: record.uceisBleeding as 0 | 1 | 2 | 3 | undefined,
    erosionsUlcers: record.uceisErosionsUlcers as 0 | 1 | 2 | 3 | undefined,
  });
}

export function uceisScoreFromEndoscopyForm(form: EndoscopyFormState) {
  return computeUceisScore({
    vascularPattern: parseUceisComponent(form.uceisVascularPattern, 2) as
      | 0
      | 1
      | 2
      | undefined,
    bleeding: parseUceisComponent(form.uceisBleeding, 3) as
      | 0
      | 1
      | 2
      | 3
      | undefined,
    erosionsUlcers: parseUceisComponent(form.uceisErosionsUlcers, 3) as
      | 0
      | 1
      | 2
      | 3
      | undefined,
  });
}

export function endoscopyRecordToFormState(
  record: EndoscopyRecord,
): EndoscopyFormState {
  return {
    date: record.date,
    visitId: record.visitId,
    findings: record.findings ?? "",
    baronScore: str(record.baronScore),
    mayoEndoscopicScore: str(endoscopyMayoScore(record)),
    uceisVascularPattern: str(record.uceisVascularPattern),
    uceisBleeding: str(record.uceisBleeding),
    uceisErosionsUlcers: str(record.uceisErosionsUlcers),
    diseaseExtent: record.diseaseExtent ?? DISEASE_EXTENT[0],
    remarks: record.remarks ?? "",
  };
}

export function buildEndoscopyFormState(
  lastEndoscopy: EndoscopyRecord | null | undefined,
  defaultVisitId = "",
  today = "2026-09-07",
): EndoscopyFormState {
  if (lastEndoscopy && lastEndoscopy.date === today) {
    return endoscopyRecordToFormState(lastEndoscopy);
  }
  return {
    date: today,
    visitId: defaultVisitId,
    findings: lastEndoscopy?.findings ?? "",
    baronScore: str(lastEndoscopy?.baronScore),
    mayoEndoscopicScore: str(
      lastEndoscopy ? endoscopyMayoScore(lastEndoscopy) : undefined,
    ),
    uceisVascularPattern: str(lastEndoscopy?.uceisVascularPattern),
    uceisBleeding: str(lastEndoscopy?.uceisBleeding),
    uceisErosionsUlcers: str(lastEndoscopy?.uceisErosionsUlcers),
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
  const uceis = uceisScoreFromEndoscopyForm(form);
  return {
    id,
    patientId,
    visitId: form.visitId,
    date: form.date,
    findings: form.findings || undefined,
    baronScore: num(form.baronScore),
    mayoEndoscopicScore: num(form.mayoEndoscopicScore),
    uceisVascularPattern: num(form.uceisVascularPattern),
    uceisBleeding: num(form.uceisBleeding),
    uceisErosionsUlcers: num(form.uceisErosionsUlcers),
    uceis,
    diseaseExtent: form.diseaseExtent || undefined,
    remarks: form.remarks || undefined,
  };
}

const str = (value?: string | number) =>
  value === undefined || value === null ? "" : String(value);
