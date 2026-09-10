import type { IPAARecord } from "@/types/clinical";

export type IpaaFormState = {
  date: string;
  visitId: string;
  pouchType: string;
  daytimeContinence: string;
  stoolFrequencyDay: string;
  stoolFrequencyNight: string;
  nighttimeContinence: string;
  bloodInStool: string;
  incontinence: string;
  stoolFlatusDistinction: string;
  antimotilityAgents: string;
  treatment: string;
  remarks: string;
};

export function computeTotalStoolFrequency(day: string, night: string) {
  const dayNum = day === "" ? 0 : Number(day);
  const nightNum = night === "" ? 0 : Number(night);
  if (Number.isNaN(dayNum) || Number.isNaN(nightNum)) return undefined;
  if (day === "" && night === "") return undefined;
  return dayNum + nightNum;
}

export function buildIpaaFormState(
  defaultVisitId = "",
  today = "2026-09-07",
): IpaaFormState {
  return {
    date: today,
    visitId: defaultVisitId,
    pouchType: "",
    daytimeContinence: "",
    stoolFrequencyDay: "",
    stoolFrequencyNight: "",
    nighttimeContinence: "",
    bloodInStool: "",
    incontinence: "",
    stoolFlatusDistinction: "",
    antimotilityAgents: "",
    treatment: "",
    remarks: "",
  };
}

export function ipaaFormToRecord(
  form: IpaaFormState,
  patientId: string,
  id: string,
): IPAARecord {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  const day = num(form.stoolFrequencyDay);
  const night = num(form.stoolFrequencyNight);
  return {
    id,
    patientId,
    visitId: form.visitId,
    date: form.date,
    pouchType: form.pouchType || undefined,
    daytimeContinence: form.daytimeContinence || undefined,
    stoolFrequencyDay: day,
    stoolFrequencyNight: night,
    totalStoolFrequency:
      day !== undefined || night !== undefined ? (day ?? 0) + (night ?? 0) : undefined,
    nighttimeContinence: form.nighttimeContinence || undefined,
    bloodInStool: form.bloodInStool || undefined,
    incontinence: form.incontinence || undefined,
    stoolFlatusDistinction: form.stoolFlatusDistinction || undefined,
    antimotilityAgents: form.antimotilityAgents || undefined,
    treatment: form.treatment || undefined,
    remarks: form.remarks || undefined,
  };
}

export function ipaaTotalStoolFrequency(record: IPAARecord) {
  if (record.totalStoolFrequency !== undefined) return record.totalStoolFrequency;
  if (
    record.stoolFrequencyDay !== undefined ||
    record.stoolFrequencyNight !== undefined
  ) {
    return (record.stoolFrequencyDay ?? 0) + (record.stoolFrequencyNight ?? 0);
  }
  return undefined;
}
