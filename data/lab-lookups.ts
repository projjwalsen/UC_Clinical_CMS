/** Laboratory categories and tests (clinical grouping). */

export const LAB_CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Coagulation",
  "Infection",
  "Stool",
  "Other",
] as const;

export const ABNORMAL_FLAGS = [
  "Normal",
  "Low",
  "High",
  "Borderline",
  "Critical",
  "Not known",
] as const;

export const LAB_TESTS_BY_CATEGORY: Record<
  (typeof LAB_CATEGORIES)[number],
  readonly string[]
> = {
  Hematology: [
    "Hb",
    "TC",
    "DC",
    "Platelet Count",
    "MCV",
    "MCHC",
    "MCH",
    "Ferritin",
    "TIBC",
    "Transferrin Saturation",
    "Iron",
    "Folic Acid",
    "Vitamin B12",
    "Hepcidin",
  ],
  Biochemistry: [
    "CRP",
    "Urea",
    "Creatinine",
    "Total Bilirubin",
    "Conjugated Bilirubin",
    "Albumin",
    "Globulin",
    "SGPT (ALT)",
    "SGOT (AST)",
    "ALP",
    "GGT",
    "FPG",
    "PPPG",
    "HbA1c",
    "Sodium",
    "Potassium",
    "T3",
    "T4",
    "TSH",
  ],
  Coagulation: ["Prothrombin Time", "INR", "APTT"],
  Infection: ["HBsAg", "Anti-HCV", "HIV 1 & 2", "CMV positivity"],
  Stool: ["C. difficile toxin", "Fecal Calprotectin"],
  Other: ["Other"],
};

export const ALL_LAB_TESTS = [
  ...new Set(
    LAB_CATEGORIES.flatMap((category) => LAB_TESTS_BY_CATEGORY[category]),
  ),
];

export function testsForCategory(category: string) {
  return (
    LAB_TESTS_BY_CATEGORY[category as (typeof LAB_CATEGORIES)[number]] ?? []
  );
}
