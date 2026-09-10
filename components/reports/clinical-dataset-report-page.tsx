"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Expand,
  Eye,
  EyeOff,
  Printer,
  Shrink,
} from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/demo-store";
import { buildClinicalReportRows } from "@/lib/report-data-join";
import {
  activeFilterChips,
  emptyReportFilters,
  filterClinicalReportRows,
  type ClinicalReportFilterState,
} from "@/lib/report-filters";
import { clinicalReportRowsToCsv } from "@/lib/report-csv-export";
import { downloadCsv } from "@/lib/utils";
import {
  ReportFilters,
} from "@/components/reports/report-filters";
import { ReportSummary } from "@/components/reports/report-summary";
import {
  ClinicalReportTable,
  clinicalReportColumnDefinitions,
} from "@/components/reports/clinical-report-table";
import { Badge, Button, PageHeader, Select } from "@/components/ui/core";
import type { ReportColumnKey, ReportTableDensity } from "@/types/clinical-report";

const defaultVisible: ReportColumnKey[] = clinicalReportColumnDefinitions.map(
  (c) => c.key,
);

export function ClinicalDatasetReportPage() {
  const router = useRouter();
  const { ready, patients, clinicalDatasetRecords } = useDemoStore();
  const [filters, setFilters] = useState<ClinicalReportFilterState>(
    emptyReportFilters(),
  );
  const [visibleColumns, setVisibleColumns] =
    useState<ReportColumnKey[]>(defaultVisible);
  const [density, setDensity] = useState<ReportTableDensity>("comfortable");
  const [showSensitive, setShowSensitive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [includeCodeDescriptions, setIncludeCodeDescriptions] = useState(false);
  const [generatedAt] = useState(() => new Date().toISOString());

  const allRows = useMemo(
    () =>
      buildClinicalReportRows(
        patients.filter((p) => !p.archived),
        clinicalDatasetRecords,
      ),
    [patients, clinicalDatasetRecords],
  );

  const filteredRows = useMemo(
    () => filterClinicalReportRows(allRows, filters),
    [allRows, filters],
  );

  const chips = activeFilterChips(filters);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", fullscreen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [fullscreen]);

  const toggleColumn = (key: ReportColumnKey) => {
    setVisibleColumns((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  };

  const exportCsv = () => {
    downloadCsv(
      `clinical-dataset-report-${new Date().toISOString().slice(0, 10)}.csv`,
      clinicalReportRowsToCsv(filteredRows, {
        includeDescriptions: includeCodeDescriptions,
      }),
    );
    toast.success("CSV exported for filtered cohort");
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-slate-50 p-4 md:p-6 print:bg-white"
          : "print:p-0"
      }
      id="clinical-dataset-report-root"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 12mm;
          }
          body * {
            visibility: hidden;
          }
          #clinical-dataset-report-root,
          #clinical-dataset-report-root * {
            visibility: visible;
          }
          #clinical-dataset-report-root {
            position: absolute;
            inset: 0;
            overflow: visible;
          }
          .no-print {
            display: none !important;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>

      <div className="no-print mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Synthetic demonstration data only — not for clinical or research use.
        Phone numbers are masked unless you enable sensitive fields.
      </div>

      <PageHeader
        eyebrow="Reports"
        title="Clinical Dataset Report"
        description="Excel-style code-only cells in the table; column ⓘ icons explain each field. Demographics come from linked patient profiles."
        actions={
          <div className="flex flex-wrap gap-2 no-print">
            <Badge tone="teal">Demo Data</Badge>
            <Badge tone="slate">
              Last generated:{" "}
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(generatedAt))}
            </Badge>
          </div>
        }
      />

      <p className="mb-4 text-sm text-slate-600 print:text-black">
        Total eligible patients:{" "}
        <span className="font-bold">{allRows.length}</span> · Showing{" "}
        <span className="font-bold">{filteredRows.length}</span> of{" "}
        {allRows.length} eligible patients
      </p>

      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={includeCodeDescriptions}
            onChange={(e) => setIncludeCodeDescriptions(e.target.checked)}
          />
          Include code descriptions in CSV
        </label>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="size-4" />
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={printReport}>
          <Printer className="size-4" />
          Print report
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSensitive((v) => !v)}
        >
          {showSensitive ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
          {showSensitive ? "Hide sensitive fields" : "Show sensitive fields"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFullscreen((v) => !v)}
        >
          {fullscreen ? (
            <Shrink className="size-4" />
          ) : (
            <Expand className="size-4" />
          )}
          {fullscreen ? "Exit full screen" : "Full-screen table"}
        </Button>
        <Select
          value={density}
          onChange={(e) =>
            setDensity(e.target.value as ReportTableDensity)
          }
          className="h-9 w-auto text-xs"
          aria-label="Table density"
        >
          <option value="comfortable">Comfortable density</option>
          <option value="compact">Compact density</option>
        </Select>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFilters(emptyReportFilters())}
        >
          Reset filters
        </Button>
      </div>

      <div className="no-print mb-4">
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyReportFilters())}
        />
      </div>

      {chips.length > 0 && (
        <div className="no-print mb-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-600/15"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  [chip.key]: "",
                }))
              }
            >
              {chip.label} ×
            </button>
          ))}
        </div>
      )}

      <div className="no-print mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-bold uppercase text-slate-500">
          Column visibility
        </p>
        <div className="flex flex-wrap gap-2">
          {clinicalReportColumnDefinitions.map((col) => (
            <label
              key={col.key}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px]"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => toggleColumn(col.key)}
              />
              {col.label}
            </label>
          ))}
        </div>
      </div>

      <div className="no-print mb-6">
        <ReportSummary rows={filteredRows} />
      </div>

      <div className="hidden print:block mb-2 text-xs text-slate-700">
        Applied filters: {chips.length ? chips.map((c) => c.label).join("; ") : "None"} ·
        Generated {new Date(generatedAt).toLocaleString()}
      </div>

      <ClinicalReportTable
        rows={filteredRows}
        showSensitive={showSensitive}
        visibleColumns={visibleColumns}
        density={density}
        loading={!ready}
        onEditPatient={(id) => router.push(`/patients/${id}`)}
      />
    </div>
  );
}
