export type RobartsCriterionScore = 0 | 1 | 2 | 3;

export type RobartsCriterionOption = {
  score: RobartsCriterionScore;
  label: string;
};

export const ROBARTS_CHRONIC_INFLAMMATORY_INFILTRATE: RobartsCriterionOption[] =
  [
    { score: 0, label: "No increase" },
    { score: 1, label: "Mild but unequivocal increase" },
    { score: 2, label: "Moderate increase" },
    { score: 3, label: "Marked increase" },
  ];

export const ROBARTS_NEUTROPHILS_LAMINA_PROPRIA: RobartsCriterionOption[] = [
  { score: 0, label: "None" },
  { score: 1, label: "Mild but unequivocal increase" },
  { score: 2, label: "Moderate increase" },
  { score: 3, label: "Marked increase" },
];

export const ROBARTS_NEUTROPHILS_EPITHELIUM: RobartsCriterionOption[] = [
  { score: 0, label: "None" },
  { score: 1, label: "< 5% crypts involved" },
  { score: 2, label: "< 50% crypts involved" },
  { score: 3, label: "> 50% crypts involved" },
];

export type RobartsErosionValue =
  | "0"
  | "1-recovering"
  | "1-probable"
  | "2"
  | "3";

export const ROBARTS_EROSION_ULCERATION: {
  value: RobartsErosionValue;
  score: RobartsCriterionScore;
  label: string;
}[] = [
  {
    value: "0",
    score: 0,
    label: "No erosion, ulceration or granulation tissue",
  },
  {
    value: "1-recovering",
    score: 1,
    label: "Recovering epithelium + adjacent inflammation",
  },
  {
    value: "1-probable",
    score: 1,
    label: "Probable erosion (focally stripped)",
  },
  { value: "2", score: 2, label: "Unequivocal erosion" },
  { value: "3", score: 3, label: "Ulcer or granulation tissue" },
];

export type RobartsComponents = {
  chronicInflammatoryInfiltrate?: RobartsCriterionScore;
  neutrophilsLaminaPropria?: RobartsCriterionScore;
  neutrophilsEpithelium?: RobartsCriterionScore;
  erosionUlceration?: RobartsCriterionScore;
};

export function parseRobartsCriterion(
  value: string,
): RobartsCriterionScore | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  if (n >= 0 && n <= 3) return n as RobartsCriterionScore;
  return undefined;
}

export function parseRobartsErosion(value: string): RobartsCriterionScore | undefined {
  const match = ROBARTS_EROSION_ULCERATION.find((option) => option.value === value);
  return match?.score;
}

export function computeRobartsHistopathologyScore(components: RobartsComponents) {
  const {
    chronicInflammatoryInfiltrate,
    neutrophilsLaminaPropria,
    neutrophilsEpithelium,
    erosionUlceration,
  } = components;

  if (
    chronicInflammatoryInfiltrate === undefined ||
    neutrophilsLaminaPropria === undefined ||
    neutrophilsEpithelium === undefined ||
    erosionUlceration === undefined
  ) {
    return undefined;
  }

  return (
    chronicInflammatoryInfiltrate * 1 +
    neutrophilsLaminaPropria * 2 +
    neutrophilsEpithelium * 3 +
    erosionUlceration * 5
  );
}
