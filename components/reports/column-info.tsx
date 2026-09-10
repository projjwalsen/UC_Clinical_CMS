"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { reportFieldMetadata } from "@/config/report-field-metadata";

export function ColumnInfo({ fieldKey }: { fieldKey: string }) {
  const meta = reportFieldMetadata[fieldKey];
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showTooltip = () => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipPos({
      left: rect.left + rect.width / 2,
      top: rect.bottom + 8,
    });
    setHover(true);
  };

  const hideTooltip = () => {
    setHover(false);
    setTooltipPos(null);
  };

  if (!meta) return null;

  const label = `Show scoring information for ${meta.label}`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-describedby={hover ? tooltipId : undefined}
        className="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={() => {
          hideTooltip();
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            hideTooltip();
            setOpen(true);
          }
        }}
      >
        <Info className="size-3.5" />
      </button>

      {hover &&
        !open &&
        tooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 text-[10px] leading-snug text-white shadow-lg"
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
          >
            {meta.shortDescription}
          </span>,
          document.body,
        )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-slate-950/40 md:bg-slate-950/30" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-[120] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl">
            <Dialog.Title className="text-base font-bold text-slate-900">
              {meta.label}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-slate-600">
              {meta.shortDescription}
            </Dialog.Description>
            <dl className="mt-4 space-y-3 text-xs text-slate-700">
              <div>
                <dt className="font-bold text-slate-500">Input type</dt>
                <dd>{meta.inputType}</dd>
              </div>
              {meta.unit && (
                <div>
                  <dt className="font-bold text-slate-500">Unit</dt>
                  <dd>{meta.unit}</dd>
                </div>
              )}
              {meta.allowedValues?.length ? (
                <div>
                  <dt className="font-bold text-slate-500">Code mapping</dt>
                  <dd className="mt-1 space-y-1">
                    {meta.allowedValues.map((item) => (
                      <p key={String(item.code)}>
                        <span className="font-semibold">{item.code}</span> ={" "}
                        {item.label}
                        {item.description ? ` — ${item.description}` : ""}
                      </p>
                    ))}
                  </dd>
                </div>
              ) : null}
              {meta.calculation && (
                <div>
                  <dt className="font-bold text-slate-500">Calculation</dt>
                  <dd>{meta.calculation}</dd>
                </div>
              )}
              {meta.applicability && (
                <div>
                  <dt className="font-bold text-slate-500">Applicability</dt>
                  <dd>{meta.applicability}</dd>
                </div>
              )}
              {meta.denominatorRule && (
                <div>
                  <dt className="font-bold text-slate-500">Statistical rule</dt>
                  <dd>{meta.denominatorRule}</dd>
                </div>
              )}
              <div>
                <dt className="font-bold text-slate-500">Missing value</dt>
                <dd>{meta.missingValueRule}</dd>
              </div>
              {meta.warning && (
                <div>
                  <dt className="font-bold text-amber-700">Note</dt>
                  <dd className="text-amber-800">{meta.warning}</dd>
                </div>
              )}
            </dl>
            <div className="mt-5 flex justify-end">
              <Dialog.Close className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
