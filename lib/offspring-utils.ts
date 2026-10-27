import type { Gender, OffspringRecord } from "@/types/clinical";

export type OffspringFormState = {
  anyInfertility: string;
  infertilityPeriodMonths: string;
  totalOffspring: string;
  offspringSinceIbdOnset: string;
  numberOfPregnancies: string;
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
    numberOfPregnancies: str(lastRecord?.numberOfPregnancies),
    remarks: lastRecord?.remarks ?? "",
  };
}

export function offspringFormToRecord(
  form: OffspringFormState,
  patientId: string,
  id: string,
  patientGender: Gender,
): OffspringRecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  const base = {
    id,
    patientId,
    totalOffspring: num(form.totalOffspring),
    remarks: form.remarks || undefined,
  };

  if (patientGender === "Female") {
    return {
      ...base,
      offspringSinceIbdOnset: num(form.offspringSinceIbdOnset),
      numberOfPregnancies: num(form.numberOfPregnancies),
    };
  }

  return {
    ...base,
    anyInfertility: form.anyInfertility || undefined,
    infertilityPeriodMonths: num(form.infertilityPeriodMonths),
    offspringSinceIbdOnset: num(form.offspringSinceIbdOnset),
  };
}

export function getLastOffspring(records: OffspringRecord[]) {
  if (!records.length) return null;
  return records[records.length - 1];
}

export function offspringTabLabel(gender: Gender) {
  return gender === "Female" ? "Female offspring" : "Male offspring";
}

const str = (value?: number) =>
  value === undefined || value === null ? "" : String(value);
