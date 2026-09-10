"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { savedReportSeeds, seedPatients, seedRecords } from "@/data/mock-data";
import { seedClinicalDatasetRecords } from "@/data/mock-clinical-records";
import type {
  ClinicalRecords,
  Patient,
  ReportConfiguration,
} from "@/types/clinical";
import type { ClinicalDatasetRecord } from "@/types/clinical-report";

const KEYS = {
  patients: "uccms-demo-patients",
  records: "uccms-demo-records",
  reports: "uccms-demo-reports",
  clinicalDataset: "uccms-demo-clinical-dataset",
  auth: "uccms-demo-auth",
};

interface DemoStore {
  ready: boolean;
  authenticated: boolean;
  patients: Patient[];
  records: ClinicalRecords;
  reports: ReportConfiguration[];
  clinicalDatasetRecords: ClinicalDatasetRecord[];
  login: (email: string, password: string, remember: boolean) => boolean;
  logout: () => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  archivePatient: (id: string) => void;
  addRecord: (
    kind: keyof ClinicalRecords,
    record: ClinicalRecords[keyof ClinicalRecords][number],
  ) => void;
  addRecords: (
    kind: keyof ClinicalRecords,
    records: ClinicalRecords[keyof ClinicalRecords][number][],
  ) => void;
  saveReport: (report: ReportConfiguration) => void;
  updateClinicalDatasetRecord: (record: ClinicalDatasetRecord) => void;
  upsertClinicalDatasetForPatient: (
    patientId: string,
    ibdCode: string,
    patch: Partial<ClinicalDatasetRecord>,
  ) => void;
  reset: () => void;
}

const Context = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(seedPatients);
  const [records, setRecords] = useState<ClinicalRecords>(seedRecords);
  const [reports, setReports] =
    useState<ReportConfiguration[]>(savedReportSeeds);
  const [clinicalDatasetRecords, setClinicalDatasetRecords] = useState<
    ClinicalDatasetRecord[]
  >(seedClinicalDatasetRecords);

  useEffect(() => {
    try {
      const p = localStorage.getItem(KEYS.patients);
      const r = localStorage.getItem(KEYS.records);
      const saved = localStorage.getItem(KEYS.reports);
      const clinical = localStorage.getItem(KEYS.clinicalDataset);
      if (p) {
        const parsed = JSON.parse(p) as Patient[];
        setPatients(
          parsed.map((patient) => {
            const seed = seedPatients.find((s) => s.id === patient.id);
            return {
              ...patient,
              ibdCode: patient.ibdCode ?? seed?.ibdCode,
            };
          }),
        );
      }
      if (r) setRecords(JSON.parse(r));
      if (saved) setReports(JSON.parse(saved));
      if (clinical) setClinicalDatasetRecords(JSON.parse(clinical));
      setAuthenticated(
        localStorage.getItem(KEYS.auth) === "true" ||
          sessionStorage.getItem(KEYS.auth) === "true",
      );
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEYS.patients, JSON.stringify(patients));
  }, [patients, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(KEYS.records, JSON.stringify(records));
  }, [records, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(KEYS.reports, JSON.stringify(reports));
  }, [reports, ready]);
  useEffect(() => {
    if (ready) {
      localStorage.setItem(
        KEYS.clinicalDataset,
        JSON.stringify(clinicalDatasetRecords),
      );
    }
  }, [clinicalDatasetRecords, ready]);

  const value = useMemo<DemoStore>(
    () => ({
      ready,
      authenticated,
      patients,
      records,
      reports,
      clinicalDatasetRecords,
      // Frontend-only mock authentication. Never use this credential check in production.
      login(email, password, remember) {
        const valid =
          email.trim().toLowerCase() === "admin@uccms.demo" &&
          password === "Demo@123";
        if (valid) {
          (remember ? localStorage : sessionStorage).setItem(KEYS.auth, "true");
          setAuthenticated(true);
        }
        return valid;
      },
      logout() {
        localStorage.removeItem(KEYS.auth);
        sessionStorage.removeItem(KEYS.auth);
        setAuthenticated(false);
      },
      addPatient(patient) {
        setPatients((current) => [patient, ...current]);
      },
      updatePatient(patient) {
        setPatients((current) =>
          current.map((p) => (p.id === patient.id ? patient : p)),
        );
        setClinicalDatasetRecords((current) =>
          current.map((record) =>
            record.patientId === patient.id
              ? {
                  ...record,
                  ibdCode: patient.ibdCode ?? record.ibdCode,
                  updatedAt: new Date().toISOString(),
                }
              : record,
          ),
        );
      },
      archivePatient(id) {
        setPatients((current) =>
          current.map((p) => (p.id === id ? { ...p, archived: true } : p)),
        );
      },
      addRecord(kind, record) {
        setRecords((current) => ({
          ...current,
          [kind]: [record, ...current[kind]],
        }));
      },
      addRecords(kind, newRecords) {
        setRecords((current) => ({
          ...current,
          [kind]: [...newRecords, ...current[kind]],
        }));
      },
      saveReport(report) {
        setReports((current) => [
          report,
          ...current.filter((r) => r.id !== report.id),
        ]);
      },
      updateClinicalDatasetRecord(record) {
        setClinicalDatasetRecords((current) =>
          current.map((item) => (item.id === record.id ? record : item)),
        );
      },
      upsertClinicalDatasetForPatient(patientId, ibdCode, patch) {
        setClinicalDatasetRecords((current) => {
          const existing = current.find((r) => r.patientId === patientId);
          const updatedAt = new Date().toISOString();
          if (existing) {
            return current.map((r) =>
              r.patientId === patientId
                ? { ...r, ...patch, ibdCode, updatedAt }
                : r,
            );
          }
          return [
            {
              id: `CDR-${patientId}`,
              patientId,
              ibdCode,
              comorbidities: [],
              modifiers: [],
              currentTherapies: [],
              skinManifestations: [],
              nutritionalDeficiencies: [],
              therapyAdverseEffects: [],
              extraintestinalManifestations: [],
              recordStatus: "incomplete",
              createdAt: updatedAt,
              updatedAt,
              ...patch,
            },
            ...current,
          ];
        });
      },
      reset() {
        setPatients(seedPatients);
        setRecords(seedRecords);
        setReports(savedReportSeeds);
        setClinicalDatasetRecords(seedClinicalDatasetRecords);
        localStorage.removeItem(KEYS.patients);
        localStorage.removeItem(KEYS.records);
        localStorage.removeItem(KEYS.reports);
        localStorage.removeItem(KEYS.clinicalDataset);
      },
    }),
    [ready, authenticated, patients, records, reports, clinicalDatasetRecords],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemoStore() {
  const value = useContext(Context);
  if (!value)
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  return value;
}
