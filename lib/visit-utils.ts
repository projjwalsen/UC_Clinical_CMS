import { VISIT_TYPE } from "@/data/lookups";
import type { Visit } from "@/types/clinical";

export function calculateBmi(heightM: number, weightKg: number) {
  if (!heightM || !weightKg) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

export function nextVisitId(patientId: string, existingCount: number) {
  return `${patientId}-V${String(existingCount + 1).padStart(2, "0")}`;
}

export function suggestVisitType(visitCount: number) {
  return VISIT_TYPE[Math.min(visitCount, VISIT_TYPE.length - 1)];
}

export function getLastVisit(visits: Visit[]) {
  if (!visits.length) return null;
  return [...visits].sort((a, b) => b.date.localeCompare(a.date))[0];
}

const str = (value?: string | number) =>
  value === undefined || value === null ? "" : String(value);

export type VisitFormState = {
  date: string;
  type: string;
  heightM: string;
  weightKg: string;
  smokingStatus: string;
  smokingYears: string;
  smokingType: string;
  packYears: string;
  yearsSinceQuitting: string;
  tobaccoChewingStatus: string;
  tobaccoIntakesPerDay: string;
  tobaccoYears: string;
  alcoholStatus: string;
  alcoholGPerDay: string;
  alcoholGPerWeek: string;
  comorbidIllnesses: string;
  ocpUse: string;
  nsaidUse: string;
  nsaidFrequency: string;
  appendectomyHistory: string;
  ageAtAppendectomyYears: string;
  onsetAppendectomyIntervalMonths: string;
  otherRiskFactors: string;
  generalSurvey: string;
  anemia: string;
  oedema: string;
  jaundice: string;
  peripheralLymphNodes: string;
  skinRash: string;
  otherPositiveFindings: string;
  abdominalExamination: string;
  otherSystemExamination: string;
  partialMayoScore: string;
  completeMayoScore: string;
  clinicalState: string;
  complication: string;
  newEim: string;
  uceis: string;
  mayoEndoscopicScore: string;
  admission: string;
  specialComment: string;
  montrealExtent: string;
  montrealSeverity: string;
};

export function buildVisitFormState(
  visitCount: number,
  lastVisit: Visit | null,
  today = "2026-09-07",
): VisitFormState {
  const base: VisitFormState = {
    date: today,
    type: suggestVisitType(visitCount),
    heightM: "",
    weightKg: "",
    smokingStatus: "Never",
    smokingYears: "",
    smokingType: "",
    packYears: "",
    yearsSinceQuitting: "",
    tobaccoChewingStatus: "Never",
    tobaccoIntakesPerDay: "",
    tobaccoYears: "",
    alcoholStatus: "Never",
    alcoholGPerDay: "",
    alcoholGPerWeek: "",
    comorbidIllnesses: "",
    ocpUse: "Never",
    nsaidUse: "Never taken",
    nsaidFrequency: "",
    appendectomyHistory: "No",
    ageAtAppendectomyYears: "",
    onsetAppendectomyIntervalMonths: "",
    otherRiskFactors: "",
    generalSurvey: "",
    anemia: "",
    oedema: "",
    jaundice: "",
    peripheralLymphNodes: "",
    skinRash: "",
    otherPositiveFindings: "",
    abdominalExamination: "",
    otherSystemExamination: "",
    partialMayoScore: "",
    completeMayoScore: "",
    clinicalState: "Remission",
    complication: "",
    newEim: "",
    uceis: "",
    mayoEndoscopicScore: "",
    admission: "No",
    specialComment: "",
    montrealExtent: "E2",
    montrealSeverity: "S0",
  };

  if (!lastVisit) return base;

  return {
    ...base,
    heightM: str(lastVisit.heightM),
    weightKg: str(lastVisit.weightKg),
    smokingStatus: lastVisit.smokingStatus ?? base.smokingStatus,
    smokingYears: str(lastVisit.smokingYears),
    smokingType: lastVisit.smokingType ?? "",
    packYears: str(lastVisit.packYears),
    yearsSinceQuitting: str(lastVisit.yearsSinceQuitting),
    tobaccoChewingStatus:
      lastVisit.tobaccoChewingStatus ?? base.tobaccoChewingStatus,
    tobaccoIntakesPerDay: str(lastVisit.tobaccoIntakesPerDay),
    tobaccoYears: str(lastVisit.tobaccoYears),
    alcoholStatus: lastVisit.alcoholStatus ?? base.alcoholStatus,
    alcoholGPerDay: str(lastVisit.alcoholGPerDay),
    alcoholGPerWeek: str(lastVisit.alcoholGPerWeek),
    comorbidIllnesses: lastVisit.comorbidIllnesses ?? "",
    ocpUse: lastVisit.ocpUse ?? base.ocpUse,
    nsaidUse: lastVisit.nsaidUse ?? base.nsaidUse,
    nsaidFrequency: lastVisit.nsaidFrequency ?? "",
    appendectomyHistory:
      lastVisit.appendectomyHistory ?? base.appendectomyHistory,
    ageAtAppendectomyYears: str(lastVisit.ageAtAppendectomyYears),
    onsetAppendectomyIntervalMonths: str(
      lastVisit.onsetAppendectomyIntervalMonths,
    ),
    otherRiskFactors: lastVisit.otherRiskFactors ?? "",
    partialMayoScore: str(lastVisit.partialMayoScore),
    completeMayoScore: str(lastVisit.completeMayoScore),
    clinicalState: lastVisit.clinicalState ?? base.clinicalState,
    montrealExtent: lastVisit.montrealExtent ?? base.montrealExtent,
    montrealSeverity: lastVisit.montrealSeverity ?? base.montrealSeverity,
  };
}

export function visitFormToRecord(
  form: VisitFormState,
  visitId: string,
  patientId: string,
): Visit {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  const heightM = Number(form.heightM);
  const weightKg = Number(form.weightKg);
  return {
    id: visitId,
    patientId,
    date: form.date,
    type: form.type,
    heightM: num(form.heightM),
    weightKg: num(form.weightKg),
    bmi: calculateBmi(heightM, weightKg) || undefined,
    smokingStatus: form.smokingStatus,
    smokingYears: num(form.smokingYears),
    smokingType: form.smokingType || undefined,
    packYears: num(form.packYears),
    yearsSinceQuitting: num(form.yearsSinceQuitting),
    tobaccoChewingStatus: form.tobaccoChewingStatus,
    tobaccoIntakesPerDay: num(form.tobaccoIntakesPerDay),
    tobaccoYears: num(form.tobaccoYears),
    alcoholStatus: form.alcoholStatus,
    alcoholGPerDay: num(form.alcoholGPerDay),
    alcoholGPerWeek: num(form.alcoholGPerWeek),
    comorbidIllnesses: form.comorbidIllnesses || undefined,
    ocpUse: form.ocpUse,
    nsaidUse: form.nsaidUse,
    nsaidFrequency: form.nsaidFrequency || undefined,
    appendectomyHistory: form.appendectomyHistory,
    ageAtAppendectomyYears: num(form.ageAtAppendectomyYears),
    onsetAppendectomyIntervalMonths: num(form.onsetAppendectomyIntervalMonths),
    otherRiskFactors: form.otherRiskFactors || undefined,
    generalSurvey: form.generalSurvey || undefined,
    anemia: form.anemia || undefined,
    oedema: form.oedema || undefined,
    jaundice: form.jaundice || undefined,
    peripheralLymphNodes: form.peripheralLymphNodes || undefined,
    skinRash: form.skinRash || undefined,
    otherPositiveFindings: form.otherPositiveFindings || undefined,
    abdominalExamination: form.abdominalExamination || undefined,
    otherSystemExamination: form.otherSystemExamination || undefined,
    partialMayoScore: num(form.partialMayoScore),
    completeMayoScore: num(form.completeMayoScore),
    clinicalState: form.clinicalState,
    complication: form.complication || undefined,
    newEim: form.newEim || undefined,
    uceis: num(form.uceis),
    mayoEndoscopicScore: num(form.mayoEndoscopicScore),
    admission: form.admission,
    specialComment: form.specialComment || undefined,
    montrealExtent: form.montrealExtent,
    montrealSeverity: form.montrealSeverity,
  };
}
