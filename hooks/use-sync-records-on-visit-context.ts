"use client";

import { useEffect, useRef } from "react";
import { filterRecordsByVisitContext } from "@/lib/record-visit-matching";
import type { Visit } from "@/types/clinical";

export function useSyncRecordsOnVisitContext<T extends { date: string; visitId?: string }>({
  visitId,
  date,
  visits,
  pool,
  enabled,
  onMatched,
}: {
  visitId: string;
  date: string;
  visits: Visit[];
  pool: T[];
  enabled: boolean;
  onMatched: (records: T[]) => void;
}) {
  const skipNext = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const matched = filterRecordsByVisitContext(pool, { visitId, date, visits });
    if (matched.length) onMatched(matched);
  }, [visitId, date, visits, pool, enabled, onMatched]);

  return {
    markSkipNextSync: () => {
      skipNext.current = true;
    },
  };
}
