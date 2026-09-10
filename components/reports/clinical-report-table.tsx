"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import type {
  ClinicalDatasetReportRow,
  ReportColumnKey,
  ReportTableDensity,
} from "@/types/clinical-report";
import { ColumnInfo } from "@/components/reports/column-info";
import { RecordValidationPanel } from "@/components/reports/record-validation-panel";
import { Button } from "@/components/ui/core";
import { validateClinicalDatasetRecord } from "@/lib/report-validation";
import { useDemoStore } from "@/lib/demo-store";
import { maskPhone } from "@/lib/report-labels";
import {
  calculateAgeGroupCode,
  formatCodes,
  formatComorbidityCodes,
  formatDlqiChangeCode,
  formatReportCell,
  formatTextList,
} from "@/lib/report-table-format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const columns: {
  key: ReportColumnKey;
  label: string;
  fieldKey: string;
  sortable?: boolean;
}[] = [
  { key: "serialNumber", label: "SERIAL NO", fieldKey: "serialNumber" },
  { key: "ibdCode", label: "IBD CODE", fieldKey: "ibdCode", sortable: true },
  { key: "patientName", label: "NAME", fieldKey: "patientName", sortable: true },
  { key: "phoneNumber", label: "PHONE NUMBER", fieldKey: "phoneNumber" },
  { key: "age", label: "AGE", fieldKey: "age", sortable: true },
  { key: "sex", label: "SEX", fieldKey: "sex" },
  { key: "comorbidity", label: "COMORBIDITY", fieldKey: "comorbidity" },
  { key: "surgicalHistory", label: "SURGICAL HISTORY", fieldKey: "surgicalHistory" },
  { key: "ibdType", label: "IBD TYPE", fieldKey: "ibdType" },
  { key: "diseaseLocation", label: "DISEASE LOCATION", fieldKey: "diseaseLocation" },
  { key: "modifier", label: "MODIFIER", fieldKey: "modifier" },
  { key: "ageAtDiagnosis", label: "AGE AT DIAGNOSIS", fieldKey: "ageAtDiagnosis" },
  { key: "ageGroup", label: "AGE GROUP", fieldKey: "ageGroup" },
  { key: "diseaseBehaviour", label: "DISEASE BEHAVIOUR", fieldKey: "diseaseBehaviour" },
  { key: "illnessDuration", label: "DURATION OF ILLNESS", fieldKey: "illnessDuration" },
  { key: "familyHistoryOfIBD", label: "FAMILY HISTORY OF IBD", fieldKey: "familyHistoryOfIBD" },
  { key: "diseaseActivity", label: "DISEASE ACTIVITY", fieldKey: "diseaseActivity" },
  { key: "currentTherapy", label: "CURRENT THERAPY", fieldKey: "currentTherapy" },
  { key: "therapyDuration", label: "DURATION OF THERAPY", fieldKey: "therapyDuration" },
  { key: "skinManifestation", label: "SKIN MANIFESTATION", fieldKey: "skinManifestation" },
  { key: "nutritionalDeficiency", label: "NUTRITIONAL DEFICIENCY", fieldKey: "nutritionalDeficiency" },
  { key: "adverseEffect", label: "ADVERSE EFFECT OF THERAPY", fieldKey: "adverseEffect" },
  { key: "skinBiopsy", label: "SKIN BIOPSY PERFORMED", fieldKey: "skinBiopsy" },
  { key: "extraintestinalManifestation", label: "EXTRAINTESTINAL MANIFESTATION", fieldKey: "extraintestinalManifestation" },
  { key: "followUpResponse", label: "FOLLOW-UP RESPONSE", fieldKey: "followUpResponse" },
  { key: "dlqiPresentation", label: "DLQI AT PRESENTATION", fieldKey: "dlqiPresentation" },
  { key: "dlqiFollowUp", label: "DLQI AT FOLLOW-UP", fieldKey: "dlqiFollowUp" },
  { key: "dlqiChange", label: "DLQI CHANGE", fieldKey: "dlqiChange" },
  { key: "recordStatus", label: "RECORD STATUS", fieldKey: "recordStatus" },
  { key: "actions", label: "ACTIONS", fieldKey: "actions" },
];

function phoneCell(phone?: string, showSensitive = false) {
  if (!phone) return "";
  return showSensitive ? phone : maskPhone(phone, false);
}

