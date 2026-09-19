"use client";

import { toast } from "sonner";
import { Badge, Button } from "@/components/ui/core";
import type { Patient } from "@/types/clinical";
import {
  getDefaultPhoneContact,
  getPatientDisplayPhone,
  type DefaultPhoneContact,
} from "@/lib/patient-contact";

export function PatientPhoneDefaultEditor({
  patient,
  onUpdate,
}: {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
}) {
  const defaultContact = getDefaultPhoneContact(patient);
  const display = getPatientDisplayPhone(patient);

  const setDefault = (contact: DefaultPhoneContact) => {
    if (contact === "alternate" && !patient.alternatePhone?.trim()) {
      toast.error("Add an alternate phone before setting it as default.");
      return;
    }
    onUpdate({ ...patient, defaultPhoneContact: contact });
    toast.success(
      contact === "primary"
        ? "Primary phone set as default contact"
        : "Alternate phone set as default contact",
    );
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Contact numbers
        </p>
        <Badge tone="teal">Default: {display}</Badge>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">Primary</p>
            <p className="font-semibold text-slate-800">{patient.phone}</p>
          </div>
          {defaultContact === "primary" ? (
            <Badge tone="green">Default</Badge>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setDefault("primary")}>
              Set as default
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <div>
            <p className="text-xs text-slate-500">Alternate</p>
            <p className="font-semibold text-slate-800">
              {patient.alternatePhone?.trim() || "Not recorded"}
            </p>
          </div>
          {defaultContact === "alternate" ? (
            <Badge tone="green">Default</Badge>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={!patient.alternatePhone?.trim()}
              onClick={() => setDefault("alternate")}
            >
              Set as default
            </Button>
          )}
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        The default number is used in patient search, directory listings, and the
        clinical dataset report.
      </p>
    </div>
  );
}
