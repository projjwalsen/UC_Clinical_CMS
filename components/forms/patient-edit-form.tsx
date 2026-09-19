"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/core";
import type { Patient } from "@/types/clinical";
import { KuppuswamySection } from "@/components/forms/kuppuswamy-section";
import { OccupationSocioSection } from "@/components/forms/occupation-socio-section";
import {
  DEMO_COUNTRIES,
  INDIAN_STATES_AND_UTS,
} from "@/data/geo-lookups";
import {
  applyPersonalFormToPatient,
  computeAgeFromDob,
  patientToPersonalForm,
  validatePersonalForm,
  type PatientPersonalFormState,
} from "@/lib/patient-form-mappers";

export function PatientEditForm({
  patient,
  onCancel,
  onSaved,
}: {
  patient: Patient;
  onCancel: () => void;
  onSaved: (patient: Patient) => void;
}) {
  const [form, setForm] = useState<PatientPersonalFormState>(() =>
    patientToPersonalForm(patient),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const age = useMemo(
    () => computeAgeFromDob(form.dateOfBirth),
    [form.dateOfBirth],
  );

  const set = <K extends keyof PatientPersonalFormState>(
    key: K,
    value: PatientPersonalFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = () => {
    const nextErrors = validatePersonalForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const updated = applyPersonalFormToPatient(patient, form);
    onSaved(updated);
    toast.success("Personal information updated");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <section>
          <h3 className="text-sm font-bold text-slate-900">Identification</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="UC ID">
              <Input value={patient.id} disabled />
            </Field>
            <Field label="IBD code (research ID)">
              <Input
                value={form.ibdCode}
                onChange={(e) => set("ibdCode", e.target.value)}
                placeholder="Optional"
              />
            </Field>
            <Field label="Patient name" required error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Date of birth" required error={errors.dateOfBirth}>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
              />
            </Field>
            <Field label="Age (calculated)">
              <Input value={age || ""} disabled />
            </Field>
            <Field label="Gender" required>
              <Select
                className="w-full"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                {["Female", "Male", "Other"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field label="Registration date">
              <Input
                type="date"
                value={form.registrationDate}
                onChange={(e) => set("registrationDate", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900">Contact &amp; address</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Present address" required error={errors.address}>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <Field label="City / village" required error={errors.city}>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
            <Field label="State" required error={errors.state}>
              <Select
                className="w-full"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              >
                <option value="">Select state</option>
                {INDIAN_STATES_AND_UTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Country" required error={errors.country}>
              <Select
                className="w-full"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              >
                {DEMO_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="PIN code" error={errors.pinCode}>
              <Input
                value={form.pinCode}
                onChange={(e) => set("pinCode", e.target.value)}
              />
            </Field>
            <Field label="Police station">
              <Input
                value={form.policeStation}
                onChange={(e) => set("policeStation", e.target.value)}
              />
            </Field>
            <Field label="Primary phone" required error={errors.phone}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field label="Alternate phone" error={errors.alternatePhone}>
              <Input
                type="tel"
                value={form.alternatePhone}
                onChange={(e) => set("alternatePhone", e.target.value)}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900">Demographics</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Religion">
              <Select
                className="w-full"
                value={form.religion}
                onChange={(e) => set("religion", e.target.value)}
              >
                {["Hindu", "Muslim", "Christian", "Sikh", "Other"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Marital status">
              <Select
                className="w-full"
                value={form.maritalStatus}
                onChange={(e) => set("maritalStatus", e.target.value)}
              >
                {["Single", "Married", "Separated", "Widowed"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Number of children">
              <Input
                type="number"
                min={0}
                value={form.children}
                onChange={(e) => set("children", e.target.value)}
              />
            </Field>
            <Field label="Diet">
              <Select
                className="w-full"
                value={form.diet}
                onChange={(e) => set("diet", e.target.value)}
              >
                {["Vegetarian", "Non-vegetarian", "Vegan"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <KuppuswamySection
          education={form.education}
          occupation={form.occupation}
          monthlyFamilyIncome={form.monthlyFamilyIncome}
          onEducationChange={(value) => set("education", value)}
          onOccupationChange={(value) => set("occupation", value)}
          onIncomeChange={(value) => set("monthlyFamilyIncome", value)}
          errors={{
            education: errors.education,
            occupation: errors.occupation,
            monthlyFamilyIncome: errors.monthlyFamilyIncome,
          }}
        />

        <OccupationSocioSection
          wageLossPerMonthRs={form.wageLossPerMonthRs}
          daysAbsentFromWorkPerMonth={form.daysAbsentFromWorkPerMonth}
          treatmentCostPerMonthRs={form.treatmentCostPerMonthRs}
          otherSocioEconomicInfo={form.otherSocioEconomicInfo}
          onChange={(key, value) =>
            set(key as keyof PatientPersonalFormState, value)
          }
        />

        <Field label="Care notes">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save changes
        </Button>
      </div>
    </div>
  );
}