/** Opaque sticky-column backgrounds (no inherit / alpha row tints). */
function stickyRowBackground(rowIndex: number) {
  return rowIndex % 2 === 0
    ? "bg-white group-hover:bg-teal-50"
    : "bg-slate-50 group-hover:bg-teal-50";
}

function cellText(row: ClinicalDatasetReportRow, key: ReportColumnKey, serial: number, showSensitive: boolean) {
  switch (key) {
    case "serialNumber":
      return String(serial);
    case "ibdCode":
      return row.ibdCode;
    case "patientName":
      return row.patientName;
    case "phoneNumber":
      return phoneCell(row.phoneNumber, showSensitive);
    case "age":
      return formatReportCell(row.age);
    case "sex":
      return formatReportCell(row.sex);
    case "comorbidity":
      return formatComorbidityCodes(row);
    case "surgicalHistory":
      return formatReportCell(row.surgicalHistory);
    case "ibdType":
      return formatReportCell(row.ibdType);
    case "diseaseLocation":
      return formatReportCell(row.diseaseLocation);
    case "modifier":
      return formatCodes(row.modifiers);
    case "ageAtDiagnosis":
      return formatReportCell(row.ageAtDiagnosis);
    case "ageGroup":
      return formatReportCell(calculateAgeGroupCode(row.ageAtDiagnosis));
    case "diseaseBehaviour":
      return formatReportCell(row.diseaseBehaviour);
    case "illnessDuration":
      return formatReportCell(row.illnessDurationMonths);
    case "familyHistoryOfIBD":
      return formatReportCell(row.familyHistoryOfIBD);
    case "diseaseActivity":
      return formatReportCell(row.diseaseActivity);
    case "currentTherapy":
      return formatCodes(row.currentTherapies);
    case "therapyDuration":
      return formatReportCell(row.therapyDurationMonths);
    case "skinManifestation":
      return formatTextList(row.skinManifestations);
    case "nutritionalDeficiency":
      return formatTextList(row.nutritionalDeficiencies);
    case "adverseEffect":
      return formatCodes(row.therapyAdverseEffects);
    case "skinBiopsy":
      return formatReportCell(row.skinBiopsyPerformed);
    case "extraintestinalManifestation":
      return formatTextList(row.extraintestinalManifestations);
    case "followUpResponse":
      return formatReportCell(row.followUpResponse);
    case "dlqiPresentation":
      return formatReportCell(row.dlqiAtPresentation);
    case "dlqiFollowUp":
      return formatReportCell(row.dlqiAtFollowUp);
    case "dlqiChange":
      return formatDlqiChangeCode(row.dlqiAtPresentation, row.dlqiAtFollowUp);
    case "recordStatus":
      return row.recordStatus;
    default:
      return "";
  }
}

