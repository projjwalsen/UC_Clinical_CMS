"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  buildPouchoscopyFormState,
  pouchoscopyFormToRecord,
  pouchoscopyRecordToFormState,
  type PouchoscopyFormState,
} from "@/lib/pouchoscopy-utils";
import { Button, Field, Input, Textarea } from "@/components/ui/core";
import type { PouchoscopyRecord } from "@/types/clinical";

export function PouchoscopyForm({
  patientId,
  serialNumber,
  editingRecord,
  onCancel,
  onSave,
}: {
  patientId: string;
  serialNumber: number;
  editingRecord?: PouchoscopyRecord | null;
  onCancel: () => void;
  onSave: (record: PouchoscopyRecord) => void;
}) {
  const [form, setForm] = useState<PouchoscopyFormState>(() =>
    editingRecord
      ? pouchoscopyRecordToFormState(editingRecord)
      : buildPouchoscopyFormState(),
  );
  const [recordId] = useState(
    () => editingRecord?.id ?? `POUCH-${patientId}-${Date.now()}`,
  );
  const [slNo] = useState(() => editingRecord?.serialNumber ?? serialNumber);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof PouchoscopyFormState>(
    key: K,
    value: PouchoscopyFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Date of follow-up is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      pouchoscopyFormToRecord(
        form,
        patientId,
        recordId,
        slNo,
      ),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Sl. No">
            <Input value={String(slNo)} disabled />
          </Field>
          <Field label="Date of FU" required error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </Field>
          <Field label="Acute inflammation">
            <Textarea
              value={form.acuteInflammation}
              onChange={(e) => update("acuteInflammation", e.target.value)}
              placeholder="Histologic acute inflammation"
            />
          </Field>
          <Field label="Chronic inflammation">
            <Textarea
              value={form.chronicInflammation}
              onChange={(e) => update("chronicInflammation", e.target.value)}
              placeholder="Histologic chronic inflammation"
            />
          </Field>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-teal-700"
              checked={form.histologyAttachmentChecked}
              onChange={(e) => {
                update("histologyAttachmentChecked", e.target.checked);
                if (!e.target.checked) {
                  update("histologyAttachmentFileName", "");
                }
              }}
            />
            <span>
              <span className="text-sm font-semibold text-slate-800">
                Check attachment
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Optional histology report or image (filename stored in demo
                only).
              </span>
            </span>
          </label>
          {form.histologyAttachmentChecked && (
            <div className="mt-3">
              <Field label="Attachment file">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    update("histologyAttachmentFileName", file?.name ?? "");
                  }}
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save record
        </Button>
      </div>
    </div>
  );
}
