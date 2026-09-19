"use client";

import { Check, Circle } from "lucide-react";
import type { SectionStatusItem } from "@/lib/patient-section-status";

export function SectionDataChecklist({
  items,
  onSelectSection,
}: {
  items: SectionStatusItem[];
  onSelectSection?: (key: string) => void;
}) {
  const available = items.filter((i) => i.available).length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Section data checklist</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {available} of {items.length} sections have at least one entry.
          </p>
        </div>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              disabled={!onSelectSection}
              onClick={() => onSelectSection?.(item.key)}
              className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                item.available
                  ? "border-teal-100 bg-teal-50/40 text-teal-950"
                  : "border-slate-100 bg-slate-50 text-slate-600"
              } ${onSelectSection ? "hover:ring-1 hover:ring-teal-200" : "cursor-default"}`}
            >
              {item.available ? (
                <Check className="mt-0.5 size-4 shrink-0 text-teal-700" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-slate-300" />
              )}
              <span className="min-w-0 flex-1">
                <span className="font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-xs opacity-80">
                  {item.available
                    ? `${item.count} record${item.count === 1 ? "" : "s"}`
                    : "Missing — add data"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