export function ClinicalReportTable({
  rows,
  showSensitive,
  visibleColumns,
  density,
  loading,
  onEditPatient,
}: {
  rows: ClinicalDatasetReportRow[];
  showSensitive: boolean;
  visibleColumns: ReportColumnKey[];
  density: ReportTableDensity;
  loading?: boolean;
  onEditPatient?: (patientId: string) => void;
}) {
  const { patients, clinicalDatasetRecords } = useDemoStore();
  const [sortKey, setSortKey] = useState<string>("ibdCode");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [validationRow, setValidationRow] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av =
        sortKey === "patientName"
          ? a.patientName
          : sortKey === "age"
            ? String(a.age ?? "")
            : sortKey === "ibdCode"
              ? a.ibdCode
              : String((a as unknown as Record<string, unknown>)[sortKey] ?? "");
      const bv =
        sortKey === "patientName"
          ? b.patientName
          : sortKey === "age"
            ? String(b.age ?? "")
            : sortKey === "ibdCode"
              ? b.ibdCode
              : String((b as unknown as Record<string, unknown>)[sortKey] ?? "");
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const visible = columns.filter((col) => visibleColumns.includes(col.key));
  const cellPad = density === "compact" ? "px-2 py-1.5" : "px-3 py-2.5";
  const validationTarget = validationRow
    ? rows.find((r) => r.id === validationRow)
    : undefined;
  const validationIssues = validationTarget
    ? validateClinicalDatasetRecord(
        validationTarget,
        patients.find((p) => p.id === validationTarget.patientId),
        clinicalDatasetRecords,
      )
    : [];

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        No eligible patients match the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {validationRow && (
        <RecordValidationPanel
          issues={validationIssues}
          onClose={() => setValidationRow(null)}
        />
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[2400px] w-full text-left font-mono text-xs tabular-nums">
          <thead className="sticky top-0 z-20 bg-slate-100 text-[10px] uppercase tracking-wide text-slate-600">
            <tr>
              {visible.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    cellPad,
                    "whitespace-nowrap border-b border-slate-200 font-bold",
                    col.key === "ibdCode" &&
                      "sticky left-0 z-40 min-w-[7rem] border-r border-slate-200 bg-slate-100",
                    col.key === "patientName" &&
                      "sticky left-28 z-40 min-w-[8rem] border-r border-slate-200 bg-slate-100 shadow-[4px_0_8px_-4px_rgba(15,23,42,.12)]",
                  )}
                >
                  <span className="inline-flex max-w-full items-center font-sans">
                    {col.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 hover:text-teal-700"
                        onClick={() => {
                          if (sortKey === col.key) {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortKey(col.key);
                            setSortDir("asc");
                          }
                        }}
                      >
                        {col.label}
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )
                        ) : null}
                      </button>
                    ) : (
                      col.label
                    )}
                    {col.key !== "actions" && <ColumnInfo fieldKey={col.fieldKey} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, rowIndex) => {
              const serial = (page - 1) * PAGE_SIZE + rowIndex + 1;
              return (
                <tr
                  key={row.id}
                  className="group border-t border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-teal-50"
                >
                  {visible.map((col) => {
                    const text = cellText(row, col.key, serial, showSensitive);

                    if (col.key === "actions") {
                      return (
                        <td key={col.key} className={cn(cellPad, "relative")}>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Row actions"
                            onClick={() =>
                              setOpenMenu(openMenu === row.id ? null : row.id)
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                          {openMenu === row.id && (
                            <div className="absolute right-0 z-40 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 font-sans text-sm shadow-lg">
                              <Link
                                href={`/patients/${row.patientId}`}
                                className="block rounded-md px-2 py-1.5 hover:bg-slate-50"
                              >
                                View patient
                              </Link>
                              <button
                                type="button"
                                className="block w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-50"
                                onClick={() => onEditPatient?.(row.patientId)}
                              >
                                Edit patient
                              </button>
                              <Link
                                href={`/patients/${row.patientId}?tab=clinical-dataset`}
                                className="block rounded-md px-2 py-1.5 hover:bg-slate-50"
                              >
                                Add clinical record
                              </Link>
                              <Link
                                href={`/patients/${row.patientId}/report`}
                                className="block rounded-md px-2 py-1.5 hover:bg-slate-50"
                              >
                                Generate individual report
                              </Link>
                            </div>
                          )}
                        </td>
                      );
                    }

                    if (col.key === "ibdCode") {
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            cellPad,
                            "sticky left-0 z-20 min-w-[7rem] border-r border-slate-200",
                            stickyRowBackground(rowIndex),
                          )}
                        >
                          <Link
                            href={`/patients/${row.patientId}`}
                            className="font-sans font-semibold text-teal-700 hover:underline"
                          >
                            {text}
                          </Link>
                        </td>
                      );
                    }

                    if (col.key === "patientName") {
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            cellPad,
                            "sticky left-28 z-20 max-w-48 min-w-[8rem] truncate border-r border-slate-200 font-sans shadow-[4px_0_8px_-4px_rgba(15,23,42,.12)]",
                            stickyRowBackground(rowIndex),
                          )}
                          title={text}
                        >
                          <Link
                            href={`/patients/${row.patientId}`}
                            className="font-semibold text-teal-700 hover:underline"
                          >
                            {text}
                          </Link>
                        </td>
                      );
                    }

                    if (col.key === "recordStatus") {
                      return (
                        <td key={col.key} className={cn(cellPad, "font-sans")}>
                          <button
                            type="button"
                            className="text-left text-teal-700 hover:underline"
                            onClick={() =>
                              setValidationRow(
                                validationRow === row.id ? null : row.id,
                              )
                            }
                          >
                            {text}
                          </button>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.key}
                        className={cn(cellPad, "max-w-48 truncate text-slate-800")}
                        title={text || undefined}
                      >
                        {text}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between font-sans text-xs text-slate-600">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export { columns as clinicalReportColumnDefinitions };
