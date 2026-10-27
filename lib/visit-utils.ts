import { VISIT_TYPE } from "@/data/lookups";
import {
  computeMayoScores,
  parseMayoComponent,
} from "@/lib/mayo-score";
import type { Patient, Visit } from "@/types/clinical";

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

export function visitToFormState(
  visit: Visit,
  patient?: Patient | null,
): VisitFormState {
  return {
    date: visit.date,
    type: visit.type,
    heightM: str(visit.heightM),
    weightKg: str(visit.weightKg),
    smokingStatus: visit.smokingStatus ?? "Never",
    smokingYears: str(visit.smokingYears),
    smokingType: visit.smokingType ?? "",
    packYears: str(visit.packYears),
    yearsSinceQuitting: str(visit.yearsSinceQuitting),
    tobaccoChewingStatus: visit.tobaccoChewingStatus ?? "Never",
    tobaccoIntakesPerDay: str(visit.tobaccoIntakesPerDay),
    tobaccoYears: str(visit.tobaccoYears),
    alcoholStatus: visit.alcoholStatus ?? "Never",
    alcoholGPerDay: str(visit.alcoholGPerDay),
    alcoholGPerWeek: str(visit.alcoholGPerWeek),
    comorbidIllnesses: visit.comorbidIllnesses ?? "",
    ocpUse: visit.ocpUse ?? "Never",
    nsaidUse: visit.nsaidUse ?? "Never taken",
    nsaidFrequency: visit.nsaidFrequency ?? "",
    appendectomyHistory: visit.appendectomyHistory ?? "No",
    ageAtAppendectomyYears: str(visit.ageAtAppendectomyYears),
    onsetAppendectomyIntervalMonths: str(
      visit.onsetAppendectomyIntervalMonths,
    ),
    otherRiskFactors: visit.otherRiskFactors ?? "",
    generalSurvey: visit.generalSurvey ?? "",
    anemia: visit.anemia ?? "",
    oedema: visit.oedema ?? "",
    jaundice: visit.jaundice ?? "",
    peripheralLymphNodes: visit.peripheralLymphNodes ?? "",
    skinRash: visit.skinRash ?? "",
    otherPositiveFindings: visit.otherPositiveFindings ?? "",
    abdominalExamination: visit.abdominalExamination ?? "",
    otherSystemExamination: visit.otherSystemExamination ?? "",
    mayoStoolFrequency: str(visit.mayoStoolFrequency),
    mayoRectalBleeding: str(visit.mayoRectalBleeding),
    mayoEndoscopicFindings: str(visit.mayoEndoscopicFindings),
    mayoPhysicianGlobalAssessment: str(visit.mayoPhysicianGlobalAssessment),
    clinicalState: visit.clinicalState ?? "Remission",
    complication: visit.complication ?? "",
    newEim: visit.newEim ?? "",
    uceis: str(visit.uceis),
    admission: visit.admission ?? "No",
    specialComment: visit.specialComment ?? "",
    montrealExtent: visit.montrealExtent ?? "E2",
    montrealSeverity: visit.montrealSeverity ?? "S0",
    diagnosisDate: visit.diagnosisDate ?? patient?.diagnosisDate ?? "",
    ageAtSymptomOnsetYears: str(
      visit.ageAtSymptomOnsetYears ?? patient?.ageAtSymptomOnsetYears,
    ),
    illnessDurationMonths: str(
      visit.illnessDurationMonths ?? patient?.illnessDurationMonths,
    ),
    symptomOnsetToDiagnosisIntervalMonths: str(
      visit.symptomOnsetToDiagnosisIntervalMonths ??
        patient?.symptomOnsetToDiagnosisIntervalMonths,
    ),
    diseaseExtent: visit.diseaseExtent ?? patient?.diseaseExtent ?? "Left-sided colitis",
    severity: visit.severity ?? patient?.severity ?? "Moderate",
    familyHistory:
      visit.familyHistory !== undefined
        ? visit.familyHistory
          ? "Yes"
          : "No"
        : patient?.familyHistory
          ? "Yes"
          : "No",
    diseaseStatus: visit.diseaseStatus ?? patient?.status ?? "Active disease",
    clinicalNotes: visit.clinicalNotes ?? patient?.notes ?? "",
  };
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
  mayoStoolFrequency: string;
  mayoRectalBleeding: string;
  mayoEndoscopicFindings: string;
  mayoPhysicianGlobalAssessment: string;
  clinicalState: string;
  complication: string;
  newEim: string;
  uceis: string;
  admission: string;
  specialComment: string;
  montrealExtent: string;
  montrealSeverity: string;
  diagnosisDate: string;
  ageAtSymptomOnsetYears: string;
  illnessDurationMonths: string;
  symptomOnsetToDiagnosisIntervalMonths: string;
  diseaseExtent: string;
  severity: string;
  familyHistory: string;
  diseaseStatus: string;
  clinicalNotes: string;
};

