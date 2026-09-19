"use client";

export function VisitLinkedDataBanner({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
      {message}
    </p>
  );
}
