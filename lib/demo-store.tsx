"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { savedReportSeeds, seedPatients, seedRecords } from "@/data/mock-data";
import type {
  ClinicalRecords,
  Patient,
  ReportConfiguration,
} from "@/types/clinical";

const KEYS = {
  patients: "uccms-demo-patients",
  records: "uccms-demo-records",
  reports: "uccms-demo-reports",
  auth: "uccms-demo-auth",
};

interface DemoStore {
  ready: boolean;
  authenticated: boolean;
  patients: Patient[];
  records: ClinicalRecords;
  reports: ReportConfiguration[];
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

  useEffect(() => {
    try {
      const p = localStorage.getItem(KEYS.patients);
      const r = localStorage.getItem(KEYS.records);
      const saved = localStorage.getItem(KEYS.reports);
      if (p) setPatients(JSON.parse(p));
      if (r) setRecords(JSON.parse(r));
      if (saved) setReports(JSON.parse(saved));
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

  const value = useMemo<DemoStore>(
    () => ({
      ready,
      authenticated,
      patients,
      records,
      reports,
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
      reset() {
        setPatients(seedPatients);
        setRecords(seedRecords);
        setReports(savedReportSeeds);
        localStorage.removeItem(KEYS.patients);
        localStorage.removeItem(KEYS.records);
        localStorage.removeItem(KEYS.reports);
      },
    }),
    [ready, authenticated, patients, records, reports],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemoStore() {
  const value = useContext(Context);
  if (!value)
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  return value;
}
