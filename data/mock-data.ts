import type {
  ClinicalRecords,
  Patient,
  ReportConfiguration,
} from "@/types/clinical";
import { calculateKuppuswamy } from "@/lib/kuppuswamy";
import { calculateBmi } from "@/lib/visit-utils";
import {
  CLINICAL_STATE,
  DISEASE_EXTENT,
  MONTREAL_SEVERITY,
  SMOKING_STATUS,
  SYMPTOMS,
  EIM_MANIFESTATIONS,
  VISIT_TYPE,
  YES_NO,
} from "@/data/lookups";

const firstNames = [
  "Aarav",
  "Ananya",
  "Ishaan",
  "Meera",
  "Kabir",
  "Diya",
  "Rohan",
  "Saanvi",
  "Arjun",
  "Nisha",
  "Vivaan",
  "Priya",
  "Aditya",
  "Tara",
  "Neel",
  "Kavya",
  "Rahul",
  "Ira",
  "Dev",
  "Leela",
];
const lastNames = [
  "Bose",
  "Kapoor",
  "Mehta",
  "Sen",
  "Rao",
  "Nair",
  "Das",
  "Shah",
  "Iyer",
  "Gupta",
];
const cities = [
  "Kolkata",
  "Pune",
  "Mumbai",
  "Chennai",
  "Bengaluru",
  "Hyderabad",
  "Jaipur",
  "Kochi",
];
const states: Record<string, string> = {
  Kolkata: "West Bengal",
  Pune: "Maharashtra",
  Mumbai: "Maharashtra",
  Chennai: "Tamil Nadu",
  Bengaluru: "Karnataka",
  Hyderabad: "Telangana",
  Jaipur: "Rajasthan",
  Kochi: "Kerala",
};
const extents = ["Proctitis", "Left-sided colitis", "Pancolitis"] as const;
const severities = ["Mild", "Moderate", "Severe"] as const;
const statuses = [
  "Remission",
  "Active disease",
  "Relapse",
  "Post-surgery",
] as const;
const kuppuswamyEducations = [
  "Professional Degree",
  "Graduate",
  "Intermediate / Diploma",
  "High School",
  "Middle School",
] as const;
const kuppuswamyOccupations = [
  "Professional",
  "Semi-Professional",
  "Clerical / Shop / Farmer",
  "Skilled Worker",
  "Semi-Skilled Worker",
] as const;
const kuppuswamyIncomes = [
  "≥ 1,85,895",
  "92,951 – 1,85,894",
  "69,535 – 92,950",
  "46,475 – 69,534",
  "27,883 – 46,474",
  "9,308 – 27,882",
] as const;
const policeStations = [
  "Park Street PS",
  "Ballygunge PS",
  "T Nagar PS",
  "Andheri PS",
  "Koramangala PS",
  "Jubilee Hills PS",
  "Malviya Nagar PS",
  "Marine Drive PS",
];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthsAgo = (n: number) => iso(new Date(2026, 8 - n, 6 + (n % 18)));

export const seedPatients: Patient[] = Array.from({ length: 42 }, (_, i) => {
  const age = 18 + ((i * 7) % 55);
  const gender = i % 2 === 0 ? "Male" : "Female";
  const extent = extents[i % extents.length];
  const severity = severities[(i * 2) % severities.length];
  const status = statuses[i % statuses.length];
  const city = cities[i % cities.length];
  const registrationDate = monthsAgo(i % 18);
  const diagnosisYears = 1 + (i % 13);
  const education = kuppuswamyEducations[i % kuppuswamyEducations.length];
  const occupation = kuppuswamyOccupations[i % kuppuswamyOccupations.length];
  const monthlyFamilyIncome = kuppuswamyIncomes[i % kuppuswamyIncomes.length];
  const kuppuswamy = calculateKuppuswamy(education, occupation, monthlyFamilyIncome);
  return {
    id: `UC-${String(1101 + i).padStart(4, "0")}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
    dateOfBirth: `${2026 - age}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 25) + 1).padStart(2, "0")}`,
    age,
    gender,
    registrationDate,
    address: `${21 + i}, Lakeview Road`,
    city,
    state: states[city],
    pinCode: `${700001 + i}`,
    policeStation: policeStations[i % policeStations.length],
    phone: `90000${String(12000 + i)}`,
    alternatePhone: i % 4 ? undefined : `80000${String(21000 + i)}`,
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${i + 1}@example.test`,
    religion: ["Hindu", "Muslim", "Christian", "Other"][i % 4],
    maritalStatus: i % 3 ? "Married" : "Single",
    children: i % 3,
    occupation,
    education,
    diet: i % 3 ? "Non-vegetarian" : "Vegetarian",
    monthlyFamilyIncome,
    kuppuswamyScore: kuppuswamy.totalScore,
    socioeconomicCategory: kuppuswamy.socioeconomicCategory,
    diagnosisDate: `${2026 - diagnosisYears}-${String((i % 12) + 1).padStart(2, "0")}-15`,
    ageAtDiagnosis: age - diagnosisYears,
    diseaseDurationYears: diagnosisYears,
    diseaseExtent: extent,
    severity,
    familyHistory: i % 5 === 0,
    smokingStatus: ["Never", "Ex-smoker", "Current"][
      i % 3
    ] as Patient["smokingStatus"],
    status,
    comorbidities:
      i % 4 === 0 ? ["Hypertension"] : i % 7 === 0 ? ["Type 2 diabetes"] : [],
    notes: "Synthetic demonstration record created for prototype evaluation.",
    lastVisit: monthsAgo(i % 5),
    followUpStatus: ["Complete", "Due soon", "Overdue"][
      i % 3
    ] as Patient["followUpStatus"],
  };
});

