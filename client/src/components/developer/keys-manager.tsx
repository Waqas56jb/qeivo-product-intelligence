"use client";

import { useState } from "react";
import { KeyRound, Lock, ShieldCheck, TimerReset } from "lucide-react";
import { apiScopes } from "@/data/api/keys";
import { FilterChip } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { PreviewNotice } from "./api-bits";
import { ApiKeyRow, CreateKeyDialog } from "./api-keys";
import { useApiKeyStore } from "./api-key-store";

type Filter = "all" | "live" | "test" | "revoked";

export function KeysManager() {
  const keys = useApiKeyStore((s) => s.keys);
  const [filter, setFilter] = useState<Filter>("all");
  const active = keys.filter((k) => k.status === "active");
  const list = keys.filter((k) => (filter === "all" ? true : filter === "revoked" ? k.status === "revoked" : k.status === "active" && k.environment === filter));
  const counts: Record<Filter, number> = {
    all: keys.length,
    live: active.filter((k) => k.environment === "live").length,
    test: active.filter((k) => k.environment === "test").length,
    revoked: keys.filter((k) => k.status === "revoked").length,
  };

  return (
    <PageContainer size="wide">
      <PageHeader eyebrow="Developer" title="API keys" description="Create scoped keys for each integration. Keys are shown once at creation; afterwards only a short identifier is visible." actions={<CreateKeyDialog />} />
      <PreviewNotice className="mb-6" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="keys-title" className="min-w-0 rounded-[14px] border border-border bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 id="keys-title" className="text-[15px] font-semibold tracking-tight">Keys</h2>
              <p className="text-[12px] text-muted-foreground tabular">
                {active.length} active · {counts.revoked} revoked
              </p>
            </div>
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter keys">
              {(["all", "live", "test", "revoked"] as Filter[]).map((f) => (
                <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)} count={counts[f]}>
                  {f === "all" ? "All" : f === "live" ? "Live" : f === "test" ? "Test" : "Revoked"}
                </FilterChip>
              ))}
            </div>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_140px_44px] gap-x-5 border-b border-border bg-surface-2/50 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-subtle-foreground lg:grid">
            <span>Name & key</span>
            <span>Scopes</span>
            <span>Created · last used</span>
            <span>Monthly usage</span>
            <span className="sr-only">Actions</span>
          </div>
          {list.length ? (
            <ul className="divide-y divide-border">
              {list.map((k) => (
                <ApiKeyRow key={k.id} k={k} />
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState compact icon={KeyRound} title="No keys here" description="Nothing matches this filter yet." />
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="scopes-title" className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5">
            <h2 id="scopes-title" className="text-[15px] font-semibold tracking-tight">Scopes</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Read-only by default. Write scopes never change Qeivo scores.</p>
            <ul className="mt-4 space-y-3">
              {apiScopes.map((s) => (
                <li key={s.scope}>
                  <p className="font-mono text-[12px] font-medium">{s.scope}</p>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="practice-title" className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5">
            <h2 id="practice-title" className="text-[15px] font-semibold tracking-tight">Good practice</h2>
            <ul className="mt-3 space-y-3 text-[13px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2.5">
                <Lock className="mt-0.5 size-4 shrink-0 text-brand" /> Keep keys server-side. Never ship a live key in a browser or mobile bundle.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" /> One key per integration, with the narrowest scopes it needs.
              </li>
              <li className="flex gap-2.5">
                <TimerReset className="mt-0.5 size-4 shrink-0 text-brand" /> Rotate live keys every 90 days, and immediately if one may have leaked.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
