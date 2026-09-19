import type { Visit } from "@/types/clinical";

export type VisitContext = {
  date: string;
  visitId?: string;
};

export function resolveVisitContext(
  visits: Visit[],
  visitId: string,
  formDate: string,
): VisitContext {
  const visit = visits.find((v) => v.id === visitId);
  return {
    date: visit?.date ?? formDate,
    visitId: visitId || undefined,
  };
}

export function recordMatchesVisitContext(
  record: { date: string; visitId?: string },
  context: VisitContext,
): boolean {
  if (context.visitId && record.visitId === context.visitId) return true;
  if (record.date === context.date) {
    if (!context.visitId || !record.visitId) return true;
    return record.visitId === context.visitId;
  }
  return false;
}

export function filterRecordsByVisitContext<T extends { date: string; visitId?: string }>(
  records: T[],
  opts: { visits: Visit[]; visitId: string; date: string },
): T[] {
  const context = resolveVisitContext(opts.visits, opts.visitId, opts.date);
  return records.filter((record) => recordMatchesVisitContext(record, context));
}

export function assessmentGroupKey(record: { date: string; visitId?: string }) {
  return `${record.date}|${record.visitId ?? ""}`;
}
