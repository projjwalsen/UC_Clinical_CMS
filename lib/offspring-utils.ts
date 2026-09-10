import type { OffspringRecord } from "@/types/clinical";

export type OffspringFormState = {
  anyInfertility: string;
  infertilityPeriodMonths: string;
  totalOffspring: string;
  offspringSinceIbdOnset: string;
  remarks: string;
};

export function buildOffspringFormState(
  lastRecord?: OffspringRecord | null,
): OffspringFormState {
  return {
    anyInfertility: lastRecord?.anyInfertility ?? "",
    infertilityPeriodMonths: str(lastRecord?.infertilityPeriodMonths),
    totalOffspring: str(lastRecord?.totalOffspring),
    offspringSinceIbdOnset: str(lastRecord?.offspringSinceIbdOnset),
    remarks: lastRecord?.remarks ?? "",
  };
}

export function offspringFormToRecord(
  form: OffspringFormState,
  patientId: string,
  id: string,
): OffspringRecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  return {
    id,
    patientId,
    anyInfertility: form.anyInfertility || undefined,
    infertilityPeriodMonths: num(form.infertilityPeriodMonths),
    totalOffspring: num(form.totalOffspring),
    offspringSinceIbdOnset: num(form.offspringSinceIbdOnset),
    remarks: form.remarks || undefined,
  };
}

export function getLastOffspring(records: OffspringRecord[]) {
  if (!records.length) return null;
  return records[records.length - 1];
}

const str = (value?: number) =>
  value === undefined || value === null ? "" : String(value);
