"use client";

import type { ValidationIssue } from "@/types/clinical-report";
import { Badge, Card } from "@/components/ui/core";

export function RecordValidationPanel({
  issues,
  onClose,
}: {
  issues: ValidationIssue[];
  onClose?: () => void;
}) {
  if (!issues.length) {
    return (
      <Card className="p-4 text-sm text-slate-600">
        No validation issues recorded for this row.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900">Validation issues</h4>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Close
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-2">
        {issues.map((issue, index) => (
          <li
            key={`${issue.field}-${index}`}
            className="flex items-start gap-2 text-xs text-slate-700"
          >
            <Badge tone={issue.severity === "error" ? "red" : "amber"}>
              {issue.severity}
            </Badge>
            <span>
              <span className="font-semibold">{issue.field}</span>:{" "}
              {issue.message}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
