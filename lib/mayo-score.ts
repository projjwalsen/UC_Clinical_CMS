export type MayoCriterionScore = 0 | 1 | 2 | 3;

export type MayoCriterionOption = {
  score: MayoCriterionScore;
  label: string;
};

export const MAYO_STOOL_FREQUENCY: MayoCriterionOption[] = [
  { score: 0, label: "Normal number of stools for this patient" },
  { score: 1, label: "1 to 2 stools more than normal" },
  { score: 2, label: "3 to 4 stools more than normal" },
  { score: 3, label: "5 or more stools more than normal" },
];

export const MAYO_RECTAL_BLEEDING: MayoCriterionOption[] = [
  { score: 0, label: "No blood seen" },
  {
    score: 1,
    label: "Streaks of blood with stool less than half of the time",
  },
  { score: 2, label: "Obvious blood with stool most of the time" },
  { score: 3, label: "Blood alone passed" },
];

export const MAYO_ENDOSCOPIC_FINDINGS: MayoCriterionOption[] = [
  { score: 0, label: "Normal or inactive disease" },
  {
    score: 1,
    label:
      "Mild disease (erythema, decreased vascular pattern, mild friability)",
  },
  {
    score: 2,
    label:
      "Moderate disease (marked erythema, absent vascular pattern, friability, erosions)",
  },
  {
    score: 3,
    label: "Severe disease (spontaneous bleeding, ulceration)",
  },
];

export const MAYO_PHYSICIAN_GLOBAL: MayoCriterionOption[] = [
  { score: 0, label: "Normal" },
  { score: 1, label: "Mild disease" },
  { score: 2, label: "Moderate disease" },
  { score: 3, label: "Severe disease" },
];

export type MayoComponents = {
  stoolFrequency?: MayoCriterionScore;
  rectalBleeding?: MayoCriterionScore;
  endoscopicFindings?: MayoCriterionScore;
  physicianGlobal?: MayoCriterionScore;
};

export function parseMayoComponent(value: string): MayoCriterionScore | undefined {
  if (value === "" || value === undefined) return undefined;
  const n = Number(value);
  if (n >= 0 && n <= 3) return n as MayoCriterionScore;
  return undefined;
}

export function computeMayoScores(components: MayoComponents) {
  const { stoolFrequency, rectalBleeding, endoscopicFindings, physicianGlobal } =
    components;

  const partialMayoScore =
    stoolFrequency !== undefined &&
    rectalBleeding !== undefined &&
    physicianGlobal !== undefined
      ? stoolFrequency + rectalBleeding + physicianGlobal
      : undefined;

  const completeMayoScore =
    stoolFrequency !== undefined &&
    rectalBleeding !== undefined &&
    endoscopicFindings !== undefined &&
    physicianGlobal !== undefined
      ? stoolFrequency +
        rectalBleeding +
        endoscopicFindings +
        physicianGlobal
      : undefined;

  return {
    partialMayoScore,
    completeMayoScore,
    mayoEndoscopicScore: endoscopicFindings,
  };
}

export function partialMayoSeverity(score: number) {
  if (score <= 1) return "Remission";
  if (score <= 4) return "Mild disease";
  if (score <= 7) return "Moderate disease";
  return "Severe disease";
}

export function completeMayoSeverity(score: number) {
  if (score <= 2) return "Remission";
  if (score <= 5) return "Mild disease";
  if (score <= 10) return "Moderate disease";
  return "Severe disease";
}
