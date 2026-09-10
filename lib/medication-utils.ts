import type { MedicationRecord } from "@/types/clinical";

export type MedicationRowState = {
  id: string;
  drugName: string;
  dose: string;
  route: string;
  startDate: string;
  endDate: string;
  status: string;
  indication: string;
  adherenceNotes: string;
  remarks: string;
};

export type MedicationFormState = {
  visitId: string;
  rows: MedicationRowState[];
};

let rowCounter = 0;

export function createMedicationRowId() {
  rowCounter += 1;
  return `med-row-${Date.now()}-${rowCounter}`;
}

export function emptyMedicationRow(today = "2026-09-07"): MedicationRowState {
  return {
    id: createMedicationRowId(),
    drugName: "",
    dose: "",
    route: "Oral",
    startDate: today,
    endDate: "",
    status: "Current",
    indication: "",
    adherenceNotes: "",
    remarks: "",
  };
}

export function buildMedicationFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): MedicationFormState {
  return {
    visitId: defaultVisitId,
    rows: [emptyMedicationRow(today)],
  };
}

export function medicationFormToRecords(
  form: MedicationFormState,
  patientId: string,
  batchId: string,
): MedicationRecord[] {
  return form.rows.map((row, index) => ({
    id: `${batchId}-${index + 1}`,
    patientId,
    visitId: form.visitId,
    drugName: row.drugName,
    dose: row.dose || undefined,
    route: row.route || undefined,
    startDate: row.startDate,
    endDate: row.endDate || undefined,
    status: row.status as MedicationRecord["status"],
    indication: row.indication || undefined,
    adherenceNotes: row.adherenceNotes || undefined,
    remarks: row.remarks || undefined,
  }));
}

export function medicationRemarks(record: MedicationRecord) {
  return record.remarks ?? record.response;
}
