import type { Patient } from "@/types/clinical";

export type DefaultPhoneContact = "primary" | "alternate";

export function getDefaultPhoneContact(
  patient: Pick<Patient, "defaultPhoneContact">,
): DefaultPhoneContact {
  return patient.defaultPhoneContact ?? "primary";
}

/** Phone used in lists, search, and clinical dataset join. */
export function getPatientDisplayPhone(
  patient: Pick<Patient, "phone" | "alternatePhone" | "defaultPhoneContact">,
) {
  const preferred = getDefaultPhoneContact(patient);
  if (preferred === "alternate" && patient.alternatePhone?.trim()) {
    return patient.alternatePhone.trim();
  }
  return patient.phone;
}
