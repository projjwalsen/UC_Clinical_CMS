import {
  computeRobartsHistopathologyScore,
  parseRobartsCriterion,
  parseRobartsErosion,
} from "@/lib/robarts-histopathology-index";
import type { HistopathologyRecord } from "@/types/clinical";

export type HistopathologyRowState = {
  id: string;
  section: string;
  parameter: string;
  present: string;
  scoreGrade: string;
  remarks: string;
};

export type HistopathologyFormState = {
  date: string;
  visitId: string;
  robartsChronicInflammatoryInfiltrate: string;
  robartsNeutrophilsLaminaPropria: string;
  robartsNeutrophilsEpithelium: string;
  robartsErosionUlceration: string;
  rows: HistopathologyRowState[];
};

let rowCounter = 0;

export function createHistopathologyRowId() {
  rowCounter += 1;
  return `hist-row-${Date.now()}-${rowCounter}`;
}

export function emptyHistopathologyRow(section = "Epithelial Surface"): HistopathologyRowState {
  return {
    id: createHistopathologyRowId(),
    section,
    parameter: "",
    present: "",
    scoreGrade: "",
    remarks: "",
  };
}

export function robartsScoreFromHistopathologyForm(form: HistopathologyFormState) {
  return computeRobartsHistopathologyScore({
    chronicInflammatoryInfiltrate: parseRobartsCriterion(
      form.robartsChronicInflammatoryInfiltrate,
    ),
    neutrophilsLaminaPropria: parseRobartsCriterion(
      form.robartsNeutrophilsLaminaPropria,
    ),
    neutrophilsEpithelium: parseRobartsCriterion(
      form.robartsNeutrophilsEpithelium,
    ),
    erosionUlceration: parseRobartsErosion(form.robartsErosionUlceration),
  });
}

export function buildHistopathologyFormStateFromRecords(
  records: HistopathologyRecord[],
  defaultVisitId = "",
): HistopathologyFormState {
  if (!records.length) return buildHistopathologyFormState(defaultVisitId);
  const source = records[0];
  return {
    date: source.date,
    visitId: source.visitId ?? defaultVisitId,
    robartsChronicInflammatoryInfiltrate: str(
      source.robartsChronicInflammatoryInfiltrate,
    ),
    robartsNeutrophilsLaminaPropria: str(source.robartsNeutrophilsLaminaPropria),
    robartsNeutrophilsEpithelium: str(source.robartsNeutrophilsEpithelium),
    robartsErosionUlceration:
      source.robartsErosionUlcerationCode ??
      (source.robartsErosionUlceration !== undefined
        ? String(source.robartsErosionUlceration)
        : ""),
    rows: records.map((record) => ({
      id: record.id,
      section: record.section,
      parameter: record.parameter,
      present: record.present ?? "",
      scoreGrade: record.scoreGrade ?? "",
      remarks: record.remarks ?? "",
    })),
  };
}

const str = (value?: string | number) =>
  value === undefined || value === null ? "" : String(value);

export function buildHistopathologyFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): HistopathologyFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    robartsChronicInflammatoryInfiltrate: "",
    robartsNeutrophilsLaminaPropria: "",
    robartsNeutrophilsEpithelium: "",
    robartsErosionUlceration: "",
    rows: [emptyHistopathologyRow()],
  };
}

export function histopathologyFormToRecords(
  form: HistopathologyFormState,
  patientId: string,
  batchId: string,
): HistopathologyRecord[] {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  const histopathologyScore = robartsScoreFromHistopathologyForm(form);
  const robartsShared = {
    robartsChronicInflammatoryInfiltrate: num(
      form.robartsChronicInflammatoryInfiltrate,
    ),
    robartsNeutrophilsLaminaPropria: num(form.robartsNeutrophilsLaminaPropria),
    robartsNeutrophilsEpithelium: num(form.robartsNeutrophilsEpithelium),
    robartsErosionUlceration: parseRobartsErosion(form.robartsErosionUlceration),
    robartsErosionUlcerationCode: form.robartsErosionUlceration || undefined,
    histopathologyScore,
  };
  return form.rows.map((row, index) => ({
    id: row.id.startsWith("hist-row-") ? `${batchId}-${index + 1}` : row.id,
    patientId,
    visitId: form.visitId || undefined,
    date: form.date,
    section: row.section,
    parameter: row.parameter,
    present: row.present || undefined,
    scoreGrade: row.scoreGrade || undefined,
    ...robartsShared,
    remarks: row.remarks || undefined,
  }));
}

export function formatHistopathologyPresent(record: HistopathologyRecord) {
  const value = (record as { present?: string | boolean }).present;
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (typeof value === "string" && value !== "") return value;
  return "—";
}

export function histopathologyScoreValue(record: HistopathologyRecord) {
  return record.histopathologyScore ?? record.score;
}
