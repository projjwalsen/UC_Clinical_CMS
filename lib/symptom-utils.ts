import { SYMPTOMS, YES_NO } from "@/data/lookups";
import type { SymptomRecord } from "@/types/clinical";

export type SymptomRowState = {
  present: string;
  durationMonths: string;
};

export type SymptomFormState = {
  date: string;
  visitId: string;
  weightLostKg: string;
  presentWeightKg: string;
  remarks: string;
  symptoms: Record<string, SymptomRowState>;
};

const emptyRow = (): SymptomRowState => ({
  present: "No",
  durationMonths: "",
});

export function getAssessmentMeta(records: SymptomRecord[]) {
  const source =
    records.find((record) => record.symptom === "Weight loss") ?? records[0];
  return {
    weightLostKg:
      source?.weightLostKg !== undefined ? String(source.weightLostKg) : "",
    presentWeightKg:
      source?.presentWeightKg !== undefined
        ? String(source.presentWeightKg)
        : "",
    remarks: source?.remarks ?? "",
  };
}

export function buildSymptomFormState(
  lastAssessment: SymptomRecord[] | null,
  defaultVisitId = "",
  today = "2026-09-07",
): SymptomFormState {
  const symptoms = Object.fromEntries(
    SYMPTOMS.map((symptom) => [symptom, emptyRow()]),
  ) as Record<string, SymptomRowState>;

  if (lastAssessment?.length) {
    for (const record of lastAssessment) {
      if (!symptoms[record.symptom]) continue;
      symptoms[record.symptom] = {
        present: record.present,
        durationMonths:
          record.durationMonths !== undefined
            ? String(record.durationMonths)
            : "",
      };
    }
    return {
      date: today,
      visitId: lastAssessment[0].visitId ?? defaultVisitId,
      ...getAssessmentMeta(lastAssessment),
      symptoms,
    };
  }

  return {
    date: today,
    visitId: defaultVisitId,
    weightLostKg: "",
    presentWeightKg: "",
    remarks: "",
    symptoms,
  };
}

export function getLastSymptomAssessment(records: SymptomRecord[]) {
  if (!records.length) return null;
  const groups = new Map<string, SymptomRecord[]>();
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

export function symptomFormToRecords(
  form: SymptomFormState,
  patientId: string,
  assessmentId: string,
): SymptomRecord[] {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  const weightLostKg = num(form.weightLostKg);
  const presentWeightKg = num(form.presentWeightKg);
  const remarks = form.remarks || undefined;

  return SYMPTOMS.map((symptom, index) => {
    const row = form.symptoms[symptom];
    return {
      id: `${assessmentId}-${index + 1}`,
      patientId,
      visitId: form.visitId || undefined,
      date: form.date,
      symptom,
      present: row.present,
      durationMonths:
        row.present === "Yes" ? num(row.durationMonths) : undefined,
      weightLostKg,
      presentWeightKg,
      remarks,
    };
  });
}

export function formatPresent(value: string | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
}

export function isPresent(value: string | boolean) {
  return formatPresent(value) === "Yes";
}

export const SYMPTOM_PRESENT_OPTIONS = YES_NO;
