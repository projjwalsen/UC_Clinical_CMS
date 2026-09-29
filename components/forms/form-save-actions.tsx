"use client";

import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/core";

export function FormSaveActions({
  onCancel,
  onSave,
  onSaveAndContinue,
  saveLabel = "Save",
  continueHint,
}: {
  onCancel: () => void;
  onSave: () => void;
  onSaveAndContinue?: () => void;
  saveLabel?: string;
  /** Shown on the continue button, e.g. “Symptoms”. */
  continueHint?: string | null;
}) {
  const continueLabel = continueHint
    ? `Save and continue to ${continueHint}`
    : "Save and continue";

  return (
    <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-5">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave}>
        <Check className="size-4" />
        {saveLabel}
      </Button>
      {onSaveAndContinue && (
        <Button variant="secondary" onClick={onSaveAndContinue}>
          {continueLabel}
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