const drugs = [
  "Mesalamine",
  "Azathioprine",
  "Infliximab",
  "Vedolizumab",
  "Tofacitinib",
];
export const seedRecords: ClinicalRecords = {
  visits: seedPatients.flatMap((p, i) =>
    Array.from({ length: 2 + (i % 3) }, (_, n) => {
      const heightM = 1.55 + (i % 20) / 100;
      const weightKg = 52 + (i % 28);
      return {
        id: `${p.id}-V${String(n + 1).padStart(2, "0")}`,
        patientId: p.id,
        date: monthsAgo(n * 3 + (i % 2)),
        type: VISIT_TYPE[Math.min(n, VISIT_TYPE.length - 1)],
        heightM,
        weightKg,
        bmi: calculateBmi(heightM, weightKg),
        smokingStatus: SMOKING_STATUS[i % SMOKING_STATUS.length],
        tobaccoChewingStatus: "Never",
        alcoholStatus: "Never",
        ocpUse: "Never",
        nsaidUse: i % 3 ? "Taken" : "Never taken",
        nsaidFrequency: i % 3 ? "Monthly" : undefined,
        appendectomyHistory: YES_NO[i % 3],
        partialMayoScore: p.status === "Remission" ? 1 : 3 + (i % 6),
        completeMayoScore: p.status === "Remission" ? 2 : 4 + (i % 6),
        clinicalState: CLINICAL_STATE[i % CLINICAL_STATE.length],
        admission: YES_NO[(i + n) % 3],
        montrealExtent: DISEASE_EXTENT[i % DISEASE_EXTENT.length],
        montrealSeverity: MONTREAL_SEVERITY[i % MONTREAL_SEVERITY.length],
        specialComment: n
          ? "Treatment reviewed; follow-up plan discussed."
          : "Baseline clinical assessment completed.",
      };
    }),
  ),
  symptoms: seedPatients.flatMap((p, i) => {
    const weightLostKg = i % 4 === 0 ? 2 + (i % 5) : undefined;
    const presentWeightKg = i % 4 === 0 ? 52 + (i % 10) : undefined;
    const remarks =
      i % 4 === 0 ? "Visit-level weight and clinical notes recorded." : undefined;
    return SYMPTOMS.map((symptom, n) => ({
      id: `SYM-${i}-${n}`,
      patientId: p.id,
      visitId: `${p.id}-V01`,
      date: p.lastVisit,
      symptom,
      present: (i + n) % 3 === 0 ? "Yes" : "No",
      durationMonths:
        (i + n) % 3 === 0 ? 1 + ((i + n) % 18) : undefined,
      weightLostKg,
      presentWeightKg,
      remarks,
    }));
  }),
  eims: seedPatients.flatMap((p, i) => {
    const veinThrombosed =
      i % 6 === 0 ? "Superficial femoral vein" : undefined;
    const remarks =
      i % 6 === 0 ? "Visit-level EIM assessment notes." : undefined;
    return EIM_MANIFESTATIONS.map((manifestation, n) => ({
      id: `EIM-${i}-${n}`,
      patientId: p.id,
      visitId: `${p.id}-V01`,
      date: p.lastVisit,
      manifestation,
      present: (i + n) % 4 === 0 ? "Yes" : "No",
      afterIbdOnset:
        (i + n) % 4 === 0 ? (n % 2 ? "Yes" : "No") : undefined,
      veinThrombosed,
      remarks,
    }));
  }),
  labs: seedPatients.flatMap((p, i) => [
    {
      id: `LAB-HB-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V01`,
      date: p.lastVisit,
      category: "Hematology",
      testName: "Hb",
      resultNumeric: 7.1 + (i % 6) * 0.3,
      unit: "g/dL",
      abnormalFlag: i % 4 === 0 ? "Low" : "Normal",
    },
    {
      id: `LAB-CRP-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V01`,
      date: p.lastVisit,
      category: "Biochemistry",
      testName: "CRP",
      resultNumeric: 2 + ((i * 3) % 28),
      unit: "mg/L",
      abnormalFlag: i % 3 === 0 ? "High" : "Normal",
    },
  ]),
  medications: seedPatients.flatMap((p, i) => [
    {
      id: `MED-${i}-1`,
      patientId: p.id,
      visitId: `${p.id}-V1`,
      drugName: drugs[i % drugs.length],
      dose: i % 2 ? "500 mg twice daily" : "1.2 g daily",
      route: i % 7 ? "Oral" : "IV",
      startDate: monthsAgo(6 + (i % 8)),
      status: "Current" as const,
      indication: "Ulcerative colitis maintenance",
      remarks:
        p.status === "Remission"
          ? "Good clinical response"
          : "Partial response",
    },
    ...(i % 3 === 0
      ? [
          {
            id: `MED-${i}-2`,
            patientId: p.id,
            visitId: `${p.id}-V1`,
            drugName: drugs[(i + 1) % drugs.length],
            dose: "As prescribed",
            route: "Oral" as const,
            startDate: monthsAgo(12),
            endDate: monthsAgo(3),
            status: "Completed" as const,
            adherenceNotes: "Completed course without interruption.",
          },
        ]
      : []),
  ]),
  endoscopies: seedPatients
    .filter((_, i) => i % 2 === 0)
    .map((p, i) => ({
      id: `END-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V1`,
      date: monthsAgo(4 + (i % 8)),
      findings:
        p.status === "Remission"
          ? "Mucosal healing; no active ulceration."
          : "Erythema and friability noted.",
      baronScore: i % 4,
      mayoEndoscopicScore: i % 4,
      uceis: i % 8,
      diseaseExtent: ["E1", "E2", "E3"][i % 3],
      remarks: i % 3 === 0 ? "Repeat in 6 months if symptoms persist." : undefined,
    })),
  histopathology: seedPatients
    .filter((_, i) => i % 3 === 0)
    .flatMap((p, i) => [
      {
        id: `HIST-${i}-1`,
        patientId: p.id,
        visitId: `${p.id}-V1`,
        date: monthsAgo(5),
        section: "Lamina Propria",
        parameter: "Chronic Inflammatory Cells",
        present: "Yes",
        scoreGrade: "Moderate",
        histopathologyScore: 2 + (i % 5),
        remarks: "No dysplasia identified.",
      },
      {
        id: `HIST-${i}-2`,
        patientId: p.id,
        visitId: `${p.id}-V1`,
        date: monthsAgo(5),
        section: "Crypts",
        parameter: "Cryptitis",
        present: i % 2 === 0 ? "Yes" : "No",
        scoreGrade: i % 2 === 0 ? "Mild" : undefined,
        remarks: "Reviewed by pathologist.",
      },
    ]),
  imaging: seedPatients
    .filter((_, i) => i % 4 === 0)
    .map((p, i) => ({
      id: `IMG-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V1`,
      date: monthsAgo(3),
      investigationType: "USG abdomen",
      findings: "No focal bowel complication.",
      impression: "No acute abnormality.",
      remarks: i % 2 === 0 ? "Repeat if symptoms worsen." : undefined,
    })),
  pregnancies: seedPatients
    .filter((p) => p.gender === "Female")
    .filter((_, i) => i % 5 === 1)
    .map((p, i) => ({
      id: `PREG-${i}`,
      patientId: p.id,
      pregnancyNumber: 1,
      pregnancyYear: 2022 + (i % 4),
      pregnancyMonth: 3 + (i % 6),
      durationWeeks: 38 + (i % 2),
      activityAtConception: "Remission",
      courseDuringPregnancy: "Remained in remission",
      newUcComplication: "No",
      pregnancyOutcome: "Normal delivery",
      prematureDelivery: "No",
      forcepsDelivery: "No",
      infantBirthYear: 2022 + (i % 4),
      infantBirthWeightKg: 2.8 + (i % 5) * 0.1,
      congenitalMalformation: "No",
      remarks: "Uneventful pregnancy course.",
    })),
  offspring: seedPatients.map((p, i) => ({
    id: `OFF-${i}`,
    patientId: p.id,
    anyInfertility: i % 3 === 0 ? "Yes" : "No",
    infertilityPeriodMonths: i % 3 === 0 ? 6 + (i % 12) : undefined,
    totalOffspring: 1 + (i % 3),
    offspringSinceIbdOnset: i % 2,
    remarks:
      p.gender === "Male"
        ? "Offspring summary recorded at follow-up."
        : "Includes offspring born before and after IBD diagnosis.",
  })),
  relapses: seedPatients
    .filter((_, i) => i % 4 === 2)
    .map((p, i) => ({
      id: `REL-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V2`,
      date: monthsAgo(i % 11),
      relapseCause: ["Non-compliance with drugs", "Spontaneous", "NSAID intake"][
        i % 3
      ],
      admission: i % 2 === 0 ? "Yes" : "No",
      steroid: "Yes",
      oralSteroid: i % 2 === 0 ? "Yes" : "No",
      ivSteroid: "No",
      infection: i % 3 === 0 ? "Yes" : "No",
      infectionType: i % 3 === 0 ? "C. difficile" : undefined,
      rescueTherapy: i % 3 === 0 ? "Yes" : "No",
      rescueTherapyType: i % 3 === 0 ? "Anti-TNF (IFX)" : undefined,
      rescueTherapyFailure: "No",
      rescueOutcome: i % 3 === 0 ? "Rescue success" : undefined,
      admissionDurationDays: i % 2 === 0 ? 5 + (i % 4) : undefined,
      colectomy: "No",
      anticoagulation: "No",
      death: "No",
      remarks: "Documented relapse event.",
    })),
  surgeries: seedPatients
    .filter((_, i) => i % 9 === 3)
    .map((p, i) => ({
      id: `SUR-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V2`,
      date: monthsAgo(10 + i),
      stage: "Subtotal colectomy and end ileostomy",
      indication: "Medical therapy failure",
      hospitalStayDays: 8 + i,
      outcome: "Recovered",
    })),
  ipaa: seedPatients
    .filter((_, i) => i % 6 === 4)
    .map((p, i) => ({
      id: `IPAA-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V2`,
      date: monthsAgo(2 + i),
      pouchType: ["J Pouch", "S Pouch", "W Pouch"][i % 3],
      daytimeContinence: "Mild",
      stoolFrequencyDay: 4 + (i % 3),
      stoolFrequencyNight: 1 + (i % 2),
      totalStoolFrequency: 5 + (i % 3),
      nighttimeContinence: "None",
      bloodInStool: "No",
      incontinence: "Mild",
      stoolFlatusDistinction: "Yes",
      antimotilityAgents: i % 2 === 0 ? "Yes" : "No",
      treatment: "Loperamide as needed",
      remarks: "Stable pouch function.",
    })),
  pouchoscopies: seedPatients
    .filter((_, i) => i % 7 === 5)
    .map((p, i) => ({
      id: `POUCH-${i}`,
      patientId: p.id,
      visitId: `${p.id}-V2`,
      date: monthsAgo(3 + i),
      cuffFindings: "Mild erythema at cuff",
      bodyFinding: i % 2 === 0 ? "Normal" : "Ulcer",
      inletFindings: "No significant abnormality",
      tipOfPouchFindings: "Healthy mucosa",
      prePouchIleumFindings: "Unremarkable",
      diagnosis: "Pouchitis",
      acuteInflammation: i % 2 === 0 ? "Yes" : "No",
      chronicInflammation: "Yes",
      scoreType: i % 2 === 0 ? "PDAI" : "PAS",
      scoreValue: 3 + (i % 4),
      inference: "Mild active inflammation",
      remarks: "Review in 8 weeks.",
    })),
  outcomes: seedPatients.map((p, i) => ({
    id: `OUT-${i}`,
    patientId: p.id,
    visitId: `${p.id}-V2`,
    date: p.lastVisit,
    outcome: p.status,
    qualityOfLifeScore: 58 + (i % 38),
    notes: "Synthetic follow-up outcome.",
  })),
};

export const registrationTrend = [
  ["Oct", 3],
  ["Nov", 4],
  ["Dec", 2],
  ["Jan", 5],
  ["Feb", 4],
  ["Mar", 6],
  ["Apr", 5],
  ["May", 7],
  ["Jun", 6],
  ["Jul", 8],
  ["Aug", 7],
  ["Sep", 9],
].map(([month, patients]) => ({ month, patients }));

export const savedReportSeeds: ReportConfiguration[] = [
  "Monthly Patient Registration",
  "Disease Severity Analysis",
  "Medication and Remission Report",
  "Relapse Trend Report",
  "Surgical Outcome Summary",
].map((name, i) => ({
  id: `REPORT-${i + 1}`,
  name,
  description: "Synthetic cohort summary for client demonstration.",
  period: "Last 12 months",
  filters: {},
  measures: ["Patient count", "Remission rate"],
  grouping: ["Month", "Disease severity", "Medication", "Month", "Outcome"][i],
  visualization: i % 2 ? "Donut chart" : "Bar chart",
  showLegend: true,
  showLabels: false,
  chartTitle: name,
  updatedAt: monthsAgo(i),
}));
