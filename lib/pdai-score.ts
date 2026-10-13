export type PdaiOption = { id: string; label: string; score: number };

export const PDAI_STOOL_FREQUENCY: PdaiOption[] = [
  {
    id: "usual",
    label: "Usual postoperative stool frequency",
    score: 0,
  },
  {
    id: "1-2",
    label: "1–2 stools/day > postoperative usual",
    score: 1,
  },
  {
    id: "3+",
    label: "3 or more stools/day > postoperative usual",
    score: 2,
  },
];

export const PDAI_RECTAL_BLEEDING: PdaiOption[] = [
  { id: "none", label: "None or rare", score: 0 },
  { id: "daily", label: "Present daily", score: 1 },
];

export const PDAI_FECAL_URGENCY: PdaiOption[] = [
  { id: "none", label: "None", score: 0 },
  { id: "occasional", label: "Occasional", score: 1 },
  { id: "usual", label: "Usual", score: 2 },
];

export const PDAI_FEVER: PdaiOption[] = [
  { id: "absent", label: "Absent", score: 0 },
  { id: "present", label: "Present", score: 1 },
];

export const PDAI_ENDOSCOPIC_CRITERIA: { id: string; label: string }[] = [
  { id: "edema", label: "Edema" },
  { id: "granularity", label: "Granularity" },
  { id: "friability", label: "Friability" },
  { id: "lossOfVascularPattern", label: "Loss of vascular pattern" },
  { id: "mucusExudates", label: "Mucus exudates" },
  { id: "ulceration", label: "Ulceration" },
];

export const PDAI_POLYMORPH_INFILTRATION: PdaiOption[] = [
  { id: "mild", label: "Mild", score: 0 },
  { id: "moderate", label: "Moderate + crypt abscess", score: 1 },
  { id: "severe", label: "Severe + crypt abscess", score: 1 },
];

export const PDAI_ULCERATION_LPF: PdaiOption[] = [
  { id: "lt25", label: "< 25%", score: 1 },
  { id: "25-50", label: "≥25% ≤50%", score: 2 },
  { id: "gt50", label: "> 50%", score: 3 },
];

export const PDAI_POUCHITIS_THRESHOLD = 7;

export type PdaiScoreInput = {
  pdaiStoolFrequencyId: string;
  pdaiRectalBleedingId: string;
  pdaiFecalUrgencyId: string;
  pdaiFeverId: string;
  pdaiEndoscopic: Record<string, boolean>;
  pdaiPolymorphInfiltrationId: string;
  pdaiUlcerationLpfId: string;
};

function scoreFromOptions(options: PdaiOption[], id: string) {
  if (!id) return 0;
  return options.find((o) => o.id === id)?.score ?? 0;
}

export function computePdaiScore(input: PdaiScoreInput): number {
  let total = 0;
  total += scoreFromOptions(PDAI_STOOL_FREQUENCY, input.pdaiStoolFrequencyId);
  total += scoreFromOptions(PDAI_RECTAL_BLEEDING, input.pdaiRectalBleedingId);
  total += scoreFromOptions(PDAI_FECAL_URGENCY, input.pdaiFecalUrgencyId);
  total += scoreFromOptions(PDAI_FEVER, input.pdaiFeverId);
  for (const { id } of PDAI_ENDOSCOPIC_CRITERIA) {
    if (input.pdaiEndoscopic[id]) total += 1;
  }
  total += scoreFromOptions(
    PDAI_POLYMORPH_INFILTRATION,
    input.pdaiPolymorphInfiltrationId,
  );
  total += scoreFromOptions(PDAI_ULCERATION_LPF, input.pdaiUlcerationLpfId);
  return total;
}

export function pdaiInferenceFromScore(score: number): string {
  return score >= PDAI_POUCHITIS_THRESHOLD
    ? "Pouchitis (PDAI ≥7)"
    : "Below PDAI pouchitis threshold";
}

export function emptyPdaiEndoscopic(): Record<string, boolean> {
  return Object.fromEntries(
    PDAI_ENDOSCOPIC_CRITERIA.map(({ id }) => [id, false]),
  );
}
