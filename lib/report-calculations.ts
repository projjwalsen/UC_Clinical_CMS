export function calculateRate<T>(
  records: T[],
  isNumerator: (record: T) => boolean,
  isEligible: (record: T) => boolean,
) {
  const eligibleRecords = records.filter(isEligible);
  const numerator = eligibleRecords.filter(isNumerator).length;

  return {
    numerator,
    denominator: eligibleRecords.length,
    percentage:
      eligibleRecords.length > 0
        ? Number(((numerator / eligibleRecords.length) * 100).toFixed(1))
        : null,
  };
}

export function calculateAgeGroup(ageAtDiagnosis?: number) {
  if (ageAtDiagnosis === undefined) {
    return {
      code: null as number | null,
      label: "Not recorded",
    };
  }

  if (ageAtDiagnosis < 17) {
    return {
      code: 1,
      label: "Under 17 years",
    };
  }

  if (ageAtDiagnosis <= 40) {
    return {
      code: 2,
      label: "17–40 years",
    };
  }

  return {
    code: 3,
    label: "Over 40 years",
  };
}

export function calculateDlqiChange(
  dlqiAtPresentation?: number,
  dlqiAtFollowUp?: number,
) {
  if (
    dlqiAtPresentation === undefined ||
    dlqiAtFollowUp === undefined
  ) {
    return null;
  }
  return dlqiAtPresentation - dlqiAtFollowUp;
}

export function formatDurationMonths(months?: number) {
  if (months === undefined) return "Not recorded";
  const years = (months / 12).toFixed(1);
  return `${months} months (${years} years)`;
}

export function meanAge(records: { age?: number }[]) {
  const values = records
    .map((r) => r.age)
    .filter((a): a is number => a !== undefined && a >= 0 && a <= 120);
  if (!values.length) return null;
  return Number(
    (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1),
  );
}

export function dataCompletenessScore(
  record: Record<string, unknown>,
  requiredKeys: string[],
) {
  const filled = requiredKeys.filter((key) => {
    const value = record[key];
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;
  return requiredKeys.length
    ? Number(((filled / requiredKeys.length) * 100).toFixed(0))
    : 0;
}
