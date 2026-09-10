/** Controlled lists from 15_Lookups in source.xlsx */

export const YES_NO = ["Yes", "No", "Not known"] as const;

export const VISIT_TYPE = [
  "Baseline",
  "Follow-up 1",
  "Follow-up 2",
  "Follow-up 3",
  "Additional follow-up",
] as const;

export const SMOKING_STATUS = ["No", "Never", "Ex-smoker", "Current"] as const;
export const SMOKING_TYPE = ["Cigarette", "Bidi", "Both", "Other"] as const;
export const TOBACCO_STATUS = ["Never", "Ex", "Current"] as const;
export const ALCOHOL_STATUS = ["Never", "Ex", "Current"] as const;
export const OCP_USE = [
  "Never",
  "<3 months total",
  "3-12 months",
  ">1 year",
  "Do not remember",
] as const;
export const NSAID_USE = [
  "Never taken",
  "Taken",
  "Do not know",
  "occasionally",
] as const;
export const NSAID_FREQUENCY = ["Daily", "Monthly", "Quarterly", "Yearly"] as const;
export const CLINICAL_STATE = ["Remission", "Active disease", "Relapse"] as const;
export const DISEASE_EXTENT = ["E1", "E2", "E3"] as const;
export const MONTREAL_SEVERITY = ["S0", "S1", "S2", "S3"] as const;

export const MEDICATION_ROUTES = ["Oral", "IV", "Subcutaneous", "Other"] as const;
export const MEDICATION_STATUS = ["Current", "Completed", "Stopped"] as const;

export const DISEASE_ACTIVITY = [
  "Remission",
  "Partially active",
  "Active",
] as const;

export const PREGNANCY_COURSE = [
  "Remained in remission",
  "Active at onset and remained active",
  "Remission at onset then became active",
  "Active at onset then entered remission",
] as const;

export const PREGNANCY_OUTCOME = [
  "Normal delivery",
  "LSCS",
  "Spontaneous abortion",
  "Induced abortion",
  "Stillbirth",
] as const;

export const RELAPSE_CAUSES = [
  "Non-compliance with drugs",
  "NSAID intake",
  "Antibiotic intake",
  "Stress induced",
  "Spontaneous",
  "Injection",
  "Other",
] as const;

export const INFECTION_TYPES = [
  "C. difficile",
  "CMV",
  "C. difficile & CMV",
  "Other",
] as const;

export const RESCUE_THERAPY_TYPES = [
  "Anti-TNF (IFX)",
  "Cyclosporine",
  "Tofacitinib",
  "Upadacitinib",
  "Other",
] as const;

export const RESCUE_OUTCOMES = [
  "Rescue success",
  "Discharge",
  "Colectomy",
  "Death",
] as const;

export const POUCH_TYPES = ["J Pouch", "S Pouch", "W Pouch", "Other"] as const;

export const INCONTINENCE_LEVELS = [
  "None",
  "Mild",
  "Moderate",
  "Severe",
] as const;

export const POUCH_BODY_FINDINGS = ["Normal", "Ulcer", "Other"] as const;

export const POUCH_SCORE_TYPES = ["PDAI", "PAS"] as const;

export const SYMPTOMS = [
  "Diarrhea",
  "Constipation",
  "Mucus in stool",
  "Tenesmus",
  "Urgency",
  "Weight loss",
  "Fever",
  "Loss of appetite",
  "Abdominal pain",
  "Melena",
  "Fistula",
  "Hematochezia",
  "Bleeding PR",
  "Other",
] as const;

export const CMV_METHODS = [
  "H&E stain",
  "Tissue PCR for CMV",
  "Serum PCR for CMV",
  "Tissue immunohistochemistry",
  "Other",
] as const;

export const EIM_MANIFESTATIONS = [
  "Erythema Nodosum",
  "Pyoderma Gangrenosum",
  "Psoriasis",
  "Oral Apthous Ulcers",
  "Isolated Sarcoilitis HLA B27",
  "Ankylosing Spondylitis HLA B27",
  "Arthalgias",
  "Type 1 Arthritis (Pauciarticular)",
  "Type 2 Arthritis (Polyarticiular > 5 Symmetirical)",
  "Gall Stone",
  "Autoimmune Hepatitis",
  "Pancreatitis",
  "Fatty Liver",
  "Renal Stones",
  "PSC",
  "Hepatic Steatosis",
  "Redness of Eyes: Episcleritis",
  "Redness of Eyes: Uveitis",
  "Redness of Eyes: Iritis",
  "Thrombotic Episodes",
  "Others",
] as const;