function diseaseDefaults(patient?: Patient | null) {
  return {
    diagnosisDate: patient?.diagnosisDate ?? "",
    ageAtSymptomOnsetYears: str(patient?.ageAtSymptomOnsetYears),
    illnessDurationMonths: str(patient?.illnessDurationMonths),
    symptomOnsetToDiagnosisIntervalMonths: str(
      patient?.symptomOnsetToDiagnosisIntervalMonths,
    ),
    diseaseExtent: patient?.diseaseExtent ?? "Left-sided colitis",
    severity: patient?.severity ?? "Moderate",
    familyHistory: patient?.familyHistory ? "Yes" : "No",
    diseaseStatus: patient?.status ?? "Active disease",
    clinicalNotes: patient?.notes ?? "",
  };
}

export function buildVisitFormState(
  visitCount: number,
  lastVisit: Visit | null,
  patient?: Patient | null,
  today = "2026-09-07",
): VisitFormState {
  const disease = diseaseDefaults(patient);
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
    mayoStoolFrequency: "",
    mayoRectalBleeding: "",
    mayoEndoscopicFindings: "",
    mayoPhysicianGlobalAssessment: "",
    clinicalState: "Remission",
    complication: "",
    newEim: "",
    uceis: "",
    admission: "No",
    specialComment: "",
    montrealExtent: "E2",
    montrealSeverity: "S0",
    ...disease,
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
    clinicalState: lastVisit.clinicalState ?? base.clinicalState,
    montrealExtent: lastVisit.montrealExtent ?? base.montrealExtent,
    montrealSeverity: lastVisit.montrealSeverity ?? base.montrealSeverity,
    diagnosisDate: lastVisit.diagnosisDate ?? disease.diagnosisDate,
    ageAtSymptomOnsetYears: str(
      lastVisit.ageAtSymptomOnsetYears ?? patient?.ageAtSymptomOnsetYears,
    ),
    illnessDurationMonths: str(
      lastVisit.illnessDurationMonths ?? patient?.illnessDurationMonths,
    ),
    symptomOnsetToDiagnosisIntervalMonths: str(
      lastVisit.symptomOnsetToDiagnosisIntervalMonths ??
        patient?.symptomOnsetToDiagnosisIntervalMonths,
    ),
    diseaseExtent: lastVisit.diseaseExtent ?? disease.diseaseExtent,
    severity: lastVisit.severity ?? disease.severity,
    familyHistory:
      lastVisit.familyHistory !== undefined
        ? lastVisit.familyHistory
          ? "Yes"
          : "No"
        : disease.familyHistory,
    diseaseStatus: lastVisit.diseaseStatus ?? disease.diseaseStatus,
    clinicalNotes: lastVisit.clinicalNotes ?? disease.clinicalNotes,
  };
}

export function ageAtDiagnosisYears(diagnosisDate: string, dateOfBirth: string) {
  if (!diagnosisDate || !dateOfBirth) return 0;
  return Math.max(
    0,
    new Date(diagnosisDate).getFullYear() - new Date(dateOfBirth).getFullYear(),
  );
}

