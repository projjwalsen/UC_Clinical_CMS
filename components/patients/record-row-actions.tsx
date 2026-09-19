"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/core";

export function RecordRowActions({
  onEdit,
  onDelete,
  deleteLabel = "Delete this entry?",
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="Edit"
        onClick={onEdit}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label="Delete"
        onClick={() => {
          if (window.confirm(deleteLabel)) onDelete();
        }}
      >
        <Trash2 className="size-4 text-red-600" />
      </Button>
    </div>
  );
}
