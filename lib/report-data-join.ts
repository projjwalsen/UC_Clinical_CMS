import type { Patient } from "@/types/clinical";
import { getPatientDisplayPhone } from "@/lib/patient-contact";
import type {
  ClinicalDatasetRecord,
  ClinicalDatasetReportRow,
} from "@/types/clinical-report";

export function patientSexCode(patient: Patient): 1 | 2 | undefined {
  if (patient.gender === "Male") return 1;
  if (patient.gender === "Female") return 2;
  return undefined;
}

export function buildClinicalReportRows(
  patients: Patient[],
  clinicalRecords: ClinicalDatasetRecord[],
): ClinicalDatasetReportRow[] {
  return clinicalRecords
    .map((record) => {
      const patient = patients.find(
        (item) =>
          item.id === record.patientId || item.ibdCode === record.ibdCode,
      );

      if (!patient) return null;

      const row: ClinicalDatasetReportRow = {
        ...record,
        patientName: patient.name,
        phoneNumber: getPatientDisplayPhone(patient),
        age: patient.age,
        sex: patientSexCode(patient),
      };
      return row;
    })
    .filter((record): record is ClinicalDatasetReportRow => record !== null);
}
