/** Reference ranges from Lab_Test_Reference_Ranges_and_Flags.xlsx (Lab Test Master). */

export type LabTestReference = {
  category: string;
  resultType: "Numeric" | "Qualitative" | "Custom";
  referenceRange: string;
  unit: string;
  lowerLimit?: number;
  upperLimit?: number;
  normalText?: string;
  abnormalFlagRule?: string;
};

export const LAB_TEST_REFERENCES: Record<string, LabTestReference> = {
  Hb: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "13.5–17.5 (M); 12.0–15.5 (F)",
    unit: "g/dL",
    lowerLimit: 12,
    upperLimit: 17.5,
    abnormalFlagRule: "< lower = Low; > upper = High",
  },
  TC: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "4,000–11,000",
    unit: "cells/µL",
    lowerLimit: 4000,
    upperLimit: 11000,
    abnormalFlagRule: "<4000 = Low; >11000 = High",
  },
  DC: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange:
      "Neutrophils 40–70%; Lymphocytes 20–40%; Monocytes 2–8%; Eosinophils 1–6%; Basophils 0–1%",
    unit: "%",
    abnormalFlagRule: "Component-specific limits apply",
  },
  "Platelet Count": {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "150,000–450,000",
    unit: "/µL",
    lowerLimit: 150000,
    upperLimit: 450000,
    abnormalFlagRule: "<150000 = Low; >450000 = High",
  },
  MCV: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "80–100",
    unit: "fL",
    lowerLimit: 80,
    upperLimit: 100,
  },
  MCHC: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "32–36",
    unit: "g/dL",
    lowerLimit: 32,
    upperLimit: 36,
  },
  MCH: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "27–33",
    unit: "pg",
    lowerLimit: 27,
    upperLimit: 33,
  },
  Ferritin: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "30–400 (M); 13–150 (F)",
    unit: "ng/mL",
    lowerLimit: 13,
    upperLimit: 400,
  },
  TIBC: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "250–450",
    unit: "µg/dL",
    lowerLimit: 250,
    upperLimit: 450,
  },
  "Transferrin Saturation": {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "20–50",
    unit: "%",
    lowerLimit: 20,
    upperLimit: 50,
  },
  Iron: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "65–175 (M); 50–170 (F)",
    unit: "µg/dL",
    lowerLimit: 50,
    upperLimit: 175,
  },
  "Folic Acid": {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: ">4",
    unit: "ng/mL",
    lowerLimit: 4,
  },
  "Vitamin B12": {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "200–900",
    unit: "pg/mL",
    lowerLimit: 200,
    upperLimit: 900,
  },
  Hepcidin: {
    category: "Hematology",
    resultType: "Numeric",
    referenceRange: "Method dependent",
    unit: "ng/mL",
    abnormalFlagRule: "Use laboratory reference interval",
  },
  CRP: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "<5",
    unit: "mg/L",
    upperLimit: 5,
    abnormalFlagRule: "≥5 = High",
  },
  Urea: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "15–40",
    unit: "mg/dL",
    lowerLimit: 15,
    upperLimit: 40,
  },
  Creatinine: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "0.7–1.3 (M); 0.6–1.1 (F)",
    unit: "mg/dL",
    lowerLimit: 0.6,
    upperLimit: 1.3,
  },
  "Total Bilirubin": {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "0.3–1.2",
    unit: "mg/dL",
    lowerLimit: 0.3,
    upperLimit: 1.2,
  },
  "Conjugated Bilirubin": {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "0–0.3",
    unit: "mg/dL",
    lowerLimit: 0,
    upperLimit: 0.3,
  },
  Albumin: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "3.5–5.0",
    unit: "g/dL",
    lowerLimit: 3.5,
    upperLimit: 5,
  },
  Globulin: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "2.0–3.5",
    unit: "g/dL",
    lowerLimit: 2,
    upperLimit: 3.5,
  },
  "SGPT (ALT)": {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "7–56",
    unit: "U/L",
    lowerLimit: 7,
    upperLimit: 56,
  },
  "SGOT (AST)": {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "10–40",
    unit: "U/L",
    lowerLimit: 10,
    upperLimit: 40,
  },
  ALP: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "44–147",
    unit: "U/L",
    lowerLimit: 44,
    upperLimit: 147,
  },
  GGT: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "8–61 (M); 5–36 (F)",
    unit: "U/L",
    lowerLimit: 5,
    upperLimit: 61,
  },
  FPG: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "70–99",
    unit: "mg/dL",
    lowerLimit: 70,
    upperLimit: 99,
  },
  PPPG: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "<140",
    unit: "mg/dL",
    upperLimit: 140,
  },
  HbA1c: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "<5.7",
    unit: "%",
    upperLimit: 5.7,
  },
  Sodium: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "135–145",
    unit: "mmol/L",
    lowerLimit: 135,
    upperLimit: 145,
  },
  Potassium: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "3.5–5.0",
    unit: "mmol/L",
    lowerLimit: 3.5,
    upperLimit: 5,
  },
  T3: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "80–200",
    unit: "ng/dL",
    lowerLimit: 80,
    upperLimit: 200,
  },
  T4: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "5–12",
    unit: "µg/dL",
    lowerLimit: 5,
    upperLimit: 12,
  },
  TSH: {
    category: "Biochemistry",
    resultType: "Numeric",
    referenceRange: "0.4–4.0",
    unit: "mIU/L",
    lowerLimit: 0.4,
    upperLimit: 4,
  },
  "Prothrombin Time": {
    category: "Coagulation",
    resultType: "Numeric",
    referenceRange: "11–13.5",
    unit: "seconds",
    lowerLimit: 11,
    upperLimit: 13.5,
  },
  INR: {
    category: "Coagulation",
    resultType: "Numeric",
    referenceRange: "0.8–1.2",
    unit: "ratio",
    lowerLimit: 0.8,
    upperLimit: 1.2,
  },
  APTT: {
    category: "Coagulation",
    resultType: "Numeric",
    referenceRange: "25–35",
    unit: "seconds",
    lowerLimit: 25,
    upperLimit: 35,
  },
  HBsAg: {
    category: "Infection",
    resultType: "Qualitative",
    referenceRange: "Non-reactive",
    unit: "",
    normalText: "Non-reactive",
    abnormalFlagRule: "Reactive = Positive/Abnormal",
  },
  "Anti-HCV": {
    category: "Infection",
    resultType: "Qualitative",
    referenceRange: "Non-reactive",
    unit: "",
    normalText: "Non-reactive",
    abnormalFlagRule: "Reactive = Positive/Abnormal",
  },
  "HIV 1 & 2": {
    category: "Infection",
    resultType: "Qualitative",
    referenceRange: "Non-reactive",
    unit: "",
    normalText: "Non-reactive",
    abnormalFlagRule: "Reactive = Abnormal",
  },
  "CMV positivity": {
    category: "Infection",
    resultType: "Qualitative",
    referenceRange: "Not detected",
    unit: "",
    normalText: "Not detected",
    abnormalFlagRule: "Detected = Positive/Abnormal",
  },
  "C. difficile toxin": {
    category: "Stool",
    resultType: "Qualitative",
    referenceRange: "Negative",
    unit: "",
    normalText: "Negative",
    abnormalFlagRule: "Positive = Abnormal",
  },
  "Fecal Calprotectin": {
    category: "Stool",
    resultType: "Numeric",
    referenceRange: "<50 normal; 50–120 borderline; >120 abnormal",
    unit: "µg/g",
    upperLimit: 50,
    abnormalFlagRule: "<50 Normal; 50–120 Borderline; >120 High",
  },
  Other: {
    category: "Other",
    resultType: "Custom",
    referenceRange: "Lab / user defined",
    unit: "",
    abnormalFlagRule: "Custom rule",
  },
};

export function getLabTestReference(testName: string) {
  return LAB_TEST_REFERENCES[testName];
}

export function computeAbnormalFlag(testName: string, numericValue: number) {
  const ref = getLabTestReference(testName);
  if (!ref || ref.resultType !== "Numeric") return undefined;
  const { lowerLimit, upperLimit } = ref;

  if (testName === "Fecal Calprotectin") {
    if (numericValue < 50) return "Normal";
    if (numericValue <= 120) return "Borderline";
    return "High";
  }

  if (lowerLimit !== undefined && numericValue < lowerLimit) return "Low";
  if (upperLimit !== undefined && numericValue > upperLimit) return "High";
  if (lowerLimit !== undefined || upperLimit !== undefined) return "Normal";
  return undefined;
}
