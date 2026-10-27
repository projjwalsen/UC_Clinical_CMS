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
  EXTENT_AT_PRESENTATION,
  SEVERITY_AT_PRESENTATION,
  VISIT_TYPE,
  YES_NO,
} from "@/data/lookups";

/** 12 male and 8 female. Names, ages, and addresses are fixed so the demo cohort stays stable. */
const cohort = [
  { name: "Arindam Banerjee", gender: "Male" as const, age: 34, city: "Kolkata", locality: "Salt Lake, Sector V", pinCode: "700091", policeStation: "Bidhannagar PS", maritalStatus: "Married", children: 1, religion: "Hindu", occupationText: "Software engineer", diet: "Non-vegetarian", diagnosisYears: 6, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Active disease" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Soumya Chatterjee", gender: "Male" as const, age: 41, city: "Kolkata", locality: "Ballygunge Place", pinCode: "700019", policeStation: "Ballygunge PS", maritalStatus: "Married", children: 2, religion: "Hindu", occupationText: "Physician", diet: "Non-vegetarian", diagnosisYears: 9, extent: "Pancolitis" as const, severity: "Severe" as const, status: "Relapse" as const, smoking: "Ex-smoker" as const, familyHistory: true, comorbidities: [] as string[] },
  { name: "Debashish Mukherjee", gender: "Male" as const, age: 28, city: "Kolkata", locality: "Jadavpur", pinCode: "700032", policeStation: "Jadavpur PS", maritalStatus: "Single", children: 0, religion: "Hindu", occupationText: "School teacher", diet: "Non-vegetarian", diagnosisYears: 3, extent: "Proctitis" as const, severity: "Mild" as const, status: "Remission" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Anirban Ghosh", gender: "Male" as const, age: 52, city: "Howrah", locality: "Shibpur", pinCode: "711102", policeStation: "Shibpur PS", maritalStatus: "Married", children: 2, religion: "Hindu", occupationText: "Railway technician", diet: "Non-vegetarian", diagnosisYears: 14, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Post-surgery" as const, smoking: "Ex-smoker" as const, familyHistory: false, comorbidities: ["Hypertension"] },
  { name: "Imran Hossain", gender: "Male" as const, age: 23, city: "Kolkata", locality: "Dum Dum", pinCode: "700028", policeStation: "Dum Dum PS", maritalStatus: "Single", children: 0, religion: "Muslim", occupationText: "Accounts assistant", diet: "Non-vegetarian", diagnosisYears: 2, extent: "Pancolitis" as const, severity: "Severe" as const, status: "Active disease" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Rajib Roy", gender: "Male" as const, age: 47, city: "Kolkata", locality: "Behala", pinCode: "700034", policeStation: "Behala PS", maritalStatus: "Married", children: 1, religion: "Hindu", occupationText: "Bank officer", diet: "Non-vegetarian", diagnosisYears: 11, extent: "Left-sided colitis" as const, severity: "Mild" as const, status: "Remission" as const, smoking: "Current" as const, familyHistory: false, comorbidities: ["Type 2 diabetes"] },
  { name: "Subrata Sen", gender: "Male" as const, age: 61, city: "Kolkata", locality: "Shyambazar", pinCode: "700004", policeStation: "Shyampukur PS", maritalStatus: "Married", children: 3, religion: "Hindu", occupationText: "Shopkeeper", diet: "Non-vegetarian", diagnosisYears: 18, extent: "Pancolitis" as const, severity: "Moderate" as const, status: "Remission" as const, smoking: "Ex-smoker" as const, familyHistory: false, comorbidities: ["Hypertension"] },
  { name: "Partha Bose", gender: "Male" as const, age: 36, city: "Kolkata", locality: "Lake Town", pinCode: "700089", policeStation: "Lake Town PS", maritalStatus: "Married", children: 1, religion: "Hindu", occupationText: "Architect", diet: "Vegetarian", diagnosisYears: 4, extent: "Proctitis" as const, severity: "Mild" as const, status: "Active disease" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Amitava Dutta", gender: "Male" as const, age: 19, city: "Kolkata", locality: "New Town", pinCode: "700156", policeStation: "New Town PS", maritalStatus: "Single", children: 0, religion: "Hindu", occupationText: "College student", diet: "Non-vegetarian", diagnosisYears: 1, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Active disease" as const, smoking: "Never" as const, familyHistory: true, comorbidities: [] as string[] },
  { name: "Sourav Chakraborty", gender: "Male" as const, age: 44, city: "Barasat", locality: "Barasat", pinCode: "700124", policeStation: "Barasat PS", maritalStatus: "Married", children: 2, religion: "Hindu", occupationText: "Government clerk", diet: "Non-vegetarian", diagnosisYears: 8, extent: "Pancolitis" as const, severity: "Severe" as const, status: "Relapse" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Indranil Sarkar", gender: "Male" as const, age: 31, city: "Siliguri", locality: "Hakimpara", pinCode: "734001", policeStation: "Siliguri PS", maritalStatus: "Married", children: 0, religion: "Hindu", occupationText: "Electrician", diet: "Non-vegetarian", diagnosisYears: 5, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Remission" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Kaushik Pal", gender: "Male" as const, age: 56, city: "Durgapur", locality: "Benachity", pinCode: "713213", policeStation: "Durgapur PS", maritalStatus: "Married", children: 2, religion: "Hindu", occupationText: "Engineer", diet: "Non-vegetarian", diagnosisYears: 16, extent: "Pancolitis" as const, severity: "Moderate" as const, status: "Post-surgery" as const, smoking: "Ex-smoker" as const, familyHistory: false, comorbidities: ["Hypertension"] },
  { name: "Ananya Mondal", gender: "Female" as const, age: 29, city: "Asansol", locality: "Burnpur", pinCode: "713325", policeStation: "Asansol PS", maritalStatus: "Married", children: 1, religion: "Hindu", occupationText: "Nurse", diet: "Non-vegetarian", diagnosisYears: 5, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Remission" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Rituparna Bhattacharya", gender: "Female" as const, age: 38, city: "Kalyani", locality: "Kalyani", pinCode: "741235", policeStation: "Kalyani PS", maritalStatus: "Married", children: 2, religion: "Hindu", occupationText: "College lecturer", diet: "Vegetarian", diagnosisYears: 10, extent: "Pancolitis" as const, severity: "Severe" as const, status: "Active disease" as const, smoking: "Never" as const, familyHistory: true, comorbidities: [] as string[] },
  { name: "Nasima Khatun", gender: "Female" as const, age: 24, city: "Chandannagar", locality: "Chandannagar", pinCode: "712136", policeStation: "Chandannagar PS", maritalStatus: "Single", children: 0, religion: "Muslim", occupationText: "Content writer", diet: "Non-vegetarian", diagnosisYears: 2, extent: "Proctitis" as const, severity: "Mild" as const, status: "Remission" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Madhumita Basu", gender: "Female" as const, age: 45, city: "Kolkata", locality: "Park Circus", pinCode: "700017", policeStation: "Beniapukur PS", maritalStatus: "Married", children: 2, religion: "Hindu", occupationText: "Tailor", diet: "Non-vegetarian", diagnosisYears: 12, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Relapse" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Paromita Ganguly", gender: "Female" as const, age: 33, city: "Kolkata", locality: "Baguiati", pinCode: "700059", policeStation: "Baguiati PS", maritalStatus: "Married", children: 1, religion: "Hindu", occupationText: "Pharmacist", diet: "Non-vegetarian", diagnosisYears: 7, extent: "Pancolitis" as const, severity: "Mild" as const, status: "Remission" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Shreya Saha", gender: "Female" as const, age: 21, city: "Barrackpore", locality: "Barrackpore", pinCode: "700120", policeStation: "Barrackpore PS", maritalStatus: "Single", children: 0, religion: "Hindu", occupationText: "College student", diet: "Non-vegetarian", diagnosisYears: 1, extent: "Left-sided colitis" as const, severity: "Moderate" as const, status: "Active disease" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
  { name: "Aparna Kundu", gender: "Female" as const, age: 50, city: "Serampore", locality: "Serampore", pinCode: "712201", policeStation: "Serampore PS", maritalStatus: "Married", children: 3, religion: "Hindu", occupationText: "Homemaker", diet: "Non-vegetarian", diagnosisYears: 15, extent: "Pancolitis" as const, severity: "Severe" as const, status: "Post-surgery" as const, smoking: "Never" as const, familyHistory: false, comorbidities: ["Type 2 diabetes"] },
  { name: "Moumita Hazra", gender: "Female" as const, age: 27, city: "Kolkata", locality: "Garia", pinCode: "700084", policeStation: "Patuli PS", maritalStatus: "Married", children: 1, religion: "Hindu", occupationText: "School office staff", diet: "Vegetarian", diagnosisYears: 4, extent: "Proctitis" as const, severity: "Mild" as const, status: "Remission" as const, smoking: "Never" as const, familyHistory: false, comorbidities: [] as string[] },
];
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
const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthsAgo = (n: number) => iso(new Date(2026, 8 - n, 6 + (n % 18)));

export const seedPatients: Patient[] = cohort.map((person, i) => {
  const education = kuppuswamyEducations[i % kuppuswamyEducations.length];
  const occupation = kuppuswamyOccupations[i % kuppuswamyOccupations.length];
  const monthlyFamilyIncome = kuppuswamyIncomes[i % kuppuswamyIncomes.length];
  const kuppuswamy = calculateKuppuswamy(
    education,
    occupation,
    monthlyFamilyIncome,
  );
  const ageAtDiagnosis = person.age - person.diagnosisYears;
  const slug = person.name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: `UC-${String(1101 + i).padStart(4, "0")}`,
    ibdCode: `IBD-${String(i + 1).padStart(4, "0")}`,
    name: person.name,
    dateOfBirth: `${2026 - person.age}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    age: person.age,
    gender: person.gender,
    registrationDate: monthsAgo(8 + (i % 16)),
    address: `${12 + i * 3}, ${person.locality}`,
    city: person.city,
    state: "West Bengal",
    country: "India",
    pinCode: person.pinCode,
    policeStation: person.policeStation,
    phone: `98${String(31012000 + i * 137).slice(0, 8)}`,
    alternatePhone: i % 3 === 0 ? `90${String(51022000 + i * 91).slice(0, 8)}` : undefined,
    email: `${slug}@example.test`,
    religion: person.religion,
    maritalStatus: person.maritalStatus,
    children: person.children,
    occupationText: person.occupationText,
    occupation,
    education,
    diet: person.diet,
    monthlyFamilyIncome,
    kuppuswamyScore: kuppuswamy.totalScore,
    socioeconomicCategory: kuppuswamy.socioeconomicCategory,
    diagnosisDate: `${2026 - person.diagnosisYears}-${String((i % 12) + 1).padStart(2, "0")}-15`,
    ageAtDiagnosis,
    diseaseDurationYears: person.diagnosisYears,
    ageAtSymptomOnsetYears: Math.max(10, ageAtDiagnosis - (person.diagnosisYears > 2 ? 1 : 0)),
    illnessDurationMonths: person.diagnosisYears * 12 + 3 + (i % 5),
    symptomOnsetToDiagnosisIntervalMonths: 3 + (i % 16),
    diseaseExtent: person.extent,
    severity: person.severity,
    familyHistory: person.familyHistory,
    smokingStatus: person.smoking,
    status: person.status,
    comorbidities: person.comorbidities,
    notes: "Followed in the IBD clinic.",
    lastVisit: monthsAgo(i % 4),
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
      const heightM =
        p.gender === "Female" ? 1.48 + (i % 18) / 100 : 1.62 + (i % 20) / 100;
      const weightKg = p.gender === "Female" ? 46 + (i % 22) : 58 + (i % 28);
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
        diagnosisDate: p.diagnosisDate,
        ageAtSymptomOnsetYears: p.ageAtSymptomOnsetYears,
        illnessDurationMonths: p.illnessDurationMonths,
        symptomOnsetToDiagnosisIntervalMonths:
          p.symptomOnsetToDiagnosisIntervalMonths,
        diseaseExtent: p.diseaseExtent,
        severity: p.severity,
        familyHistory: p.familyHistory,
        diseaseStatus: p.status,
        clinicalNotes:
          n === 0 ? p.notes : "Disease information carried from baseline.",
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
      uceisVascularPattern: i % 3,
      uceisBleeding: (i + 1) % 4,
      uceisErosionsUlcers: (i + 2) % 4,
      uceis: (i % 3) + ((i + 1) % 4) + ((i + 2) % 4),
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
        robartsChronicInflammatoryInfiltrate: 1 + (i % 3),
        robartsNeutrophilsLaminaPropria: i % 3,
        robartsNeutrophilsEpithelium: 1,
        robartsErosionUlceration: i % 2,
        robartsErosionUlcerationCode: i % 2 === 0 ? "0" : "1-recovering",
        histopathologyScore:
          (1 + (i % 3)) * 1 + (i % 3) * 2 + 1 * 3 + (i % 2) * 5,
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
        robartsChronicInflammatoryInfiltrate: 1 + (i % 3),
        robartsNeutrophilsLaminaPropria: i % 3,
        robartsNeutrophilsEpithelium: 1,
        robartsErosionUlceration: i % 2,
        robartsErosionUlcerationCode: i % 2 === 0 ? "0" : "1-recovering",
        histopathologyScore:
          (1 + (i % 3)) * 1 + (i % 3) * 2 + 1 * 3 + (i % 2) * 5,
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
  pregnancies: seedPatients.flatMap((p, i) => {
    if (p.gender !== "Female" || p.children === 0) return [];
    const count = p.children;
    return Array.from({ length: count }, (_, n) => {
      const year = 2008 + ((i * 2 + n * 3) % 16);
      const premature = n === count - 1 && i % 5 === 0;
      return {
        id: `PREG-${p.id}-${n + 1}`,
        patientId: p.id,
        pregnancyNumber: n + 1,
        pregnancyYear: year,
        pregnancyMonth: 1 + ((i + n) % 12),
        durationWeeks: premature ? 34 : 38,
        activityAtConception: n % 2 ? "Partially active" : "Remission",
        courseDuringPregnancy: n % 2
          ? "Active at onset then entered remission"
          : "Remained in remission",
        newUcComplication: "No",
        pregnancyOutcome: i % 7 === 0 && n === 0 ? "LSCS" : "Normal delivery",
        prematureDelivery: premature ? "Yes" : "No",
        forcepsDelivery: "No",
        infantBirthYear: year,
        infantBirthWeightKg: premature ? 2.1 : 2.7 + ((i + n) % 4) * 0.15,
        congenitalMalformation: "No",
        infantLowBirthWeight: premature ? "Yes" : "No",
        remarks:
          n === 0
            ? "Antenatal IBD clinic follow-up."
            : "Later pregnancy, planned.",
      };
    });
  }),
  offspring: seedPatients.map((p, i) =>
    p.gender === "Female"
      ? {
          id: `OFF-${i}`,
          patientId: p.id,
          totalOffspring: p.children,
          offspringSinceIbdOnset: Math.min(
            p.children,
            p.diseaseDurationYears > 8 ? 1 : 0,
          ),
          numberOfPregnancies: p.children,
        }
      : {
          id: `OFF-${i}`,
          patientId: p.id,
          anyInfertility:
            p.children === 0 && p.maritalStatus === "Married" ? "Yes" : "No",
          infertilityPeriodMonths:
            p.children === 0 && p.maritalStatus === "Married" ? 14 : undefined,
          totalOffspring: p.children,
          offspringSinceIbdOnset: Math.min(p.children, 1),
        },
  ),
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
      daytimeContinence: "Yes",
      stoolFrequencyDay: 4 + (i % 3),
      stoolFrequencyNight: 1 + (i % 2),
      totalStoolFrequency: 5 + (i % 3),
      nighttimeContinence: "No",
      bloodInStool: "No",
      incontinence: "Mild",
      stoolFlatusDistinction: "Yes",
      antimotilityAgents: i % 2 === 0 ? "Yes" : "No",
      treatment: "Loperamide as needed",
      remarks: "Stable pouch function.",
    })),
  pouchoscopies: seedPatients
    .filter((_, i) => i % 7 === 5)
    .flatMap((p, pi) =>
      [0, 1].map((n) => ({
        id: `POUCH-${pi}-${n}`,
        patientId: p.id,
        visitId: n === 0 ? `${p.id}-V1` : `${p.id}-V2`,
        serialNumber: n + 1,
        date: monthsAgo(4 + pi + n * 2),
        scoreType: "PDAI",
        pdaiStoolFrequencyId: n === 0 ? "3+" : "usual",
        pdaiRectalBleedingId: n === 0 ? "daily" : "none",
        pdaiFecalUrgencyId: n === 0 ? "usual" : "none",
        pdaiFeverId: "absent",
        pdaiEndoscopicEdema: n === 0,
        pdaiEndoscopicGranularity: n === 0,
        pdaiEndoscopicFriability: n === 0,
        pdaiEndoscopicLossOfVascularPattern: n === 0,
        pdaiEndoscopicMucusExudates: false,
        pdaiEndoscopicUlceration: n === 0,
        pdaiPolymorphInfiltrationId: n === 0 ? "moderate" : "mild",
        pdaiUlcerationLpfId: n === 0 ? "25-50" : "lt25",
        scoreValue: n === 0 ? 11 : 3,
        inference:
          n === 0
            ? "Pouchitis (PDAI ≥7)"
            : "Below PDAI pouchitis threshold",
        acuteInflammation:
          n === 0
            ? "Moderate polymorph infiltration"
            : "Mild cryptitis",
        chronicInflammation:
          n === 0 ? "Patchy chronic changes" : "Minimal chronic inflammation",
      })),
    ),
  courseOfDisease: seedPatients.map((p, i) => ({
    id: `COD-${i}`,
    patientId: p.id,
    singleEpisodeProlongedRemission: i % 3 === 0 ? "Yes — 2 years" : "",
    chronicContinuousActive: i % 3 === 1 ? "Ongoing" : "",
    relapsingRemitting: i % 3 === 2 ? "Intermittent flares" : "",
    severityIncreaseAfterLowActivity: i % 4 === 0 ? "After 1 year" : "",
    fulminantEarlyColectomy: i % 5 === 0 ? "No" : "",
    colectomyAtFirstRelapse: i % 4 === 0 ? "Yes" : "No",
  })),
  diseaseCategorization: seedPatients.map((p, i) => ({
    id: `DCAT-${i}`,
    patientId: p.id,
    extentAtPresentation: EXTENT_AT_PRESENTATION[i % EXTENT_AT_PRESENTATION.length],
    severityAtPresentation:
      SEVERITY_AT_PRESENTATION[i % SEVERITY_AT_PRESENTATION.length],
    ageAtPresentation: Math.max(12, p.ageAtDiagnosis - (i % 3)),
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
