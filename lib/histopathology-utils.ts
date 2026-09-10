import type { HistopathologyRecord } from "@/types/clinical";

export type HistopathologyRowState = {
  id: string;
  section: string;
  parameter: string;
  present: string;
  scoreGrade: string;
  histopathologyScore: string;
  remarks: string;
};

export type HistopathologyFormState = {
  date: string;
  visitId: string;
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
    histopathologyScore: "",
    remarks: "",
  };
}

export function buildHistopathologyFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): HistopathologyFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    rows: [emptyHistopathologyRow()],
  };
}

export function histopathologyFormToRecords(
  form: HistopathologyFormState,
  patientId: string,
  batchId: string,
): HistopathologyRecord[] {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return form.rows.map((row, index) => ({
    id: `${batchId}-${index + 1}`,
    patientId,
    visitId: form.visitId || undefined,
    date: form.date,
    section: row.section,
    parameter: row.parameter,
    present: row.present || undefined,
    scoreGrade: row.scoreGrade || undefined,
    histopathologyScore: num(row.histopathologyScore),
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
