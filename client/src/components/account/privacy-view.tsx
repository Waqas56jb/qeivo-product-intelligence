"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, Cookie, Download, Eye, FileJson, FileSpreadsheet, Fingerprint, Loader2, RotateCcw, ShieldCheck, SlidersHorizontal, Trash2 } from "lucide-react";
import { routes } from "@/config/routes";
import { DEMO_NOW, cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useAppStore, type AppState } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Progress, RadioCard, RadioGroup } from "@/components/ui/primitives";
import { ConfirmationDialog } from "@/components/common/controls";
import { LoadingSkeleton } from "@/components/common/states";
import { DemoPill, SettingsCard, SwitchRow, wait } from "./fields";

/* ------------------------------------------------------------- datasets */
type DatasetId = "profile" | "preferences" | "research" | "alerts" | "activity" | "usage";
const DATASETS: { id: DatasetId; label: string; body: string; pick: (s: AppState) => Record<string, unknown> }[] = [
  { id: "profile", label: "Profile", body: "Name, email, location, bio", pick: (s) => ({ profile: s.profile, role: s.role }) },
  { id: "preferences", label: "Preferences & priorities", body: "Budget, household, space, region, factor weights", pick: (s) => ({ preferences: s.preferences, region: s.region, priorities: s.priorities, onboardingComplete: s.onboardingComplete }) },
  { id: "research", label: "Saved research", body: "Saved products, compare list, notes, saved videos", pick: (s) => ({ saved: s.saved, compare: s.compare, notes: s.notes, savedVideos: s.savedVideos, checklists: s.checklists }) },
  { id: "alerts", label: "Price alerts", body: "Watchlist targets and alert settings", pick: (s) => ({ watchlist: s.watchlist, alertPrefs: s.alertPrefs }) },
  { id: "activity", label: "Activity", body: "Recently viewed, votes, helpful marks, reports", pick: (s) => ({ recentlyViewed: s.recentlyViewed, votes: s.votes, helpful: s.helpful, reported: s.reported, readNotifications: s.readNotifications }) },
  { id: "usage", label: "Plan & usage", body: "Plan and Ask Qeivo usage", pick: (s) => ({ plan: s.plan, chatUsed: s.chatUsed }) },
];

function toCsv(data: Record<string, unknown>): string {
  const rows: string[] = ["dataset,key,value"];
  for (const [dataset, value] of Object.entries(data)) {
    if (dataset === "meta") continue;
    const flat = (prefix: string, v: unknown) => {
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        for (const [k, inner] of Object.entries(v as Record<string, unknown>)) flat(prefix ? `${prefix}.${k}` : k, inner);
      } else {
        const str = Array.isArray(v) ? JSON.stringify(v) : String(v);
        rows.push([dataset, prefix, `"${str.replace(/"/g, '""')}"`].join(","));
      }
    };
    flat("", value);
  }
  return rows.join("\n");
}

