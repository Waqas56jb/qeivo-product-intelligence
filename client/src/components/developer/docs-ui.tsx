"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { MethodBadge } from "./api-bits";
import { CodeBlock, CodeTabs, type CodeExample } from "./code-block";
import type { HttpMethod } from "./dev-data";

export interface DocSection {
  id: string;
  label: string;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [ids]);
  return [active, setActive] as const;
}

/** Docs shell: sticky sidebar with active-section tracking on desktop, sticky jump-select on mobile. */
export function DocsLayout({ sections, children }: { sections: DocSection[]; children: React.ReactNode }) {
  const [ids] = useState(() => sections.map((s) => s.id));
  const [active, setActive] = useActiveSection(ids);
  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };
  return (
    <div className="lg:grid lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-10 2xl:gap-14">
      <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
        <Select value={active} onValueChange={go}>
          <SelectTrigger aria-label="Jump to section" className="h-11">
            <span className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav aria-label="Documentation" className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">API reference</p>
          <ul className="space-y-0.5 border-l border-border">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(s.id);
                  }}
                  aria-current={active === s.id ? "location" : undefined}
                  className={cn(
                    "-ml-px flex min-h-9 items-center border-l-2 px-3 text-[13px] font-medium transition-colors",
                    active === s.id ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 px-3 text-[12px] leading-relaxed text-subtle-foreground">Version 2026-11-01 · preview</p>
        </div>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function DocSectionBlock({ id, title, eyebrow, children, className }: { id: string; title: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-32 border-b border-border pb-12 pt-2 last:border-0 lg:scroll-mt-24", className)}>
      {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-soft-foreground">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="mt-1 text-[24px] font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 space-y-5 text-[15px] leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">{children}</div>
    </section>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded-[5px] border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>;
}

export interface Param {
  name: string;
  in: "path" | "query" | "body" | "header";
  type: string;
  required?: boolean;
  description: string;
}

export function ParamsTable({ params, title = "Parameters" }: { params: Param[]; title?: string }) {
  return (
    <div className="min-w-0">
      <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">{title}</h4>
      <ul className="divide-y divide-border rounded-[12px] border border-border bg-card">
        {params.map((p) => (
          <li key={p.name} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <code className="font-mono text-[13px] font-semibold text-foreground">{p.name}</code>
              <span className="font-mono text-[11px] text-subtle-foreground">{p.type}</span>
              <span className="rounded-[5px] bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{p.in}</span>
              {p.required ? <span className="text-[11px] font-semibold text-danger-foreground">required</span> : <span className="text-[11px] text-subtle-foreground">optional</span>}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EndpointCard({
  method,
  path,
  title,
  description,
  params,
  examples,
  response,
  responseStatus = "200 OK",
  scope,
}: {
  method: HttpMethod;
  path: string;
  title: string;
  description: React.ReactNode;
  params?: Param[];
  examples: CodeExample[];
  response: string;
  responseStatus?: string;
  scope?: string;
}) {
  return (
    <article className="min-w-0 rounded-[20px] border border-border bg-card p-4 shadow-xs sm:p-6" aria-label={`${method} ${path}`}>
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
        <MethodBadge method={method} className="h-6 text-[11px]" />
        <code className="min-w-0 break-all font-mono text-[14px] font-semibold text-foreground">{path}</code>
        {scope && <span className="rounded-[6px] border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{scope}</span>}
      </div>
      <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
      <div className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{description}</div>
      <div className="mt-5 grid min-w-0 gap-5 2xl:grid-cols-2">
        {params && params.length > 0 ? <ParamsTable params={params} /> : <p className="text-[13px] text-subtle-foreground">No parameters.</p>}
        <div className="min-w-0 space-y-4">
          <CodeTabs examples={examples} title="Request" />
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">
              Response <span className="rounded-full bg-success-soft px-2 py-0.5 font-mono text-[11px] normal-case tracking-normal text-success">{responseStatus}</span>
            </p>
            <CodeBlock code={response} language="json" title="application/json" maxHeight={420} />
          </div>
        </div>
      </div>
    </article>
  );
}
