import {
  computePdaiScore,
  emptyPdaiEndoscopic,
  pdaiInferenceFromScore,
  type PdaiScoreInput,
} from "@/lib/pdai-score";
import type { PouchoscopyRecord, Visit } from "@/types/clinical";

export type PouchoscopyFormState = {
  visitId: string;
  pdaiStoolFrequencyId: string;
  pdaiRectalBleedingId: string;
  pdaiFecalUrgencyId: string;
  pdaiFeverId: string;
  pdaiEndoscopic: Record<string, boolean>;
  pdaiPolymorphInfiltrationId: string;
  pdaiUlcerationLpfId: string;
  acuteInflammation: string;
  chronicInflammation: string;
};

function pdaiInputFromForm(form: PouchoscopyFormState): PdaiScoreInput {
  return {
    pdaiStoolFrequencyId: form.pdaiStoolFrequencyId,
    pdaiRectalBleedingId: form.pdaiRectalBleedingId,
    pdaiFecalUrgencyId: form.pdaiFecalUrgencyId,
    pdaiFeverId: form.pdaiFeverId,
    pdaiEndoscopic: form.pdaiEndoscopic,
    pdaiPolymorphInfiltrationId: form.pdaiPolymorphInfiltrationId,
    pdaiUlcerationLpfId: form.pdaiUlcerationLpfId,
  };
}

export function pdaiScoreFromForm(form: PouchoscopyFormState): number {
  return computePdaiScore(pdaiInputFromForm(form));
}

export function pouchoscopyRecordToFormState(
  record: PouchoscopyRecord,
): PouchoscopyFormState {
  const endoscopic = emptyPdaiEndoscopic();
  if (record.pdaiEndoscopicEdema) endoscopic.edema = true;
  if (record.pdaiEndoscopicGranularity) endoscopic.granularity = true;
  if (record.pdaiEndoscopicFriability) endoscopic.friability = true;
  if (record.pdaiEndoscopicLossOfVascularPattern) {
    endoscopic.lossOfVascularPattern = true;
  }
  if (record.pdaiEndoscopicMucusExudates) endoscopic.mucusExudates = true;
  if (record.pdaiEndoscopicUlceration) endoscopic.ulceration = true;

  return {
    visitId: record.visitId ?? "",
    pdaiStoolFrequencyId: record.pdaiStoolFrequencyId ?? "",
    pdaiRectalBleedingId: record.pdaiRectalBleedingId ?? "",
    pdaiFecalUrgencyId: record.pdaiFecalUrgencyId ?? "",
    pdaiFeverId: record.pdaiFeverId ?? "",
    pdaiEndoscopic: endoscopic,
    pdaiPolymorphInfiltrationId: record.pdaiPolymorphInfiltrationId ?? "",
    pdaiUlcerationLpfId: record.pdaiUlcerationLpfId ?? "",
    acuteInflammation: record.acuteInflammation ?? "",
    chronicInflammation: record.chronicInflammation ?? "",
  };
}

export function buildPouchoscopyFormState(
  defaultVisitId = "",
): PouchoscopyFormState {
  return {
    visitId: defaultVisitId,
    pdaiStoolFrequencyId: "",
    pdaiRectalBleedingId: "",
    pdaiFecalUrgencyId: "",
    pdaiFeverId: "",
    pdaiEndoscopic: emptyPdaiEndoscopic(),
    pdaiPolymorphInfiltrationId: "",
    pdaiUlcerationLpfId: "",
    acuteInflammation: "",
    chronicInflammation: "",
  };
}

export function resolvePouchoscopyFollowUpDate(
  form: Pick<PouchoscopyFormState, "visitId">,
  visits: Visit[],
  fallbackDate = "",
) {
  const visit = visits.find((v) => v.id === form.visitId);
  return visit?.date ?? fallbackDate;
}

export function pouchoscopyFollowUpLabel(
  record: PouchoscopyRecord,
  visits: Visit[],
) {
  const visit = visits.find((v) => v.id === record.visitId);
  if (visit) return `${visit.id} · ${visit.type} · ${visit.date}`;
  return record.date || "—";
}

export function pouchoscopyFormToRecord(
  form: PouchoscopyFormState,
  patientId: string,
  id: string,
  serialNumber: number,
  visits: Visit[],
  fallbackDate = "",
): PouchoscopyRecord {
  const scoreValue = pdaiScoreFromForm(form);
  const endo = form.pdaiEndoscopic;

  return {
    id,
    patientId,
    visitId: form.visitId || undefined,
    serialNumber,
    date: resolvePouchoscopyFollowUpDate(form, visits, fallbackDate),
    scoreType: "PDAI",
    scoreValue,
    inference: pdaiInferenceFromScore(scoreValue),
    pdaiStoolFrequencyId: form.pdaiStoolFrequencyId || undefined,
    pdaiRectalBleedingId: form.pdaiRectalBleedingId || undefined,
    pdaiFecalUrgencyId: form.pdaiFecalUrgencyId || undefined,
    pdaiFeverId: form.pdaiFeverId || undefined,
    pdaiEndoscopicEdema: endo.edema || undefined,
    pdaiEndoscopicGranularity: endo.granularity || undefined,
    pdaiEndoscopicFriability: endo.friability || undefined,
    pdaiEndoscopicLossOfVascularPattern:
      endo.lossOfVascularPattern || undefined,
    pdaiEndoscopicMucusExudates: endo.mucusExudates || undefined,
    pdaiEndoscopicUlceration: endo.ulceration || undefined,
    pdaiPolymorphInfiltrationId:
      form.pdaiPolymorphInfiltrationId || undefined,
    pdaiUlcerationLpfId: form.pdaiUlcerationLpfId || undefined,
    acuteInflammation: form.acuteInflammation.trim() || undefined,
    chronicInflammation: form.chronicInflammation.trim() || undefined,
  };
}

export function nextPouchoscopySerialNumber(
  records: PouchoscopyRecord[],
  patientId: string,
) {
  const forPatient = records.filter((r) => r.patientId === patientId);
  if (!forPatient.length) return 1;
  return Math.max(...forPatient.map((r) => r.serialNumber ?? 0), 0) + 1;
}
