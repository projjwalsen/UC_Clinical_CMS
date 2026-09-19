export type UceisAnchorScore = 0 | 1 | 2 | 3;

export type UceisOption = {
  score: UceisAnchorScore;
  anchor: string;
  definition: string;
};

export const UCEIS_VASCULAR_PATTERN: UceisOption[] = [
  {
    score: 0,
    anchor: "normal",
    definition:
      "Normal vascular pattern with arborizations of capillaries clearly defined",
  },
  {
    score: 1,
    anchor: "patchy obliteration",
    definition: "Patchy obliteration of vascular pattern",
  },
  {
    score: 2,
    anchor: "obliterated",
    definition: "Complete loss of vascular pattern",
  },
];

export const UCEIS_BLEEDING: UceisOption[] = [
  { score: 0, anchor: "none", definition: "No visible blood" },
  {
    score: 1,
    anchor: "mucosal",
    definition:
      "Spots or streaks of coagulated blood on the mucosa surface, which can be washed off",
  },
  {
    score: 2,
    anchor: "luminal mild",
    definition: "Some free liquid blood in the lumen",
  },
  {
    score: 3,
    anchor: "luminal moderate or severe",
    definition:
      "Frank blood in the lumen or visible oozing from the mucosa after washing or visible oozing from a hemorrhagic mucosa",
  },
];

export const UCEIS_EROSIONS_ULCERS: UceisOption[] = [
  {
    score: 0,
    anchor: "none",
    definition: "Normal mucosa, no visible ulcers or erosions",
  },
  {
    score: 1,
    anchor: "erosions",
    definition:
      "Small defects in the mucosa (≤5 mm), white or yellow, flat edge",
  },
  {
    score: 2,
    anchor: "superficial ulcer",
    definition:
      "Larger defects in the mucosa (>5 mm), discrete fibrin covered, remain superficial",
  },
  {
    score: 3,
    anchor: "deep ulcer",
    definition:
      "Deeper excavated defects in the mucosa, with a slightly raised edge",
  },
];

export type UceisComponents = {
  vascularPattern?: 0 | 1 | 2;
  bleeding?: UceisAnchorScore;
  erosionsUlcers?: UceisAnchorScore;
};

export function parseUceisComponent(
  value: string,
  max: 2 | 3,
): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  if (n >= 0 && n <= max) return n;
  return undefined;
}

export function computeUceisScore(components: UceisComponents) {
  const { vascularPattern, bleeding, erosionsUlcers } = components;
  if (
    vascularPattern === undefined ||
    bleeding === undefined ||
    erosionsUlcers === undefined
  ) {
    return undefined;
  }
  return vascularPattern + bleeding + erosionsUlcers;
}
