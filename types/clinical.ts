export type Gender = "Male" | "Female" | "Other";
export type Severity = "Mild" | "Moderate" | "Severe";
export type ClinicalStatus =
  "Remission" | "Active disease" | "Relapse" | "Post-surgery";

export interface Patient {
  id: string;
  /** Unique research identifier linked to clinical dataset report rows */
  ibdCode?: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  registrationDate: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  policeStation?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  religion: string;
  maritalStatus: string;
  children: number;
  occupation: string;
  education: string;
  diet: string;
  monthlyFamilyIncome?: string;
  kuppuswamyScore?: number;
  socioeconomicCategory: string;
  diagnosisDate: string;
  ageAtDiagnosis: number;
  diseaseDurationYears: number;
  diseaseExtent: "Proctitis" | "Left-sided colitis" | "Pancolitis";
  severity: Severity;
  familyHistory: boolean;
  smokingStatus: "Never" | "Ex-smoker" | "Current";
  status: ClinicalStatus;
  comorbidities: string[];
  notes: string;
  lastVisit: string;
  followUpStatus: "Complete" | "Due soon" | "Overdue";
  archived?: boolean;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  type: string;
  heightM?: number;
  weightKg?: number;
  bmi?: number;
  smokingStatus?: string;
  smokingYears?: number;
  smokingType?: string;
  packYears?: number;
  yearsSinceQuitting?: number;
  tobaccoChewingStatus?: string;
  tobaccoIntakesPerDay?: number;
  tobaccoYears?: number;
  alcoholStatus?: string;
  alcoholGPerDay?: number;
  alcoholGPerWeek?: number;
  comorbidIllnesses?: string;
  ocpUse?: string;
  nsaidUse?: string;
  nsaidFrequency?: string;
  appendectomyHistory?: string;
  ageAtAppendectomyYears?: number;
  onsetAppendectomyIntervalMonths?: number;
  otherRiskFactors?: string;
  generalSurvey?: string;
  anemia?: string;
  oedema?: string;
  jaundice?: string;
  peripheralLymphNodes?: string;
  skinRash?: string;
  otherPositiveFindings?: string;
  abdominalExamination?: string;
  otherSystemExamination?: string;
  partialMayoScore?: number;
  completeMayoScore?: number;
  clinicalState?: string;
  complication?: string;
  newEim?: string;
  uceis?: number;
  mayoEndoscopicScore?: number;
  admission?: string;
  specialComment?: string;
  montrealExtent?: string;
  montrealSeverity?: string;
}
export interface SymptomRecord {
  id: string;
  patientId: string;
  visitId?: string;
  date: string;
  symptom: string;
  present: string;
  durationMonths?: number;
  weightLostKg?: number;
  presentWeightKg?: number;
  remarks?: string;
}
export interface EIMRecord {
  id: string;
  patientId: string;
  visitId?: string;
  date: string;
  manifestation: string;
  present: string;
  afterIbdOnset?: string;
  veinThrombosed?: string;
  remarks?: string;
}
export interface LaboratoryResult {
  id: string;
  patientId: string;
  visitId?: string;
  date: string;
  category: string;
  testName: string;
  resultNumeric?: number;
  resultText?: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlag?: string;
  cmvMethod?: string;
  remarks?: string;
  /** @deprecated use resultNumeric */
  value?: number;
  /** @deprecated use abnormalFlag */
  flag?: "Normal" | "Low" | "High";
}
export interface MedicationRecord {
  id: string;
  patientId: string;
  visitId: string;
  drugName: string;
  dose?: string;
  route?: string;
  startDate: string;
  endDate?: string;
  status: "Current" | "Completed" | "Stopped";
  indication?: string;
  adherenceNotes?: string;
  remarks?: string;
  /** @deprecated use remarks */
  response?: string;
}
export interface EndoscopyRecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  findings?: string;
  baronScore?: number;
  mayoEndoscopicScore?: number;
  uceis?: number;
  diseaseExtent?: string;
  remarks?: string;
  /** @deprecated use mayoEndoscopicScore */
  mayoScore?: number;
}
export interface HistopathologyRecord {
  id: string;
  patientId: string;
  visitId?: string;
  date: string;
  section: string;
  parameter: string;
  present?: string;
  scoreGrade?: string;
  histopathologyScore?: number;
  remarks?: string;
  /** @deprecated use present string */
  presentLegacy?: boolean;
  /** @deprecated use histopathologyScore */
  score?: number;
}
export interface ImagingRecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  investigationType: string;
  findings?: string;
  impression?: string;
  remarks?: string;
}
export interface PregnancyRecord {
  id: string;
  patientId: string;
  pregnancyNumber?: number;
  pregnancyYear?: number;
  pregnancyMonth?: number;
  durationWeeks?: number;
  activityAtConception?: string;
  courseDuringPregnancy?: string;
  newUcComplication?: string;
  pregnancyOutcome?: string;
  prematureDelivery?: string;
  forcepsDelivery?: string;
  maternalLowBirthWeightFlag?: string;
  maternalSgaFlag?: string;
  courseAfterYear1?: string;
  courseAfterYear2?: string;
  infantBirthYear?: number;
  infantBirthWeightKg?: number;
  congenitalMalformation?: string;
  infantLowBirthWeight?: string;
  infantSga?: string;
  remarks?: string;
  /** @deprecated use pregnancyYear */
  year?: number;
  /** @deprecated use pregnancyOutcome */
  outcome?: string;
  /** @deprecated use remarks */
  notes?: string;
}
export interface OffspringRecord {
  id: string;
  patientId: string;
  anyInfertility?: string;
  infertilityPeriodMonths?: number;
  totalOffspring?: number;
  offspringSinceIbdOnset?: number;
  remarks?: string;
  /** @deprecated legacy per-child fields */
  birthYear?: number;
  birthWeightKg?: number;
  outcome?: string;
  congenitalMalformation?: boolean;
}
export interface RelapseRecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  relapseCause?: string;
  causeOther?: string;
  admission?: string;
  steroid?: string;
  oralSteroid?: string;
  ivSteroid?: string;
  infection?: string;
  infectionType?: string;
  rescueTherapy?: string;
  rescueTherapyType?: string;
  rescueTherapyFailure?: string;
  rescueOutcome?: string;
  admissionDurationDays?: number;
  colectomy?: string;
  anticoagulation?: string;
  death?: string;
  remarks?: string;
  /** @deprecated use relapseCause */
  cause?: string;
  /** @deprecated use rescueOutcome */
  outcome?: string;
}
export interface SurgeryRecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  stage: string;
  indication: string;
  hospitalStayDays: number;
  outcome: string;
}
export interface IPAARecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  pouchType?: string;
  daytimeContinence?: string;
  stoolFrequencyDay?: number;
  stoolFrequencyNight?: number;
  totalStoolFrequency?: number;
  nighttimeContinence?: string;
  bloodInStool?: string;
  incontinence?: string;
  stoolFlatusDistinction?: string;
  antimotilityAgents?: string;
  treatment?: string;
  remarks?: string;
  /** @deprecated use incontinence */
  continence?: string;
}
export interface PouchoscopyRecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  cuffFindings?: string;
  bodyFinding?: string;
  inletFindings?: string;
  tipOfPouchFindings?: string;
  prePouchIleumFindings?: string;
  diagnosis?: string;
  acuteInflammation?: string;
  chronicInflammation?: string;
  scoreType?: string;
  scoreValue?: number;
  inference?: string;
  remarks?: string;
  /** @deprecated use scoreValue */
  score?: number;
}
export interface OutcomeRecord {
  id: string;
  patientId: string;
  visitId: string;
  date: string;
  outcome: ClinicalStatus;
  qualityOfLifeScore: number;
  notes: string;
}

export interface ClinicalRecords {
  visits: Visit[];
  symptoms: SymptomRecord[];
  eims: EIMRecord[];
  labs: LaboratoryResult[];
  medications: MedicationRecord[];
  endoscopies: EndoscopyRecord[];
  histopathology: HistopathologyRecord[];
  imaging: ImagingRecord[];
  pregnancies: PregnancyRecord[];
  offspring: OffspringRecord[];
  relapses: RelapseRecord[];
  surgeries: SurgeryRecord[];
  ipaa: IPAARecord[];
  pouchoscopies: PouchoscopyRecord[];
  outcomes: OutcomeRecord[];
}

export interface ReportConfiguration {
  id: string;
  name: string;
  description: string;
  period: string;
  filters: Record<string, string>;
  measures: string[];
  grouping: string;
  visualization:
    | "Summary cards"
    | "Table"
    | "Bar chart"
    | "Stacked bar chart"
    | "Line chart"
    | "Area chart"
    | "Donut chart";
  showLegend: boolean;
  showLabels: boolean;
  chartTitle: string;
  updatedAt: string;
}