export function diseaseDurationYears(diagnosisDate: string, today = new Date()) {
  if (!diagnosisDate) return 0;
  return Math.max(0, today.getFullYear() - new Date(diagnosisDate).getFullYear());
}

export function applyVisitDiseaseToPatient(patient: Patient, visit: Visit): Patient {
  if (!visit.diagnosisDate) return patient;
  const smokingOptions = ["Never", "Ex-smoker", "Current"] as const;
  const smokingStatus = smokingOptions.includes(
    visit.smokingStatus as (typeof smokingOptions)[number],
  )
    ? (visit.smokingStatus as Patient["smokingStatus"])
    : patient.smokingStatus;
  return {
    ...patient,
    diagnosisDate: visit.diagnosisDate,
    ageAtDiagnosis: ageAtDiagnosisYears(visit.diagnosisDate, patient.dateOfBirth),
    diseaseDurationYears: diseaseDurationYears(visit.diagnosisDate),
    ageAtSymptomOnsetYears: visit.ageAtSymptomOnsetYears,
    illnessDurationMonths: visit.illnessDurationMonths,
    symptomOnsetToDiagnosisIntervalMonths:
      visit.symptomOnsetToDiagnosisIntervalMonths,
    diseaseExtent: visit.diseaseExtent ?? patient.diseaseExtent,
    severity: visit.severity ?? patient.severity,
    familyHistory: visit.familyHistory ?? patient.familyHistory,
    status: visit.diseaseStatus ?? patient.status,
    notes: visit.clinicalNotes ?? patient.notes,
    smokingStatus,
    comorbidities: visit.comorbidIllnesses
      ? visit.comorbidIllnesses
          .split(/[;,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : patient.comorbidities,
  };
}

export function mayoScoresFromVisitForm(form: VisitFormState) {
  return computeMayoScores({
    stoolFrequency: parseMayoComponent(form.mayoStoolFrequency),
    rectalBleeding: parseMayoComponent(form.mayoRectalBleeding),
    endoscopicFindings: parseMayoComponent(form.mayoEndoscopicFindings),
    physicianGlobal: parseMayoComponent(form.mayoPhysicianGlobalAssessment),
  });
}

export function visitFormToRecord(
  form: VisitFormState,
  visitId: string,
  patientId: string,
): Visit {
  const num = (value: string) => (value === "" ? undefined : Number(value));
  const heightM = Number(form.heightM);
  const weightKg = Number(form.weightKg);
  const mayo = mayoScoresFromVisitForm(form);
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
    mayoStoolFrequency: num(form.mayoStoolFrequency),
    mayoRectalBleeding: num(form.mayoRectalBleeding),
    mayoEndoscopicFindings: num(form.mayoEndoscopicFindings),
    mayoPhysicianGlobalAssessment: num(form.mayoPhysicianGlobalAssessment),
    partialMayoScore: mayo.partialMayoScore,
    completeMayoScore: mayo.completeMayoScore,
    clinicalState: form.clinicalState,
    complication: form.complication || undefined,
    newEim: form.newEim || undefined,
    uceis: num(form.uceis),
    mayoEndoscopicScore: mayo.mayoEndoscopicScore,
    admission: form.admission,
    specialComment: form.specialComment || undefined,
    montrealExtent: form.montrealExtent,
    montrealSeverity: form.montrealSeverity,
    diagnosisDate: form.diagnosisDate || undefined,
    ageAtSymptomOnsetYears: num(form.ageAtSymptomOnsetYears),
    illnessDurationMonths: num(form.illnessDurationMonths),
    symptomOnsetToDiagnosisIntervalMonths: num(
      form.symptomOnsetToDiagnosisIntervalMonths,
    ),
    diseaseExtent: (form.diseaseExtent || undefined) as Visit["diseaseExtent"],
    severity: (form.severity || undefined) as Visit["severity"],
    familyHistory: form.familyHistory === "Yes",
    diseaseStatus: (form.diseaseStatus || undefined) as Visit["diseaseStatus"],
    clinicalNotes: form.clinicalNotes || undefined,
  };
}
