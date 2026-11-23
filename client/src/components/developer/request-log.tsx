"use client";

import { useMemo, useState } from "react";
import type { RequestLogEntry } from "./dev-data";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { FilterChip } from "@/components/common/controls";
import { EnvBadge, MethodBadge, StatusCode } from "./api-bits";

const time = (iso: string) => formatDate(iso, "HH:mm:ss");

/** Request log: table on md+, stacked rows on phones. */
export function RequestLog({ entries, className, filterable = true }: { entries: RequestLogEntry[]; className?: string; filterable?: boolean }) {
  const [f, setF] = useState<"all" | "ok" | "err">("all");
  const rows = useMemo(() => entries.filter((e) => (f === "all" ? true : f === "ok" ? e.status < 400 : e.status >= 400)), [entries, f]);
  return (
    <div className={cn("min-w-0", className)}>
      {filterable && (
        <div className="flex gap-2 border-b border-border px-4 py-2.5 sm:px-5" role="group" aria-label="Filter requests">
          <FilterChip active={f === "all"} onClick={() => setF("all")} count={entries.length}>
            All
          </FilterChip>
          <FilterChip active={f === "ok"} onClick={() => setF("ok")} count={entries.filter((e) => e.status < 400).length}>
            2xx
          </FilterChip>
          <FilterChip active={f === "err"} onClick={() => setF("err")} count={entries.filter((e) => e.status >= 400).length}>
            Errors
          </FilterChip>
        </div>
      )}
      <div className="hidden md:block">
        <table className="w-full table-fixed text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/50 text-[11px] uppercase tracking-wider text-subtle-foreground">
              <th scope="col" className="w-[88px] px-5 py-2 text-left font-medium">Time</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Request</th>
              <th scope="col" className="w-[72px] px-3 py-2 text-left font-medium">Status</th>
              <th scope="col" className="w-[88px] px-3 py-2 text-right font-medium">Latency</th>
              <th scope="col" className="hidden w-[200px] px-5 py-2 text-left font-medium xl:table-cell">Key</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                <td className="px-5 py-2.5 font-mono text-[12px] tabular text-muted-foreground">
                  <time dateTime={r.time}>{time(r.time)}</time>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <MethodBadge method={r.method} />
                    <span className="truncate font-mono text-[12px]" title={r.path}>
                      {r.path}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <StatusCode status={r.status} />
                </td>
                <td className={cn("px-3 py-2.5 text-right font-mono text-[12px] tabular", r.latencyMs > 400 ? "text-warning-foreground" : "text-muted-foreground")}>{r.latencyMs} ms</td>
                <td className="hidden px-5 py-2.5 xl:table-cell">
                  <span className="flex min-w-0 items-center gap-2">
                    <EnvBadge env={r.environment} />
                    <span className="truncate text-[12px] text-muted-foreground">{r.keyName}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="space-y-1.5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <MethodBadge method={r.method} />
                <StatusCode status={r.status} />
              </span>
              <span className="font-mono text-[11px] tabular text-subtle-foreground">
                {time(r.time)} · {r.latencyMs} ms
              </span>
            </div>
            <p className="break-all font-mono text-[12px] leading-snug">{r.path}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
