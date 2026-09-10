export const KUPPUSWAMY_EDUCATION = [
  { label: "Professional Degree", score: 7 },
  { label: "Graduate", score: 6 },
  { label: "Intermediate / Diploma", score: 5 },
  { label: "High School", score: 4 },
  { label: "Middle School", score: 3 },
  { label: "Primary School", score: 2 },
  { label: "Illiterate", score: 1 },
] as const;

export const KUPPUSWAMY_OCCUPATION = [
  { label: "Professional", score: 10 },
  { label: "Semi-Professional", score: 6 },
  { label: "Clerical / Shop / Farmer", score: 5 },
  { label: "Skilled Worker", score: 4 },
  { label: "Semi-Skilled Worker", score: 3 },
  { label: "Unskilled Worker", score: 2 },
  { label: "Unemployed", score: 1 },
] as const;

export const KUPPUSWAMY_INCOME = [
  { label: "≥ 1,85,895", score: 12 },
  { label: "92,951 – 1,85,894", score: 10 },
  { label: "69,535 – 92,950", score: 6 },
  { label: "46,475 – 69,534", score: 4 },
  { label: "27,883 – 46,474", score: 3 },
  { label: "9,308 – 27,882", score: 2 },
  { label: "≤ 9,307", score: 1 },
] as const;

export type KuppuswamyEducation = (typeof KUPPUSWAMY_EDUCATION)[number]["label"];
export type KuppuswamyOccupation = (typeof KUPPUSWAMY_OCCUPATION)[number]["label"];
export type KuppuswamyIncome = (typeof KUPPUSWAMY_INCOME)[number]["label"];

export function educationScore(label: string) {
  return KUPPUSWAMY_EDUCATION.find((e) => e.label === label)?.score ?? 0;
}

export function occupationScore(label: string) {
  return KUPPUSWAMY_OCCUPATION.find((e) => e.label === label)?.score ?? 0;
}

export function incomeScore(label: string) {
  return KUPPUSWAMY_INCOME.find((e) => e.label === label)?.score ?? 0;
}

export function socioeconomicClass(totalScore: number) {
  if (totalScore >= 26) return "Upper (I)";
  if (totalScore >= 16) return "Upper middle (II)";
  if (totalScore >= 11) return "Lower middle (III)";
  if (totalScore >= 5) return "Upper lower (IV)";
  return "Lower (V)";
}

export function calculateKuppuswamy(
  education: string,
  occupation: string,
  monthlyFamilyIncome: string,
) {
  const edu = educationScore(education);
  const occ = occupationScore(occupation);
  const inc = incomeScore(monthlyFamilyIncome);
  const totalScore = edu + occ + inc;
  return {
    educationScore: edu,
    occupationScore: occ,
    incomeScore: inc,
    totalScore,
    socioeconomicCategory: socioeconomicClass(totalScore),
  };
}
