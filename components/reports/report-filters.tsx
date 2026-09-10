"use client";

import {
  type ClinicalReportFilterState,
  emptyReportFilters,
} from "@/lib/report-filters";
import { Button, Card, Field, Input, Select } from "@/components/ui/core";

export function ReportFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: ClinicalReportFilterState;
  onChange: (next: ClinicalReportFilterState) => void;
  onReset: () => void;
}) {
  const set = <K extends keyof ClinicalReportFilterState>(
    key: K,
    value: ClinicalReportFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Filters</h3>
        <Button variant="secondary" size="sm" onClick={onReset}>
          Reset filters
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Search">
          <Input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="IBD code, name, patient ID"
          />
        </Field>
        <Field label="IBD code">
          <Input
            value={filters.ibdCode}
            onChange={(e) => set("ibdCode", e.target.value)}
          />
        </Field>
        <Field label="Patient name">
          <Input
            value={filters.patientName}
            onChange={(e) => set("patientName", e.target.value)}
          />
        </Field>
        <Field label="Sex">
          <Select
            className="w-full"
            value={filters.sex}
            onChange={(e) => set("sex", e.target.value)}
          >
            <option value="">All</option>
            <option value="1">Male</option>
            <option value="2">Female</option>
          </Select>
        </Field>
        <Field label="Age min">
          <Input
            type="number"
            value={filters.ageMin}
            onChange={(e) => set("ageMin", e.target.value)}
          />
        </Field>
        <Field label="Age max">
          <Input
            type="number"
            value={filters.ageMax}
            onChange={(e) => set("ageMax", e.target.value)}
          />
        </Field>
        <Field label="IBD type">
          <Select
            className="w-full"
            value={filters.ibdType}
            onChange={(e) => set("ibdType", e.target.value)}
          >
            <option value="">All</option>
            <option value="1">Ulcerative Colitis</option>
            <option value="2">Crohn&apos;s Disease</option>
            <option value="3">IBD-Unclassified</option>
          </Select>
        </Field>
        <Field label="Disease activity">
          <Select
            className="w-full"
            value={filters.diseaseActivity}
            onChange={(e) => set("diseaseActivity", e.target.value)}
          >
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="2">Remission</option>
          </Select>
        </Field>
        <Field label="Current therapy">
          <Select
            className="w-full"
            value={filters.currentTherapy}
            onChange={(e) => set("currentTherapy", e.target.value)}
          >
            <option value="">All</option>
            <option value="1">Corticosteroids</option>
            <option value="2">5-ASA</option>
            <option value="3">Immunomodulators</option>
            <option value="4">Biologics</option>
            <option value="5">JAK-2 inhibitors</option>
          </Select>
        </Field>
        <Field label="Record status">
          <Select
            className="w-full"
            value={filters.recordStatus}
            onChange={(e) => set("recordStatus", e.target.value)}
          >
            <option value="">All</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
            <option value="review-required">Review required</option>
          </Select>
        </Field>
        <Field label="DLQI min">
          <Input
            type="number"
            min={0}
            max={30}
            value={filters.dlqiMin}
            onChange={(e) => set("dlqiMin", e.target.value)}
          />
        </Field>
        <Field label="DLQI max">
          <Input
            type="number"
            min={0}
            max={30}
            value={filters.dlqiMax}
            onChange={(e) => set("dlqiMax", e.target.value)}
          />
        </Field>
      </div>
    </Card>
  );
}

export { emptyReportFilters };
