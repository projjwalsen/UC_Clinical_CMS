"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  UserRoundX,
} from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
  Select,
  StatusBadge,
} from "@/components/ui/core";
import { downloadCsv, formatDate } from "@/lib/utils";
import type { Patient } from "@/types/clinical";

export function PatientDirectory({
  onPatient,
  onAdd,
  onAddRecord,
}: {
  onPatient: (id: string) => void;
  onAdd: () => void;
  onAddRecord: (id: string) => void;
}) {
  const { patients, archivePatient } = useDemoStore();
  const [query, setQuery] = useState("");
  const [extent, setExtent] = useState("All");
  const [status, setStatus] = useState("All");
  const [followUp, setFollowUp] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<string | null>(null);
  const [showColumns, setShowColumns] = useState(false);
  const [columns, setColumns] = useState({
    phone: true,
    registered: true,
    extent: true,
    lastVisit: true,
    followUp: true,
  });
  const pageSize = 8;
  const visible = useMemo(
    () =>
      patients
        .filter(
          (p) =>
            !p.archived &&
            `${p.id} ${p.name} ${p.phone}`
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (extent === "All" || p.diseaseExtent === extent) &&
            (status === "All" || p.status === status) &&
            (followUp === "All" || p.followUpStatus === followUp),
        )
        .sort((a, b) =>
          sort === "Name"
            ? a.name.localeCompare(b.name)
            : sort === "Oldest"
              ? a.registrationDate.localeCompare(b.registrationDate)
              : b.registrationDate.localeCompare(a.registrationDate),
        ),
    [patients, query, extent, status, followUp, sort],
  );
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const shown = visible.slice((page - 1) * pageSize, page * pageSize);

  const action = (label: string, p: Patient) => {
    setMenu(null);
    if (
      label === "View profile" ||
      label === "Edit patient" ||
      label === "Generate report"
    )
      onPatient(p.id);
    if (label === "Add visit" || label === "Add clinical record")
      onAddRecord(p.id);
    if (
      label === "Archive patient" &&
      confirm(`Archive ${p.name}? This only changes local demo data.`)
    )
      archivePatient(p.id);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Patient registry"
        title="Patients"
        description="Search, filter and manage the synthetic demonstration cohort."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  "uc-patients-demo.csv",
                  visible as unknown as Record<string, unknown>[],
                )
              }
            >
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button onClick={onAdd}>
              <Plus className="size-4" />
              Add patient
            </Button>
          </>
        }
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">
          <SearchInput
            className="min-w-64 flex-1"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search UC ID, name or phone…"
            aria-label="Search patients"
          />
          <Select
            value={extent}
            onChange={(e) => setExtent(e.target.value)}
            aria-label="Disease extent"
          >
            <option>All</option>
            <option>Proctitis</option>
            <option>Left-sided colitis</option>
            <option>Pancolitis</option>
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Clinical status"
          >
            <option>All</option>
            <option>Remission</option>
            <option>Active disease</option>
            <option>Relapse</option>
            <option>Post-surgery</option>
          </Select>
          <Select
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            aria-label="Follow-up status"
          >
            <option>All</option>
            <option>Complete</option>
            <option>Due soon</option>
            <option>Overdue</option>
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort patients"
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Name</option>
          </Select>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowColumns(!showColumns)}
            >
              <SlidersHorizontal className="size-4" />
              Columns
              <ChevronDown className="size-3" />
            </Button>
            {showColumns && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {Object.entries(columns).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        setColumns((c) => ({
                          ...c,
                          [key]: !c[key as keyof typeof c],
                        }))
                      }
                    />
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        {shown.length === 0 ? (
          <EmptyState title="No matching patients" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">UC ID / patient</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Gender</th>
                  {columns.phone && <th className="px-4 py-3">Phone</th>}
                  {columns.registered && (
                    <th className="px-4 py-3">Registered</th>
                  )}
                  {columns.extent && (
                    <th className="px-4 py-3">Disease extent</th>
                  )}
                  <th className="px-4 py-3">Status</th>
                  {columns.lastVisit && (
                    <th className="px-4 py-3">Last visit</th>
                  )}
                  {columns.followUp && <th className="px-4 py-3">Follow-up</th>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <button
                        className="text-left"
                        onClick={() => onPatient(p.id)}
                      >
                        <span className="block font-bold text-slate-900">
                          {p.name}
                        </span>
                        <span className="text-xs font-medium text-teal-700">
                          {p.id}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.age}</td>
                    <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                    {columns.phone && (
                      <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    )}
                    {columns.registered && (
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(p.registrationDate)}
                      </td>
                    )}
                    {columns.extent && (
                      <td className="px-4 py-3 text-slate-600">
                        {p.diseaseExtent}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    {columns.lastVisit && (
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(p.lastVisit)}
                      </td>
                    )}
                    {columns.followUp && (
                      <td className="px-4 py-3">
                        <StatusBadge status={p.followUpStatus} />
                      </td>
                    )}
                    <td className="relative px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Actions for ${p.name}`}
                        onClick={() => setMenu(menu === p.id ? null : p.id)}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                      {menu === p.id && (
                        <div className="absolute right-8 top-11 z-10 w-52 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                          {[
                            "View profile",
                            "Edit patient",
                            "Add visit",
                            "Add clinical record",
                            "Generate report",
                            "Archive patient",
                          ].map((label) => (
                            <button
                              key={label}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${label === "Archive patient" ? "text-red-600" : "text-slate-700"}`}
                              onClick={() => action(label, p)}
                            >
                              {label === "View profile" ? (
                                <Eye className="size-4" />
                              ) : label === "Archive patient" ? (
                                <UserRoundX className="size-4" />
                              ) : null}
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-xs text-slate-500">
            Showing {shown.length ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, visible.length)} of {visible.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
