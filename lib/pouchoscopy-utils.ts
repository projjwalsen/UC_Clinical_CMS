import type { PouchoscopyRecord } from "@/types/clinical";

export type PouchoscopyFormState = {
  date: string;
  acuteInflammation: string;
  chronicInflammation: string;
  histologyAttachmentChecked: boolean;
  histologyAttachmentFileName: string;
};

export function pouchoscopyRecordToFormState(
  record: PouchoscopyRecord,
): PouchoscopyFormState {
  return {
    date: record.date,
    acuteInflammation: record.acuteInflammation ?? "",
    chronicInflammation: record.chronicInflammation ?? "",
    histologyAttachmentChecked: !!record.histologyAttachmentChecked,
    histologyAttachmentFileName: record.histologyAttachmentFileName ?? "",
  };
}

export function buildPouchoscopyFormState(): PouchoscopyFormState {
  return {
    date: "",
    acuteInflammation: "",
    chronicInflammation: "",
    histologyAttachmentChecked: false,
    histologyAttachmentFileName: "",
  };
}

export function pouchoscopyFormToRecord(
  form: PouchoscopyFormState,
  patientId: string,
  id: string,
  serialNumber: number,
): PouchoscopyRecord {
  return {
    id,
    patientId,
    serialNumber,
    date: form.date,
    acuteInflammation: form.acuteInflammation.trim() || undefined,
    chronicInflammation: form.chronicInflammation.trim() || undefined,
    histologyAttachmentChecked: form.histologyAttachmentChecked || undefined,
    histologyAttachmentFileName: form.histologyAttachmentChecked
      ? form.histologyAttachmentFileName || undefined
      : undefined,
  };
}

export function pouchoscopyAttachmentLabel(record: PouchoscopyRecord) {
  if (!record.histologyAttachmentChecked) return "—";
  return record.histologyAttachmentFileName?.trim() || "Attached";
}

export function nextPouchoscopySerialNumber(
  records: PouchoscopyRecord[],
  patientId: string,
) {
  const forPatient = records.filter((r) => r.patientId === patientId);
  if (!forPatient.length) return 1;
  return (
    Math.max(...forPatient.map((r) => r.serialNumber ?? 0), 0) + 1
  );
}
