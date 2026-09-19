import type { LaboratoryResult } from "@/types/clinical";
import {
  computeAbnormalFlag,
  getLabTestReference,
} from "@/data/lab-reference-ranges";
import { testsForCategory } from "@/data/lab-lookups";

export type LabRowState = {
  id: string;
  category: string;
  testName: string;
  resultNumeric: string;
  resultText: string;
  unit: string;
  referenceRange: string;
  abnormalFlag: string;
  cmvMethod: string;
  remarks: string;
};

export type LabFormState = {
  date: string;
  visitId: string;
  rows: LabRowState[];
};

let rowCounter = 0;

export function createLabRowId() {
  rowCounter += 1;
  return `lab-row-${Date.now()}-${rowCounter}`;
}

export function applyTestDefaults(
  testName: string,
  category?: string,
): Pick<
  LabRowState,
  "category" | "testName" | "unit" | "referenceRange" | "abnormalFlag" | "resultText"
> {
  const ref = getLabTestReference(testName);
  return {
    category: ref?.category ?? category ?? "Hematology",
    testName,
    unit: ref?.unit ?? "",
    referenceRange: ref?.referenceRange ?? "",
    abnormalFlag: "Normal",
    resultText: ref?.resultType === "Qualitative" ? ref.normalText ?? "" : "",
  };
}

export function emptyLabRow(category = "Hematology"): LabRowState {
  return {
    id: createLabRowId(),
    category,
    testName: "",
    resultNumeric: "",
    resultText: "",
    unit: "",
    referenceRange: "",
    abnormalFlag: "Normal",
    cmvMethod: "",
    remarks: "",
  };
}

export function buildLabFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): LabFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    rows: [emptyLabRow()],
  };
}

export function buildLabFormStateFromRecords(
  records: LaboratoryResult[],
  defaultVisitId = "",
): LabFormState {
  if (!records.length) return buildLabFormState(defaultVisitId);
  return {
    date: records[0].date,
    visitId: records[0].visitId ?? defaultVisitId,
    rows: records.map((record) => ({
      id: record.id,
      category: record.category,
      testName: record.testName,
      resultNumeric:
        record.resultNumeric !== undefined
          ? String(record.resultNumeric)
          : record.value !== undefined
            ? String(record.value)
            : "",
      resultText: record.resultText ?? "",
      unit: record.unit ?? "",
      referenceRange: record.referenceRange ?? "",
      abnormalFlag: record.abnormalFlag ?? record.flag ?? "Normal",
      cmvMethod: record.cmvMethod ?? "",
      remarks: record.remarks ?? "",
    })),
  };
}

export function labFormToRecords(
  form: LabFormState,
  patientId: string,
  batchId: string,
): LaboratoryResult[] {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return form.rows.map((row, index) => ({
    id: row.id.startsWith("lab-row-") ? `${batchId}-${index + 1}` : row.id,
    patientId,
    visitId: form.visitId || undefined,
    date: form.date,
    category: row.category,
    testName: row.testName,
    resultNumeric: num(row.resultNumeric),
    resultText: row.resultText || undefined,
    unit: row.unit || undefined,
    referenceRange: row.referenceRange || undefined,
    abnormalFlag: row.abnormalFlag || undefined,
    cmvMethod: row.cmvMethod || undefined,
    remarks: row.remarks || undefined,
  }));
}

export function defaultUnitForTest(testName: string) {
  return getLabTestReference(testName)?.unit ?? "";
}

export function formatLabResult(result: LaboratoryResult) {
  if (result.resultNumeric !== undefined) {
    return `${result.resultNumeric}${result.unit ? ` ${result.unit}` : ""}`;
  }
  return result.resultText ?? "—";
}

export function labNumericValue(result: LaboratoryResult) {
  return result.resultNumeric ?? result.value;
}

export function labAbnormalFlag(result: LaboratoryResult) {
  return result.abnormalFlag ?? result.flag;
}

export { computeAbnormalFlag };
