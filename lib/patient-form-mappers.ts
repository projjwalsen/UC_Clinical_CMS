import type { Patient } from "@/types/clinical";
import { calculateKuppuswamy } from "@/lib/kuppuswamy";

export type PatientPersonalFormState = {
  name: string;
  dateOfBirth: string;
  gender: string;
  registrationDate: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  policeStation: string;
  phone: string;
  alternatePhone: string;
  email: string;
  religion: string;
  maritalStatus: string;
  children: string;
  occupation: string;
  education: string;
  monthlyFamilyIncome: string;
  diet: string;
  notes: string;
  ibdCode: string;
  wageLossPerMonthRs: string;
  daysAbsentFromWorkPerMonth: string;
  treatmentCostPerMonthRs: string;
  otherSocioEconomicInfo: string;
};

export function computeAgeFromDob(dateOfBirth: string, today = new Date()) {
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 0;
  const refYear = today.getFullYear();
  const refMonth = today.getMonth();
  const refDay = today.getDate();
  let age = refYear - birthDate.getFullYear();
  const birthdayPassed =
    birthDate.getMonth() < refMonth ||
    (birthDate.getMonth() === refMonth && birthDate.getDate() <= refDay);
  if (!birthdayPassed) age -= 1;
  return Math.max(0, age);
}

export function patientToPersonalForm(patient: Patient): PatientPersonalFormState {
  return {
    name: patient.name,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    registrationDate: patient.registrationDate,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    country: patient.country ?? "India",
    pinCode: patient.pinCode,
    policeStation: patient.policeStation ?? "",
    phone: patient.phone,
    alternatePhone: patient.alternatePhone ?? "",
    email: patient.email ?? "",
    religion: patient.religion,
    maritalStatus: patient.maritalStatus,
    children: String(patient.children),
    occupation: patient.occupation,
    education: patient.education,
    monthlyFamilyIncome: patient.monthlyFamilyIncome ?? "",
    diet: patient.diet,
    notes: patient.notes,
    ibdCode: patient.ibdCode ?? "",
    wageLossPerMonthRs: patient.wageLossPerMonthRs ?? "",
    daysAbsentFromWorkPerMonth: patient.daysAbsentFromWorkPerMonth ?? "",
    treatmentCostPerMonthRs: patient.treatmentCostPerMonthRs ?? "",
    otherSocioEconomicInfo: patient.otherSocioEconomicInfo ?? "",
  };
}

export function applyPersonalFormToPatient(
  patient: Patient,
  form: PatientPersonalFormState,
): Patient {
  const age = computeAgeFromDob(form.dateOfBirth);
  const kuppuswamy = calculateKuppuswamy(
    form.education,
    form.occupation,
    form.monthlyFamilyIncome,
  );
  let defaultPhoneContact = patient.defaultPhoneContact ?? "primary";
  if (defaultPhoneContact === "alternate" && !form.alternatePhone.trim()) {
    defaultPhoneContact = "primary";
  }

  const ageAtDiagnosis =
    patient.diagnosisDate && form.dateOfBirth
      ? Math.max(
          0,
          new Date(patient.diagnosisDate).getFullYear() -
            new Date(form.dateOfBirth).getFullYear(),
        )
      : patient.ageAtDiagnosis;

  return {
    ...patient,
    name: form.name.trim(),
    dateOfBirth: form.dateOfBirth,
    age,
    gender: form.gender as Patient["gender"],
    registrationDate: form.registrationDate,
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state,
    country: form.country,
    pinCode: form.pinCode,
    policeStation: form.policeStation.trim() || undefined,
    phone: form.phone.trim(),
    alternatePhone: form.alternatePhone.trim() || undefined,
    defaultPhoneContact,
    email: form.email.trim() || undefined,
    religion: form.religion,
    maritalStatus: form.maritalStatus,
    children: Number(form.children) || 0,
    occupation: form.occupation,
    education: form.education,
    monthlyFamilyIncome: form.monthlyFamilyIncome,
    kuppuswamyScore: kuppuswamy.totalScore,
    socioeconomicCategory: kuppuswamy.socioeconomicCategory,
    diet: form.diet,
    notes: form.notes,
    ibdCode: form.ibdCode.trim() || undefined,
    ageAtDiagnosis,
    wageLossPerMonthRs: form.wageLossPerMonthRs.trim() || undefined,
    daysAbsentFromWorkPerMonth:
      form.daysAbsentFromWorkPerMonth.trim() || undefined,
    treatmentCostPerMonthRs: form.treatmentCostPerMonthRs.trim() || undefined,
    otherSocioEconomicInfo: form.otherSocioEconomicInfo.trim() || undefined,
  };
}

export function validatePersonalForm(form: PatientPersonalFormState) {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Patient name is required.";
  if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  else if (new Date(form.dateOfBirth) > new Date()) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state) errors.state = "Select a state.";
  if (!form.country) errors.country = "Select a country.";
  if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = "Enter a valid 10-digit primary phone number.";
  }
  if (form.alternatePhone && !/^\d{10}$/.test(form.alternatePhone)) {
    errors.alternatePhone = "Alternate phone must be 10 digits.";
  }
  if (form.pinCode && !/^\d{6}$/.test(form.pinCode)) {
    errors.pinCode = "Enter a valid 6-digit PIN.";
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email.";
  }
  if (!form.education) errors.education = "Select an education level.";
  if (!form.occupation) errors.occupation = "Select an occupation type.";
  if (!form.monthlyFamilyIncome) {
    errors.monthlyFamilyIncome = "Select a monthly income range.";
  }
  return errors;
}
