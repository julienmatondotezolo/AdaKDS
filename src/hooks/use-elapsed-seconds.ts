'use client';

import { useEffect, useRef, useState } from 'react';

export interface ElapsedTime {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  formatted: string;
  frozen: boolean;
}

/**
 * Live elapsed counter. If `endIso` is provided, the value is fixed at
 * `endIso - startIso` and does not tick. If `endIso` is null/undefined but
 * `freeze` is true, the value freezes at the current time at that moment
 * (and never ticks again).
 */
export function useElapsedSeconds(
  startIso: string | undefined | null,
  endIso?: string | undefined | null,
  freeze: boolean = false
): ElapsedTime {
  const frozenAtRef = useRef<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const isFrozen = !!endIso || freeze;

  useEffect(() => {
    if (isFrozen) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isFrozen]);

  if (!startIso) {
    return { totalSeconds: 0, minutes: 0, seconds: 0, formatted: '00:00', frozen: isFrozen };
  }

  const start = new Date(startIso).getTime();
  let end: number;
  if (endIso) {
    end = new Date(endIso).getTime();
  } else if (freeze) {
    if (frozenAtRef.current === null) frozenAtRef.current = now;
    end = frozenAtRef.current;
  } else {
    end = now;
  }

  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { totalSeconds, minutes, seconds, formatted, frozen: isFrozen };
}
