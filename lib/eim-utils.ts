import { EIM_MANIFESTATIONS, YES_NO } from "@/data/lookups";
import type { EIMRecord } from "@/types/clinical";

export type EimRowState = {
  present: string;
  afterIbdOnset: string;
};

export type EimFormState = {
  date: string;
  visitId: string;
  veinThrombosed: string;
  remarks: string;
  manifestations: Record<string, EimRowState>;
};

const emptyRow = (): EimRowState => ({
  present: "No",
  afterIbdOnset: "",
});

export function getEimAssessmentMeta(records: EIMRecord[]) {
  const source =
    records.find((record) => record.manifestation === "Thrombotic Episodes") ??
    records[0];
  return {
    veinThrombosed: source?.veinThrombosed ?? "",
    remarks: source?.remarks ?? "",
  };
}

export function buildEimFormState(
  lastAssessment: EIMRecord[] | null,
  defaultVisitId = "",
  today = "2026-09-07",
): EimFormState {
  const manifestations = Object.fromEntries(
    EIM_MANIFESTATIONS.map((manifestation) => [manifestation, emptyRow()]),
  ) as Record<string, EimRowState>;

  if (lastAssessment?.length) {
    for (const record of lastAssessment) {
      if (!manifestations[record.manifestation]) continue;
      manifestations[record.manifestation] = {
        present: record.present,
        afterIbdOnset: record.afterIbdOnset ?? "",
      };
    }
    return {
      date: today,
      visitId: lastAssessment[0].visitId ?? defaultVisitId,
      ...getEimAssessmentMeta(lastAssessment),
      manifestations,
    };
  }

  return {
    date: today,
    visitId: defaultVisitId,
    veinThrombosed: "",
    remarks: "",
    manifestations,
  };
}

export function getLastEimAssessment(records: EIMRecord[]) {
  if (!records.length) return null;
  const groups = new Map<string, EIMRecord[]>();
  for (const record of records) {
    const key = `${record.visitId ?? ""}|${record.date}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) =>
    b[0].date.localeCompare(a[0].date),
  )[0];
}

export function eimFormToRecords(
  form: EimFormState,
  patientId: string,
  assessmentId: string,
): EIMRecord[] {
  const veinThrombosed = form.veinThrombosed || undefined;
  const remarks = form.remarks || undefined;

  return EIM_MANIFESTATIONS.map((manifestation, index) => {
    const row = form.manifestations[manifestation];
    return {
      id: `${assessmentId}-${index + 1}`,
      patientId,
      visitId: form.visitId || undefined,
      date: form.date,
      manifestation,
      present: row.present,
      afterIbdOnset:
        row.present === "Yes" && row.afterIbdOnset
          ? row.afterIbdOnset
          : undefined,
      veinThrombosed,
      remarks,
    };
  });
}

export function formatEimPresent(value: string | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
}

export const EIM_PRESENT_OPTIONS = YES_NO;
