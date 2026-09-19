"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { getPatientDisplayPhone } from "@/lib/patient-contact";
import { Badge, Card, Input } from "@/components/ui/core";
import { Dashboard } from "@/components/dashboard/dashboard";
import { PatientDirectory } from "@/components/patients/patient-directory";
import { PatientForm } from "@/components/forms/patient-form";
import { PatientProfile } from "@/components/patients/patient-profile";
import { ClinicalRecordsPage } from "@/components/clinical/clinical-records";
import {
  ReportBuilder,
  StatisticalReports,
} from "@/components/reports/reports";
import { SettingsPage } from "@/components/settings/settings";

const nav = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["patients", "Patients", Users],
  ["add-patient", "Add Patient", PlusCircle],
  ["clinical-records", "Clinical Records", Activity],
  ["reports", "Statistical Reports", BarChart3],
  ["advanced-reports", "Advanced Reports", FileBarChart],
  ["clinical-dataset", "Clinical Dataset Report", FileBarChart],
  ["settings", "Settings", Settings],
] as const;
const titles: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  "add-patient": "Add Patient",
  "clinical-records": "Clinical Records",
  reports: "Statistical Reports",
  "advanced-reports": "Advanced Reports",
  settings: "Settings",
  profile: "Patient Profile",
  "clinical-dataset": "Clinical Dataset Report",
};

export function AppShell({
  initialPage,
  initialPatientId,
}: {
  initialPage?: string;
  initialPatientId?: string;
} = {}) {
  const router = useRouter();
  const { patients, logout } = useDemoStore();
  const [page, setPage] = useState(initialPage ?? "dashboard");
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [profileMenu, setProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  useEffect(() => {
    if (initialPage) setPage(initialPage);
    if (initialPatientId) setPatientId(initialPatientId);
  }, [initialPage, initialPatientId]);

  const navigate = (next: string) => {
    if (next === "clinical-dataset") {
      router.push("/reports/clinical-dataset");
      return;
    }
    setPage(next);
    setMobile(false);
  };
  const patient = (id: string) => {
    setPatientId(id);
    navigate("profile");
    setSearch("");
  };
  const matches = search
    ? patients
        .filter(
          (p) =>
            !p.archived &&
            `${p.id} ${p.name} ${getPatientDisplayPhone(p)} ${p.phone} ${p.alternatePhone ?? ""}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobile && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b2630] text-white transition-all duration-300 lg:translate-x-0 ${collapsed ? "lg:w-[4.5rem]" : ""} ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-18 items-center gap-3 border-b border-white/10 px-5 ${collapsed ? "lg:justify-center lg:px-2 lg:gap-0" : ""}`}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-lg font-black">
            UC
          </div>
          <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="truncate text-sm font-bold">UC Clinical CMS</p>
            <p className="text-[10px] text-slate-400">Research Data Platform</p>
          </div>
          <button
            className={`rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white ${collapsed ? "hidden" : "lg:hidden"}`}
            onClick={() => setMobile(false)}
          >
            <X className="size-5" />
          </button>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:block ${collapsed ? "" : "ml-auto"}`}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <p
            className={`px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500 ${collapsed ? "lg:hidden" : ""}`}
          >
            Workspace
          </p>
          {nav.map(([key, label, Icon]) => (
            <button
              key={key}
              title={collapsed ? label : undefined}
              onClick={() => navigate(key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""} ${page === key ? "bg-teal-600 text-white shadow-lg shadow-teal-950/20" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="size-4 shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className={`mb-3 rounded-lg bg-white/5 p-3 ${collapsed ? "lg:hidden" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Environment
                </span>
                <Badge tone="teal">Demo</Badge>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                Synthetic data · local browser storage
              </p>
          </div>
          <button
            title={collapsed ? "Logout" : undefined}
            onClick={logout}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""}`}
          >
            <LogOut className="size-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>
      <div
        className={`transition-all duration-300 ${collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"}`}
      >
        <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobile(true)}
          >
            <Menu className="size-5" />
          </button>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-lg p-2 hover:bg-slate-100 lg:block"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
          <div className="hidden min-w-32 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              UC Clinical CMS
            </p>
            <p className="text-sm font-bold">{titles[page]}</p>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 pl-9"
              placeholder="Search any patient by ID, name or phone…"
              aria-label="Global patient search"
            />
            {matches.length > 0 && (
              <Card className="absolute top-12 z-30 w-full overflow-hidden p-1 shadow-xl">
                {matches.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => patient(p.id)}
                    className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-50"
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {p.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {p.id} · {p.phone}
                      </span>
                    </span>
                    <Badge>{p.status}</Badge>
                  </button>
                ))}
              </Card>
            )}
          </div>
          <Badge
            tone="teal"
            className="hidden whitespace-nowrap sm:inline-flex"
          >
            ● Demo Mode
          </Badge>
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setNotifications(!notifications)}
              className="relative rounded-lg p-2 hover:bg-slate-100"
            >
              <Bell className="size-5 text-slate-600" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            {notifications && (
              <Card className="absolute right-0 top-12 w-80 p-4 shadow-xl">
                <p className="text-sm font-bold">Notifications</p>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  <p>5 follow-up visits are due this week.</p>
                  <p>3 synthetic laboratory flags require review.</p>
                </div>
              </Card>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setProfileMenu(!profileMenu)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                AD
              </span>
              <span className="hidden text-left xl:block">
                <span className="block text-xs font-bold">Admin Demo</span>
                <span className="block text-[10px] text-slate-400">
                  Clinical coordinator
                </span>
              </span>
              <ChevronDown className="hidden size-3 xl:block" />
            </button>
            {profileMenu && (
              <Card className="absolute right-0 top-12 w-48 p-1.5 shadow-xl">
                <button
                  onClick={() => {
                    navigate("settings");
                    setProfileMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  Profile settings
                </button>
                <button
                  onClick={logout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </Card>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          {page === "dashboard" && (
            <Dashboard onNavigate={navigate} onPatient={patient} />
          )}
          {page === "patients" && (
            <PatientDirectory
              onPatient={patient}
              onAdd={() => navigate("add-patient")}
              onAddRecord={patient}
            />
          )}
          {page === "add-patient" && (
            <PatientForm
              onCancel={() => navigate("patients")}
              onSaved={patient}
            />
          )}
          {page === "profile" && (
            <PatientProfile
              patientId={patientId || patients[0]?.id}
              onBack={() => navigate("patients")}
            />
          )}
          {page === "clinical-records" && (
            <ClinicalRecordsPage onPatient={patient} />
          )}
          {page === "reports" && <StatisticalReports />}
          {page === "advanced-reports" && <ReportBuilder />}
          {page === "clinical-dataset" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Open the full{" "}
              <Link
                href="/reports/clinical-dataset"
                className="font-semibold text-teal-700 hover:underline"
              >
                Clinical Dataset Report
              </Link>{" "}
              workspace for filters, export, and print.
            </div>
          )}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
