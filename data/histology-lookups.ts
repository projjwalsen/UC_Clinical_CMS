/** Section → parameter mapping from Histology_Section_Parameter_Mapping.xlsx */

export const HISTOLOGY_SECTIONS = [
  "Epithelial Surface",
  "Architectural Changes",
  "Lamina Propria",
  "Crypts",
  "Other",
] as const;

export const HISTOLOGY_PARAMETERS_BY_SECTION: Record<
  (typeof HISTOLOGY_SECTIONS)[number],
  readonly string[]
> = {
  "Epithelial Surface": ["Ulcer", "Erosions"],
  "Architectural Changes": [
    "Crypt Loss",
    "Crypt Branching",
    "Crypt Shortening",
    "Goblet Cell Depletion (>10%)",
  ],
  "Lamina Propria": [
    "Neutrophils",
    "Eosinophils",
    "Acute Inflammatory Cells",
    "Chronic Inflammatory Cells",
    "Both - Lamina Propria",
    "Other Cells",
    "Basal Plasmacytosis",
    "Granuloma",
  ],
  Crypts: ["Cryptitis", "Crypt Abscess", "Both - Crypts"],
  Other: ["Pyloric Gland Metaplasia", "Other"],
};

export function parametersForSection(section: string) {
  return (
    HISTOLOGY_PARAMETERS_BY_SECTION[
      section as (typeof HISTOLOGY_SECTIONS)[number]
    ] ?? []
  );
}

export const ALL_HISTOLOGY_PARAMETERS = [
  ...new Set(
    HISTOLOGY_SECTIONS.flatMap(
      (section) => HISTOLOGY_PARAMETERS_BY_SECTION[section],
    ),
  ),
];
