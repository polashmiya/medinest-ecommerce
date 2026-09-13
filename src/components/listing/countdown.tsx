"use client";

import { useEffect, useState } from "react";

/** Counts down to the end of the current day (flash-sale window). */
export function Countdown({ label = "Ends in" }: { label?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      setLeft(Math.max(0, end.getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const parts = left === null ? ["--", "--", "--"] : [left / 3_600_000, (left / 60_000) % 60, (left / 1000) % 60].map((n) => String(Math.floor(n)).padStart(2, "0"));
  return (
    <div className="flex items-center gap-3 self-start rounded-2xl bg-discount/10 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-wide text-discount">{label}</span>
      <span className="flex items-center gap-1 font-mono text-lg font-extrabold tabular-nums text-fg" aria-live="off" suppressHydrationWarning>
        {parts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="rounded-md bg-surface px-1.5 py-0.5 shadow-sm">{p}</span>
            {i < 2 ? <span className="text-discount">:</span> : null}
          </span>
        ))}
      </span>
    </div>
  );
}