function ExportSection() {
  const [selected, setSelected] = useState<DatasetId[]>(["profile", "preferences", "research", "alerts"]);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [phase, setPhase] = useState<"idle" | "preparing" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<{ url: string; name: string; size: number } | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const toggle = (id: DatasetId) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    if (phase === "ready") setPhase("idle");
  };

  const prepare = async () => {
    setPhase("preparing");
    setProgress(8);
    for (const p of [32, 61, 88]) {
      await wait(280);
      setProgress(p);
    }
    const state = useAppStore.getState();
    const payload: Record<string, unknown> = {
      meta: { exportedAt: DEMO_NOW.toISOString(), source: "Qeivo demo — local browser data only", datasets: selected, note: "Generated in your browser. Nothing was sent to a server." },
    };
    for (const d of DATASETS) if (selected.includes(d.id)) payload[d.id] = d.pick(state);
    const content = format === "json" ? JSON.stringify(payload, null, 2) : toCsv(payload);
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    await wait(250);
    setProgress(100);
    setFile({ url, name: `qeivo-export-2026-11-23.${format}`, size: blob.size });
    setPhase("ready");
    toast.success("Export prepared (demo)", { description: "Built from this browser's local demo data — nothing left your device." });
  };

  return (
    <SettingsCard id="export" icon={Download} title="Export your data" description="Choose what to include. The file is generated locally from your demo data." actions={<DemoPill>Local file</DemoPill>}>
      <fieldset>
        <legend className="mb-3 text-[13px] font-medium">Datasets</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {DATASETS.map((d) => {
            const on = selected.includes(d.id);
            return (
              <label key={d.id} htmlFor={`ex-${d.id}`} className={cn("flex min-h-12 cursor-pointer items-start gap-3 rounded-[12px] border p-3.5 transition-colors", on ? "border-brand/60 bg-brand-soft/30" : "border-border hover:border-border-strong")}>
                <Checkbox id={`ex-${d.id}`} checked={on} onCheckedChange={() => toggle(d.id)} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium leading-tight">{d.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{d.body}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="mb-3 text-[13px] font-medium">Format</legend>
        <RadioGroup
          value={format}
          onValueChange={(v) => {
            setFormat(v as "json" | "csv");
            if (phase === "ready") setPhase("idle");
          }}
          className="grid grid-cols-2 gap-2 sm:max-w-[420px]"
        >
          <RadioCard value="json" className="items-center gap-2.5 p-3">
            <FileJson className="size-4 text-brand" />
            <span>
              <span className="block text-[13.5px] font-medium leading-tight">JSON</span>
              <span className="block text-[11.5px] text-muted-foreground">Structured, complete</span>
            </span>
          </RadioCard>
          <RadioCard value="csv" className="items-center gap-2.5 p-3">
            <FileSpreadsheet className="size-4 text-brand" />
            <span>
              <span className="block text-[13.5px] font-medium leading-tight">CSV</span>
              <span className="block text-[11.5px] text-muted-foreground">Opens in spreadsheets</span>
            </span>
          </RadioCard>
        </RadioGroup>
      </fieldset>

      <div className="mt-6 rounded-[14px] border border-border bg-surface-2/50 p-4" aria-live="polite">
        {phase === "idle" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-muted-foreground">
              {selected.length ? `${selected.length} of ${DATASETS.length} datasets selected · ${format.toUpperCase()}` : "Select at least one dataset to export."}
            </p>
            <Button onClick={prepare} disabled={!selected.length}>
              Prepare export
            </Button>
          </div>
        )}
        {phase === "preparing" && (
          <div>
            <p className="flex items-center gap-2 text-[13px] font-medium">
              <Loader2 className="size-4 animate-spin text-brand" /> Preparing your export…
            </p>
            <Progress value={progress} className="mt-3" aria-label="Export progress" />
          </div>
        )}
        {phase === "ready" && file && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">Export prepared (demo)</p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {file.name} · <span className="tabular">{(file.size / 1024).toFixed(1)} KB</span> · generated in your browser
              </p>
            </div>
            <Button asChild variant="brand">
              <a href={file.url} download={file.name}>
                <Download /> Download
              </a>
            </Button>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

/* --------------------------------------------------------------- privacy */
function useLocalToggles<K extends string>(initial: Record<K, boolean>) {
  const [state, setState] = useState<Record<K, boolean>>(initial);
  const bind = (key: K, label: string) => ({
    checked: state[key],
    onCheckedChange: (v: boolean) => {
      setState((s) => ({ ...s, [key]: v }));
      toast.success(`${label} ${v ? "on" : "off"}`, { description: "Saved for this demo session." });
    },
  });
  return { state, setState, bind };
}

function PrivacySettings() {
  const { bind } = useLocalToggles({ publicProfile: true, showOwned: false, showActivity: false, searchable: true });
  return (
    <SettingsCard id="visibility" icon={Eye} title="Profile visibility" description="Control what other community members can see.">
      <div className="divide-y divide-border">
        <SwitchRow id="pv-public" label="Public community profile" description="Your name and avatar appear next to questions and answers." {...bind("publicProfile", "Public profile")} />
        <SwitchRow id="pv-owned" label="Show products I own" description="Lets others see you're a verified owner when you answer." {...bind("showOwned", "Owned products visibility")} />
        <SwitchRow id="pv-activity" label="Show research activity" description="Display recently saved and compared products on your profile." {...bind("showActivity", "Research activity")} />
        <SwitchRow id="pv-search" label="Appear in community search" description="Others can find your answers by searching your name." {...bind("searchable", "Community search")} />
      </div>
    </SettingsCard>
  );
}

function PersonalisationControls() {
  const { bind } = useLocalToggles({ household: true, space: true, history: true, region: true });
  return (
    <SettingsCard
      id="personalisation"
      icon={SlidersHorizontal}
      title="Personalisation"
      description="Which of your details may re-weight suitability scores. Evidence coverage is never personalised."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href={routes.profile}>Edit details</Link>
        </Button>
      }
    >
      <div className="divide-y divide-border">
        <SwitchRow id="ps-household" label="Use household size" description="Capacity expectations scale with the people you live with." {...bind("household", "Household personalisation")} />
        <SwitchRow id="ps-space" label="Use space measurements" description="Fit checks compare your measurements with each model and its clearances." {...bind("space", "Space personalisation")} />
        <SwitchRow id="ps-history" label="Use research history" description="Saved and viewed products refine recommendations. Never shared with brands." {...bind("history", "Research-history personalisation")} />
        <SwitchRow id="ps-region" label="Use region for availability" description="Hide models not sold in your region and show local pricing." {...bind("region", "Regional personalisation")} />
      </div>
    </SettingsCard>
  );
}

function ConsentPreferences() {
  const { state, setState, bind } = useLocalToggles({ analytics: true, personalisation: true, marketing: false });
  return (
    <SettingsCard id="consent" icon={Cookie} title="Consent preferences" description={`Last updated ${formatDate(DEMO_NOW.toISOString(), "d MMMM yyyy")}. You can change these at any time.`}>
      <div className="divide-y divide-border">
        <SwitchRow id="cs-necessary" label="Strictly necessary" description="Keeps you signed in and remembers your theme and region." checked disabled onCheckedChange={() => undefined} badge={<Badge variant="info">Always on</Badge>} />
        <SwitchRow id="cs-analytics" label="Product analytics" description="Anonymous usage statistics that help improve Qeivo." {...bind("analytics", "Analytics consent")} />
        <SwitchRow id="cs-personalisation" label="Personalisation storage" description="Store preferences that personalise scores and recommendations." {...bind("personalisation", "Personalisation consent")} />
        <SwitchRow id="cs-marketing" label="Marketing communications" description="Feature news from Qeivo. We never sell or share your data with brands." {...bind("marketing", "Marketing consent")} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setState({ analytics: false, personalisation: false, marketing: false });
            toast.success("Optional consent withdrawn", { description: "Only strictly necessary storage remains (demo)." });
          }}
        >
          Reject all optional
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={state.analytics && state.personalisation && state.marketing}
          onClick={() => {
            setState({ analytics: true, personalisation: true, marketing: true });
            toast.success("All optional consent granted (demo)");
          }}
        >
          Accept all
        </Button>
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------- deletion */
function DeletionSection() {
  const resetDemo = useAppStore((s) => s.resetDemo);
  const email = useAppStore((s) => s.profile.email);
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [cleared, setCleared] = useState(false);
  const removed = ["Profile, email and sign-in methods", "Preferences, priorities and space measurements", "Saved products, comparisons, notes and price alerts", "Community questions and answers (anonymised, not removed)", "Invoices are retained for 7 years where tax law requires"];

  return (
    <SettingsCard id="delete" icon={Trash2} title="Delete account" description="Permanently remove your Qeivo account and research history." className="border-danger/30">
      {!requested ? (
        <>
          <ul className="space-y-2">
            {removed.map((r, i) => (
              <li key={r} className="flex items-start gap-2 text-[13.5px]">
                {i < 3 ? <Trash2 className="mt-0.5 size-3.5 shrink-0 text-danger" /> : <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}
                <span className={i < 3 ? undefined : "text-muted-foreground"}>{r}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3 rounded-[12px] bg-danger-soft/60 p-4 sm:flex-row sm:items-center">
            <AlertTriangle className="size-5 shrink-0 text-danger" />
            <p className="flex-1 text-[13px] leading-relaxed text-danger-foreground">Deletion is permanent after a 30-day grace period. Export your data first if you want a copy.</p>
            <Button variant="destructive" onClick={() => setOpen(true)}>
              Delete account…
            </Button>
          </div>
        </>
      ) : (
        <div role="status" className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <Check className="size-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold">Deletion request recorded (demo)</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                Nothing was deleted — there&apos;s no real account behind this demo. In production, {email} would receive a confirmation and the account would close on{" "}
                <strong className="font-medium text-foreground">23 December 2026</strong> unless you signed in again.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setRequested(false);
                setCleared(false);
                toast.success("Deletion request cancelled (demo)");
              }}
            >
              Cancel request
            </Button>
            <Button
              variant="ghost"
              disabled={cleared}
              onClick={() => {
                resetDemo();
                setCleared(true);
                toast.success("Local demo data reset", { description: "This browser's demo state is back to the original seed data." });
              }}
            >
              <RotateCcw /> {cleared ? "Local demo data reset" : "Also reset local demo data"}
            </Button>
          </div>
        </div>
      )}
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete your Qeivo account?"
        description="Your profile, preferences and saved research would be permanently removed after 30 days. This demo won't delete anything real."
        confirmLabel="Delete account"
        destructive
        requireText="DELETE"
        onConfirm={() => {
          setRequested(true);
          toast("Deletion request recorded (demo)", { description: "No data was deleted." });
        }}
      />
    </SettingsCard>
  );
}

export function PrivacyView() {
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingSkeleton variant="detail" />;
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <PrivacySettings />
        <PersonalisationControls />
        <ConsentPreferences />
        <ExportSection />
        <DeletionSection />
      </div>
      <aside className="space-y-4 xl:sticky xl:top-24">
        <div className="rounded-[14px] border border-border bg-card p-5 shadow-xs">
          <span className="grid size-10 place-items-center rounded-[11px] bg-brand-soft text-brand-soft-foreground">
            <Fingerprint className="size-5" />
          </span>
          <h2 className="mt-3 text-[15px] font-semibold">How Qeivo treats your data</h2>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted-foreground">
            <li className="flex gap-2"><Check className="mt-1 size-3.5 shrink-0 text-success" /> Scores and rankings are never sold or influenced by sponsors.</li>
            <li className="flex gap-2"><Check className="mt-1 size-3.5 shrink-0 text-success" /> Brands and retailers never receive your home details.</li>
            <li className="flex gap-2"><Check className="mt-1 size-3.5 shrink-0 text-success" /> Export or delete everything, any time.</li>
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-[12px] text-subtle-foreground">In this demo, all data lives in your browser&apos;s local storage only.</p>
        </div>
      </aside>
    </div>
  );
}
