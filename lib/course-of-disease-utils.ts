import type { CourseOfDiseaseRecord } from "@/types/clinical";

export type CourseOfDiseaseFormState = {
  singleEpisodeProlongedRemission: string;
  chronicContinuousActive: string;
  relapsingRemitting: string;
  severityIncreaseAfterLowActivity: string;
  fulminantEarlyColectomy: string;
  colectomyAtFirstRelapse: string;
};

export function courseRecordToFormState(
  record?: CourseOfDiseaseRecord | null,
): CourseOfDiseaseFormState {
  return {
    singleEpisodeProlongedRemission:
      record?.singleEpisodeProlongedRemission ?? "",
    chronicContinuousActive: record?.chronicContinuousActive ?? "",
    relapsingRemitting: record?.relapsingRemitting ?? "",
    severityIncreaseAfterLowActivity:
      record?.severityIncreaseAfterLowActivity ?? "",
    fulminantEarlyColectomy: record?.fulminantEarlyColectomy ?? "",
    colectomyAtFirstRelapse: record?.colectomyAtFirstRelapse ?? "",
  };
}

export function courseFormToRecord(
  form: CourseOfDiseaseFormState,
  patientId: string,
  id: string,
): CourseOfDiseaseRecord {
  const text = (value: string) => value.trim() || undefined;
  return {
    id,
    patientId,
    singleEpisodeProlongedRemission: text(form.singleEpisodeProlongedRemission),
    chronicContinuousActive: text(form.chronicContinuousActive),
    relapsingRemitting: text(form.relapsingRemitting),
    severityIncreaseAfterLowActivity: text(
      form.severityIncreaseAfterLowActivity,
    ),
    fulminantEarlyColectomy: text(form.fulminantEarlyColectomy),
    colectomyAtFirstRelapse: form.colectomyAtFirstRelapse || undefined,
  };
}
