import type { RelapseRecord } from "@/types/clinical";

export type RelapseFormState = {
  date: string;
  visitId: string;
  relapseCause: string;
  causeOther: string;
  admission: string;
  steroid: string;
  oralSteroid: string;
  ivSteroid: string;
  infection: string;
  infectionType: string;
  rescueTherapy: string;
  rescueTherapyType: string;
  rescueTherapyFailure: string;
  rescueOutcome: string;
  admissionDurationDays: string;
  colectomy: string;
  anticoagulation: string;
  death: string;
  remarks: string;
};

const str = (value?: string | number) =>
  value === undefined || value === null ? "" : String(value);

export function relapseRecordToFormState(record: RelapseRecord): RelapseFormState {
  return {
    date: record.date,
    visitId: record.visitId,
    relapseCause: record.relapseCause ?? record.cause ?? "",
    causeOther: record.causeOther ?? "",
    admission: relapseAdmission(record) ?? "",
    steroid: record.steroid ?? "",
    oralSteroid: record.oralSteroid ?? "",
    ivSteroid: record.ivSteroid ?? "",
    infection: record.infection ?? "",
    infectionType: record.infectionType ?? "",
    rescueTherapy: record.rescueTherapy ?? "",
    rescueTherapyType: record.rescueTherapyType ?? "",
    rescueTherapyFailure: record.rescueTherapyFailure ?? "",
    rescueOutcome: record.rescueOutcome ?? record.outcome ?? "",
    admissionDurationDays: str(record.admissionDurationDays),
    colectomy: record.colectomy ?? "",
    anticoagulation: record.anticoagulation ?? "",
    death: record.death ?? "",
    remarks: record.remarks ?? "",
  };
}

export function buildRelapseFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): RelapseFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    relapseCause: "",
    causeOther: "",
    admission: "",
    steroid: "",
    oralSteroid: "",
    ivSteroid: "",
    infection: "",
    infectionType: "",
    rescueTherapy: "",
    rescueTherapyType: "",
    rescueTherapyFailure: "",
    rescueOutcome: "",
    admissionDurationDays: "",
    colectomy: "",
    anticoagulation: "",
    death: "",
    remarks: "",
  };
}

export function relapseFormToRecord(
  form: RelapseFormState,
  patientId: string,
  id: string,
): RelapseRecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return {
    id,
    patientId,
    visitId: form.visitId,
    date: form.date,
    relapseCause: form.relapseCause || undefined,
    causeOther: form.causeOther || undefined,
    admission: form.admission || undefined,
    steroid: form.steroid || undefined,
    oralSteroid: form.oralSteroid || undefined,
    ivSteroid: form.ivSteroid || undefined,
    infection: form.infection || undefined,
    infectionType: form.infectionType || undefined,
    rescueTherapy: form.rescueTherapy || undefined,
    rescueTherapyType: form.rescueTherapyType || undefined,
    rescueTherapyFailure: form.rescueTherapyFailure || undefined,
    rescueOutcome: form.rescueOutcome || undefined,
    admissionDurationDays: num(form.admissionDurationDays),
    colectomy: form.colectomy || undefined,
    anticoagulation: form.anticoagulation || undefined,
    death: form.death || undefined,
    remarks: form.remarks || undefined,
  };
}

export function relapseCauseLabel(record: RelapseRecord) {
  return record.relapseCause ?? record.cause;
}

export function relapseOutcomeLabel(record: RelapseRecord) {
  return record.rescueOutcome ?? record.outcome;
}

export function relapseAdmission(record: RelapseRecord) {
  if (record.admission === "Yes" || record.admission === "No") {
    return record.admission;
  }
  if (typeof record.admission === "boolean") {
    return record.admission ? "Yes" : "No";
  }
  return record.admission;
}
