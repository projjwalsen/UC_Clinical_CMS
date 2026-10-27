import type { PregnancyRecord } from "@/types/clinical";

export type PregnancyRowState = {
  id: string;
  pregnancyNumber: string;
  pregnancyYear: string;
  pregnancyMonth: string;
  durationWeeks: string;
  activityAtConception: string;
  courseDuringPregnancy: string;
  newUcComplication: string;
  pregnancyOutcome: string;
  prematureDelivery: string;
  forcepsDelivery: string;
  maternalLowBirthWeightFlag: string;
  maternalSgaFlag: string;
  courseAfterYear1: string;
  courseAfterYear2: string;
  infantBirthYear: string;
  infantBirthWeightKg: string;
  congenitalMalformation: string;
  infantLowBirthWeight: string;
  infantSga: string;
  remarks: string;
};

export type PregnancyFormState = {
  rows: PregnancyRowState[];
};

let rowCounter = 0;

export function createPregnancyRowId() {
  rowCounter += 1;
  return `preg-row-${Date.now()}-${rowCounter}`;
}

export function emptyPregnancyRow(pregnancyNumber: number): PregnancyRowState {
  return {
    id: createPregnancyRowId(),
    pregnancyNumber: String(pregnancyNumber),
    pregnancyYear: "",
    pregnancyMonth: "",
    durationWeeks: "",
    activityAtConception: "",
    courseDuringPregnancy: "",
    newUcComplication: "",
    pregnancyOutcome: "",
    prematureDelivery: "",
    forcepsDelivery: "",
    maternalLowBirthWeightFlag: "",
    maternalSgaFlag: "",
    courseAfterYear1: "",
    courseAfterYear2: "",
    infantBirthYear: "",
    infantBirthWeightKg: "",
    congenitalMalformation: "",
    infantLowBirthWeight: "",
    infantSga: "",
    remarks: "",
  };
}

export function buildPregnancyFormState(
  existingRecords: PregnancyRecord[],
  count = 1,
): PregnancyFormState {
  const startNumber = suggestNextPregnancyNumber(existingRecords);
  return {
    rows: Array.from({ length: count }, (_, index) =>
      emptyPregnancyRow(startNumber + index),
    ),
  };
}

const str = (value?: number) =>
  value === undefined || value === null ? "" : String(value);

export function pregnancyRecordToRow(record: PregnancyRecord): PregnancyRowState {
  return {
    id: record.id,
    pregnancyNumber: str(record.pregnancyNumber),
    pregnancyYear: str(pregnancyYear(record)),
    pregnancyMonth: str(record.pregnancyMonth),
    durationWeeks: str(record.durationWeeks),
    activityAtConception: record.activityAtConception ?? "",
    courseDuringPregnancy: record.courseDuringPregnancy ?? "",
    newUcComplication: record.newUcComplication ?? "",
    pregnancyOutcome: pregnancyOutcomeLabel(record) ?? "",
    prematureDelivery: record.prematureDelivery ?? "",
    forcepsDelivery: record.forcepsDelivery ?? "",
    maternalLowBirthWeightFlag: record.maternalLowBirthWeightFlag ?? "",
    maternalSgaFlag: record.maternalSgaFlag ?? "",
    courseAfterYear1: record.courseAfterYear1 ?? "",
    courseAfterYear2: record.courseAfterYear2 ?? "",
    infantBirthYear: str(record.infantBirthYear),
    infantBirthWeightKg: str(record.infantBirthWeightKg),
    congenitalMalformation: record.congenitalMalformation ?? "",
    infantLowBirthWeight: record.infantLowBirthWeight ?? "",
    infantSga: record.infantSga ?? "",
    remarks: pregnancyRemarks(record) ?? "",
  };
}

/** Rows for the merged form: one section per No. of pregnancy, filled from saved rows. */
export function pregnancyRowsForCount(
  existingRecords: PregnancyRecord[],
  countValue?: number,
): PregnancyRowState[] {
  const existingRows = [...existingRecords]
    .sort(
      (a, b) =>
        (a.pregnancyNumber ?? 0) - (b.pregnancyNumber ?? 0) ||
        a.id.localeCompare(b.id),
    )
    .map(pregnancyRecordToRow);
  const stored = countValue ?? existingRows.length;
  const requested = Number.isFinite(stored) ? stored : existingRows.length;
  const count = Math.max(
    0,
    Math.min(10, Math.max(requested, existingRows.length)),
  );
  if (count === 0) return [];
  return resizePregnancyRows(existingRows, count, 1);
}

export function pregnancyFormToRecords(
  form: PregnancyFormState,
  patientId: string,
  batchId: string,
): PregnancyRecord[] {
  return form.rows.map((row, index) =>
    pregnancyRowToRecord(
      row,
      patientId,
      row.id.startsWith("preg-row-") ? `${batchId}-${index + 1}` : row.id,
    ),
  );
}

export function pregnancyRowToRecord(
  row: PregnancyRowState,
  patientId: string,
  id: string,
): PregnancyRecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return {
    id,
    patientId,
    pregnancyNumber: num(row.pregnancyNumber),
    pregnancyYear: num(row.pregnancyYear),
    pregnancyMonth: num(row.pregnancyMonth),
    durationWeeks: num(row.durationWeeks),
    activityAtConception: row.activityAtConception || undefined,
    courseDuringPregnancy: row.courseDuringPregnancy || undefined,
    newUcComplication: row.newUcComplication || undefined,
    pregnancyOutcome: row.pregnancyOutcome || undefined,
    prematureDelivery: row.prematureDelivery || undefined,
    forcepsDelivery: row.forcepsDelivery || undefined,
    maternalLowBirthWeightFlag: row.maternalLowBirthWeightFlag || undefined,
    maternalSgaFlag: row.maternalSgaFlag || undefined,
    courseAfterYear1: row.courseAfterYear1 || undefined,
    courseAfterYear2: row.courseAfterYear2 || undefined,
    infantBirthYear: num(row.infantBirthYear),
    infantBirthWeightKg: num(row.infantBirthWeightKg),
    congenitalMalformation: row.congenitalMalformation || undefined,
    infantLowBirthWeight: row.infantLowBirthWeight || undefined,
    infantSga: row.infantSga || undefined,
    remarks: row.remarks || undefined,
  };
}

export function pregnancyYear(record: PregnancyRecord) {
  return record.pregnancyYear ?? record.year;
}

export function pregnancyOutcomeLabel(record: PregnancyRecord) {
  return record.pregnancyOutcome ?? record.outcome;
}

export function pregnancyRemarks(record: PregnancyRecord) {
  return record.remarks ?? record.notes;
}

export function suggestNextPregnancyNumber(records: PregnancyRecord[]) {
  const numbers = records
    .map((record) => record.pregnancyNumber)
    .filter((value): value is number => value !== undefined);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

const ORDINALS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
];

export function resizePregnancyRows(
  rows: PregnancyRowState[],
  count: number,
  startNumber: number,
): PregnancyRowState[] {
  const safeCount = Math.max(1, Math.min(count, 10));
  const next = [...rows];
  while (next.length < safeCount) {
    next.push(emptyPregnancyRow(startNumber + next.length));
  }
  while (next.length > safeCount) next.pop();
  return next.map((row, index) => ({
    ...row,
    pregnancyNumber: String(startNumber + index),
  }));
}

export function pregnancySectionLabel(index: number) {
  if (index < ORDINALS.length) return `${ORDINALS[index]} pregnancy`;
  return `${index + 1}th pregnancy`;
}
