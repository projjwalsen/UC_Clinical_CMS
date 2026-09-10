/** Excel-style table formatting: codes in cells, blank missing values. */

export function formatReportCell(
  value: string | number | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value);
}

export function formatCodes(codes?: number[]) {
  if (!codes || codes.length === 0) return "";
  return codes.join(",");
}

export function calculateAgeGroupCode(
  ageAtDiagnosis?: number | null,
): 1 | 2 | 3 | null {
  if (ageAtDiagnosis === undefined || ageAtDiagnosis === null) {
    return null;
  }
  if (ageAtDiagnosis < 17) return 1;
  if (ageAtDiagnosis <= 40) return 2;
  return 3;
}

export function formatComorbidityCodes(row: {
  comorbidities: Array<1 | 2 | 3>;
  hasNoComorbidity?: boolean;
}) {
  if (row.hasNoComorbidity) return "4";
  return formatCodes(row.comorbidities);
}

export function formatDlqiChangeCode(
  presentation?: number,
  followUp?: number,
) {
  if (presentation === undefined || followUp === undefined) return "";
  return String(presentation - followUp);
}

export function formatTextList(values: string[]) {
  if (!values.length) return "";
  return values.join(",");
}
