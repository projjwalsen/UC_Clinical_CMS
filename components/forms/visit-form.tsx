"use client";

import { useEffect, useMemo, useState } from "react";
import { VisitLinkedDataBanner } from "@/components/forms/visit-linked-data-banner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ALCOHOL_STATUS,
  CLINICAL_STATE,
  DISEASE_EXTENT,
  MONTREAL_SEVERITY,
  NSAID_FREQUENCY,
  NSAID_USE,
  OCP_USE,
  SMOKING_STATUS,
  SMOKING_TYPE,
  TOBACCO_STATUS,
  VISIT_TYPE,
  YES_NO,
} from "@/data/lookups";
import { MayoScoreSection } from "@/components/forms/mayo-score-section";
import {
  buildVisitFormState,
  calculateBmi,
  mayoScoresFromVisitForm,
  nextVisitId,
  visitFormToRecord,
  visitToFormState,
  type VisitFormState,
} from "@/lib/visit-utils";
import { completeMayoSeverity, partialMayoSeverity } from "@/lib/mayo-score";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { Visit } from "@/types/clinical";

const steps = [
  "Visit & epidemiology",
  "Physical examination",
  "Clinical follow-up",
  "Review & save",
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function VisitForm({
  patientId,
  visitCount,
  patientVisits,
  editingVisit,
  lastVisit,
  onCancel,
  onSave,
}: {
  patientId: string;
  visitCount: number;
  patientVisits: Visit[];
  editingVisit?: Visit | null;
  lastVisit?: Visit | null;
  onCancel: () => void;
  onSave: (visit: Visit) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VisitFormState>(() =>
    editingVisit
      ? visitToFormState(editingVisit)
      : buildVisitFormState(visitCount, lastVisit ?? null),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visitId, setVisitId] = useState(
    () => editingVisit?.id ?? nextVisitId(patientId, visitCount),
  );
  const [loadedExistingVisit, setLoadedExistingVisit] = useState(
    () => !!editingVisit,
  );

  useEffect(() => {
    const existing = patientVisits.find((visit) => visit.date === form.date);
    if (existing && existing.id !== visitId) {
      setForm(visitToFormState(existing));
      setVisitId(existing.id);
      setLoadedExistingVisit(true);
    }
  }, [form.date, patientVisits, visitId]);
  const heightM = Number(form.heightM);
  const weightKg = Number(form.weightKg);
  const bmi = calculateBmi(heightM, weightKg);
  const mayoScores = useMemo(() => mayoScoresFromVisitForm(form), [form]);

  const set = (key: keyof VisitFormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const input = (
    key: keyof VisitFormState,
    label: string,
    required = false,
    type = "text",
    placeholder?: string,
  ) => (
    <Field label={label} required={required} error={errors[key]}>
      <Input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );

  const select = (
    key: keyof VisitFormState,
    label: string,
    options: readonly string[],
    required = false,
  ) => (
    <Field label={label} required={required} error={errors[key]}>
      <Select
        className="w-full"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </Select>
    </Field>
  );

  const textarea = (key: keyof VisitFormState, label: string) => (
    <div className="md:col-span-2">
      <Field label={label}>
        <Textarea
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      </Field>
    </div>
  );

  const validateStep = (targetStep = step) => {
    const next: Record<string, string> = {};
    if (targetStep === 0) {
      if (!form.date) next.date = "Visit date is required.";
      if (!form.type) next.type = "Visit type is required.";
      if (form.heightM && Number(form.heightM) <= 0)
        next.heightM = "Enter a valid height in metres.";
      if (form.weightKg && Number(form.weightKg) <= 0)
        next.weightKg = "Enter a valid weight in kg.";
    }
    if (targetStep === 2) {
      if (!form.mayoStoolFrequency)
        next.mayoStoolFrequency = "Select stool frequency (I).";
      if (!form.mayoRectalBleeding)
        next.mayoRectalBleeding = "Select rectal bleeding (II).";
      if (!form.mayoEndoscopicFindings)
        next.mayoEndoscopicFindings = "Select endoscopic findings (III).";
      if (!form.mayoPhysicianGlobalAssessment)
        next.mayoPhysicianGlobalAssessment =
          "Select physician's global assessment (IV).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateForSave = () => {
    const visitErrors: Record<string, string> = {};
    const mayoErrors: Record<string, string> = {};
    if (!form.date) visitErrors.date = "Visit date is required.";
    if (!form.type) visitErrors.type = "Visit type is required.";
    if (!form.mayoStoolFrequency)
      mayoErrors.mayoStoolFrequency = "Select stool frequency (I).";
    if (!form.mayoRectalBleeding)
      mayoErrors.mayoRectalBleeding = "Select rectal bleeding (II).";
    if (!form.mayoEndoscopicFindings)
      mayoErrors.mayoEndoscopicFindings = "Select endoscopic findings (III).";
    if (!form.mayoPhysicianGlobalAssessment)
      mayoErrors.mayoPhysicianGlobalAssessment =
        "Select physician's global assessment (IV).";
    const merged = { ...visitErrors, ...mayoErrors };
    setErrors(merged);
    return Object.keys(merged).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const submit = () => {
    if (!validateForSave()) return;
    onSave(visitFormToRecord(form, visitId, patientId));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-4">
          {steps.map((label, i) => (
            <div
              key={label}
              className={`relative px-2 py-3 text-center text-[10px] font-bold sm:text-xs ${i <= step ? "text-teal-700" : "text-slate-400"}`}
            >
              <span
                className={`mx-auto mb-1 flex size-6 items-center justify-center rounded-full sm:size-7 ${i < step ? "bg-teal-700 text-white" : i === step ? "bg-teal-50 ring-2 ring-teal-600" : "bg-slate-100"}`}
              >
                {i < step ? <Check className="size-3 sm:size-4" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Visit ID
            </p>
            <p className="text-sm font-bold text-slate-800">{visitId}</p>
          </div>
          {lastVisit && (
            <p className="text-xs text-slate-500">
              Pre-filled from last visit ({lastVisit.id} · {lastVisit.type})
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loadedExistingVisit && (
          <VisitLinkedDataBanner message="A visit already exists on this date. You are editing that visit; saving will update it." />
        )}
        {step === 0 && (
          <div className="space-y-8">
            <Section title="Visit details">
              {select("type", "Visit type", VISIT_TYPE, true)}
              {input("date", "Visit date", true, "date")}
            </Section>

            <Section
              title="Anthropometry"
              description="Height and weight used to calculate BMI automatically."
            >
              {input("heightM", "Height (m)", false, "number", "1.65")}
              {input("weightKg", "Weight (kg)", false, "number", "58")}
              <Field label="BMI (calculated)">
                <Input value={bmi || ""} disabled placeholder="kg/m²" />
              </Field>
            </Section>

            <Section title="Smoking history">
              {select("smokingStatus", "Smoking status", SMOKING_STATUS)}
              {select("smokingType", "Smoking type", ["", ...SMOKING_TYPE])}
              {input("smokingYears", "Smoking duration (years)", false, "number")}
              {input("packYears", "Pack-years", false, "number")}
              {input(
                "yearsSinceQuitting",
                "Years since quitting",
                false,
                "number",
              )}
            </Section>

            <Section title="Tobacco chewing">
              {select("tobaccoChewingStatus", "Tobacco chewing", TOBACCO_STATUS)}
              {input(
                "tobaccoIntakesPerDay",
                "Tobacco intakes/day",
                false,
                "number",
              )}
              {input("tobaccoYears", "Tobacco duration (years)", false, "number")}
            </Section>

            <Section title="Alcohol use">
              {select("alcoholStatus", "Alcohol status", ALCOHOL_STATUS)}
              {input("alcoholGPerDay", "Alcohol (g/day)", false, "number")}
              {input("alcoholGPerWeek", "Alcohol (g/week)", false, "number")}
            </Section>

            <Section title="Comorbidities and drug exposure">
              {textarea(
                "comorbidIllnesses",
                "Comorbid illnesses (separate with semicolons)",
              )}
              {select("ocpUse", "Oral contraceptive use", OCP_USE)}
              {select("nsaidUse", "NSAID use", NSAID_USE)}
              {select(
                "nsaidFrequency",
                "NSAID frequency",
                ["", ...NSAID_FREQUENCY],
              )}
            </Section>

            <Section title="Risk factors">
              {select("appendectomyHistory", "H/O appendectomy", YES_NO)}
              {input(
                "ageAtAppendectomyYears",
                "Age at appendectomy (years)",
                false,
                "number",
              )}
              {input(
                "onsetAppendectomyIntervalMonths",
                "Disease onset–appendectomy interval (months)",
                false,
                "number",
              )}
              {textarea("otherRiskFactors", "Other risk factors")}
            </Section>
          </div>
        )}

        {step === 1 && (
          <Section title="Physical examination">
            {textarea("generalSurvey", "General survey")}
            {input("anemia", "Anemia")}
            {input("oedema", "Oedema")}
            {input("jaundice", "Jaundice")}
            {input("peripheralLymphNodes", "Peripheral lymph nodes")}
            {input("skinRash", "Skin rash")}
            {textarea("otherPositiveFindings", "Other positive findings")}
            {textarea("abdominalExamination", "Abdominal examination")}
            {textarea("otherSystemExamination", "Other system examination")}
          </Section>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <MayoScoreSection
              stoolFrequency={form.mayoStoolFrequency}
              rectalBleeding={form.mayoRectalBleeding}
              endoscopicFindings={form.mayoEndoscopicFindings}
              physicianGlobal={form.mayoPhysicianGlobalAssessment}
              partialMayoScore={mayoScores.partialMayoScore}
              completeMayoScore={mayoScores.completeMayoScore}
              errors={errors}
              onChange={(key, value) =>
                set(key as keyof VisitFormState, value)
              }
            />

            <Section title="Clinical follow-up">
              {select("clinicalState", "Clinical state", CLINICAL_STATE)}
              {textarea("complication", "Complication")}
              {input("newEim", "New EIM")}
              {input("uceis", "UCEIS", false, "number")}
              {select("admission", "Admission", YES_NO)}
              {textarea("specialComment", "Special comment")}
            </Section>

            <Section title="Montreal classification">
              {select("montrealExtent", "Montreal extent", DISEASE_EXTENT)}
              {select("montrealSeverity", "Montreal severity", MONTREAL_SEVERITY)}
            </Section>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                Review visit summary
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Visit type", form.type],
                  ["Date", form.date],
                  ["Clinical state", form.clinicalState],
                  [
                    "Montreal",
                    `${form.montrealExtent} / ${form.montrealSeverity}`,
                  ],
                  [
                    "Partial Mayo",
                    mayoScores.partialMayoScore !== undefined
                      ? `${mayoScores.partialMayoScore} (${partialMayoSeverity(mayoScores.partialMayoScore)})`
                      : "—",
                  ],
                  [
                    "Complete Mayo",
                    mayoScores.completeMayoScore !== undefined
                      ? `${mayoScores.completeMayoScore} (${completeMayoSeverity(mayoScores.completeMayoScore)})`
                      : "—",
                  ],
                  [
                    "Mayo endoscopic (III)",
                    mayoScores.mayoEndoscopicScore ?? "—",
                  ],
                  [
                    "Weight / BMI",
                    form.weightKg ? `${form.weightKg} kg · ${bmi || "—"}` : "—",
                  ],
                  ["Smoking", form.smokingStatus],
                  ["NSAID use", form.nsaidUse],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex justify-between gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={next}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={submit}>
              <Check className="size-4" />
              Save visit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
