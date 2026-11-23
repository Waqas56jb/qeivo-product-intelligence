"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Bell, ChevronRight, Download, KeyRound, Laptop, Loader2, LogOut, Monitor, Palette, RotateCcw, Ruler, Shield, Smartphone, Trash2, UserRound, Wrench } from "lucide-react";
import type { RegionCode } from "@/types";
import { routes } from "@/config/routes";
import { currentUser } from "@/data/users/customers";
import { REGIONS, REGION_LIST, formatCurrency } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Slider, UserAvatar } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/tabs";
import { ConfirmationDialog, ThemeToggle } from "@/components/common/controls";
import { LoadingSkeleton } from "@/components/common/states";
import { SectionNavigation } from "@/components/layout/page";
import { DemoPill, Field, PasswordInput, PasswordStrength, SettingsCard, SwitchRow, wait } from "./fields";

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "account", label: "Account" },
];

/* --------------------------------------------------------------- profile */
function ProfileSection() {
  const profile = useAppStore((s) => s.profile);
  const plan = useAppStore((s) => s.plan);
  return (
    <SettingsCard id="profile" icon={UserRound} title="Profile" description="Your name and email as shown across Qeivo.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <UserAvatar src={currentUser.avatar} name={profile.name} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
            {profile.name} <Badge variant={plan === "premium" ? "lime" : "default"}>{plan === "premium" ? "Premium" : "Free"}</Badge>
          </p>
          <p className="truncate text-[13px] text-muted-foreground">{profile.email}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.profile}>
            Edit profile <ChevronRight />
          </Link>
        </Button>
      </div>
    </SettingsCard>
  );
}

/* -------------------------------------------------------------- security */
const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Passwords don't match" })
  .refine((d) => d.next !== d.current, { path: ["next"], message: "New password must differ from the current one" });
type PasswordValues = z.infer<typeof passwordSchema>;

const INITIAL_SESSIONS = [
  { id: "s1", icon: Monitor, device: "Chrome on Windows", place: "Portland, OR, US", when: "Active now", current: true },
  { id: "s2", icon: Smartphone, device: "Qeivo for iOS · iPhone 15", place: "Portland, OR, US", when: "2 hours ago", current: false },
  { id: "s3", icon: Laptop, device: "Safari on macOS", place: "Seattle, WA, US", when: "3 days ago", current: false },
  { id: "s4", icon: Smartphone, device: "Chrome on Android", place: "Vancouver, BC, CA", when: "12 days ago", current: false },
];

function SecuritySection() {
  const [twoStep, setTwoStep] = useState(false);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [confirmAll, setConfirmAll] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { current: "", next: "", confirm: "" }, mode: "onTouched" });
  const nextPw = watch("next");

  const onSubmit = async () => {
    await wait(600);
    reset();
    toast.success("Password change validated (demo)", { description: "There's no real account, so nothing was stored or changed." });
  };

  const others = sessions.filter((s) => !s.current);

  return (
    <SettingsCard id="security" icon={Shield} title="Security" description="Password, two-step verification and signed-in devices.">
      <div className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <h3 className="flex items-center gap-2 text-[14px] font-semibold">
            <KeyRound className="size-4 text-muted-foreground" /> Change password
          </h3>
          <input type="text" name="username" autoComplete="username" value={currentUser.email} readOnly hidden />
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="st-current" label="Current password" error={errors.current?.message} className="md:col-span-2 md:max-w-[calc(50%-0.5rem)]">
              <PasswordInput autoComplete="current-password" {...register("current")} />
            </Field>
            <Field id="st-next" label="New password" error={errors.next?.message}>
              <PasswordInput autoComplete="new-password" {...register("next")} />
            </Field>
            <Field id="st-confirm" label="Confirm new password" error={errors.confirm?.message}>
              <PasswordInput autoComplete="new-password" {...register("confirm")} />
            </Field>
          </div>
          <PasswordStrength value={nextPw} className="md:max-w-[calc(50%-0.5rem)]" />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />} Update password
            </Button>
          </div>
        </form>

        <div className="border-t border-border pt-6">
          <SwitchRow
            id="st-2fa"
            label="Two-step verification"
            badge={twoStep ? <Badge variant="success">On</Badge> : <Badge variant="outline">Off</Badge>}
            description="Ask for a code from an authenticator app when signing in on a new device."
            checked={twoStep}
            onCheckedChange={(v) => {
              setTwoStep(v);
              toast.success(v ? "Two-step verification turned on (demo)" : "Two-step verification turned off (demo)", {
                description: v ? "No authenticator was linked — this is a presentation of the setting only." : "Sign-in would only require your password.",
              });
            }}
          />
        </div>

        <div className="border-t border-border pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[14px] font-semibold">Active sessions</h3>
            <Button variant="outline" size="sm" disabled={!others.length} onClick={() => setConfirmAll(true)}>
              <LogOut /> Sign out all other sessions
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-[12px] border border-border">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
                  <s.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
                    {s.device} {s.current && <Badge variant="brand">This device</Badge>}
                  </p>
                  <p className="text-[12.5px] text-muted-foreground">
                    {s.place} · {s.when}
                  </p>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 shrink-0 sm:h-8"
                    onClick={() => {
                      setSessions((list) => list.filter((x) => x.id !== s.id));
                      toast.success("Session signed out (demo)", { description: `${s.device} — no real device was affected.` });
                    }}
                  >
                    Sign out
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmationDialog
        open={confirmAll}
        onOpenChange={setConfirmAll}
        title="Sign out of all other sessions?"
        description={`${others.length} other ${others.length === 1 ? "session" : "sessions"} would need to sign in again. This device stays signed in.`}
        confirmLabel="Sign out others"
        onConfirm={() => {
          setSessions((list) => list.filter((x) => x.current));
          toast.success("Other sessions signed out (demo)", { description: "No real devices were affected." });
        }}
      />
    </SettingsCard>
  );
}

/* ----------------------------------------------------------- preferences */
function PreferencesSection() {
  const region = useAppStore((s) => s.region);
  const setRegion = useAppStore((s) => s.setRegion);
  const [units, setUnits] = useState<"mm" | "cm" | "in">("mm");
  const r = REGIONS[region];
  return (
    <SettingsCard id="preferences" icon={Ruler} title="Regional preferences" description="Currency, retailer prices and measurement units.">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="st-region">Region & currency</Label>
          <Select
            value={region}
            onValueChange={(v) => {
              setRegion(v as RegionCode);
              toast.success(`Region set to ${REGIONS[v as RegionCode].name}`, { description: `Prices now show in ${REGIONS[v as RegionCode].currency}.` });
            }}
          >
            <SelectTrigger id="st-region" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGION_LIST.map((x) => (
                <SelectItem key={x.code} value={x.code}>
                  <span aria-hidden>{x.flag}</span> {x.name} <span className="text-subtle-foreground">{x.currency}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[12.5px] text-muted-foreground">
            Example: a {formatCurrency(1999, "US")} fridge shows as <span className="tabular font-medium text-foreground">{formatCurrency(Math.round(1999 * r.priceFactor), region)}</span>.
          </p>
        </div>
        <div className="space-y-2">
          <Label id="st-units-label">Measurement units</Label>
          <ToggleGroup
            type="single"
            value={units}
            onValueChange={(v) => {
              if (!v) return;
              setUnits(v as typeof units);
              toast.success(`Units set to ${v}`, { description: "Saved for this session (demo)." });
            }}
            aria-labelledby="st-units-label"
            className="grid w-full grid-cols-3"
          >
            {(["mm", "cm", "in"] as const).map((u) => (
              <ToggleGroupItem key={u} value={u} className="h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground sm:h-9">
                {u === "mm" ? "Millimetres" : u === "cm" ? "Centimetres" : "Inches"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-[12.5px] text-muted-foreground">
            A 900 mm opening reads as <span className="tabular font-medium text-foreground">{units === "mm" ? "900 mm" : units === "cm" ? "90 cm" : "35.4 in"}</span>.
          </p>
        </div>
      </div>
    </SettingsCard>
  );
}

/* --------------------------------------------------------- notifications */
function NotificationsSection() {
  const alertPrefs = useAppStore((s) => s.alertPrefs);
  const setAlertPrefs = useAppStore((s) => s.setAlertPrefs);
  const [local, setLocal] = useState({ digest: true, community: true, dataUpdates: true, marketing: false });
  const flip = (key: keyof typeof local, label: string) => (v: boolean) => {
    setLocal((l) => ({ ...l, [key]: v }));
    toast.success(`${label} ${v ? "on" : "off"}`, { description: "Saved for this demo session." });
  };
  return (
    <SettingsCard id="notifications" icon={Bell} title="Notifications" description="Choose what Qeivo tells you about, and how.">
      <div className="divide-y divide-border">
        <SwitchRow
          id="nt-email"
          label="Price alerts by email"
          description="When a watched product drops below your target price."
          checked={alertPrefs.email}
          onCheckedChange={(v) => {
            setAlertPrefs({ email: v });
            toast.success(`Email price alerts ${v ? "on" : "off"}`, { description: "Demo — no emails are ever sent." });
          }}
        />
        <SwitchRow
          id="nt-push"
          label="Price alerts in the app"
          description="Shown in the notification centre and on mobile."
          checked={alertPrefs.push}
          onCheckedChange={(v) => {
            setAlertPrefs({ push: v });
            toast.success(`In-app price alerts ${v ? "on" : "off"}`);
          }}
        />
        <div className="py-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="nt-threshold">Minimum price drop to alert</Label>
            <span className="tabular text-[14px] font-semibold">{alertPrefs.threshold}%</span>
          </div>
          <Slider
            id="nt-threshold"
            className="mt-2"
            min={1}
            max={25}
            step={1}
            value={[alertPrefs.threshold]}
            onValueChange={(v) => setAlertPrefs({ threshold: v[0] })}
            onValueCommit={(v) => toast.success(`Alert threshold set to ${v[0]}%`)}
            aria-label="Minimum price drop percentage"
          />
          <p className="text-[12.5px] text-muted-foreground">Smaller drops are still recorded in price history.</p>
        </div>
        <SwitchRow id="nt-digest" label="Weekly research digest" description="New evidence and score changes for products you saved." checked={local.digest} onCheckedChange={flip("digest", "Weekly digest")} />
        <SwitchRow id="nt-community" label="Community replies" description="Answers to your questions and mentions." checked={local.community} onCheckedChange={flip("community", "Community replies")} />
        <SwitchRow id="nt-data" label="Product data updates" description="When a saved product's specs, sources or evidence coverage change." checked={local.dataUpdates} onCheckedChange={flip("dataUpdates", "Product data updates")} />
        <SwitchRow id="nt-safety" label="Safety recalls & firmware notices" description="Always on for products you own — these can't be switched off." checked disabled onCheckedChange={() => undefined} badge={<Badge variant="info">Required</Badge>} />
        <SwitchRow id="nt-marketing" label="Product news from Qeivo" description="Occasional updates about new features. Never from brands or retailers." checked={local.marketing} onCheckedChange={flip("marketing", "Product news")} />
      </div>
    </SettingsCard>
  );
}

/* ------------------------------------------------------------ appearance */
function AppearanceSection() {
  return (
    <SettingsCard id="appearance" icon={Palette} title="Appearance" description="Use light, dark, or follow your device setting.">
      <ThemeToggle variant="segmented" />
      <p className="mt-3 text-[12.5px] text-muted-foreground">Saved on this device. Charts, score rings and claim colours adapt to both themes.</p>
    </SettingsCard>
  );
}

/* ------------------------------------------------------- account manage */
function AccountSection() {
  const resetDemo = useAppStore((s) => s.resetDemo);
  const [confirmReset, setConfirmReset] = useState(false);
  const rows = [
    { icon: Download, title: "Export your data", body: "Download profile, preferences, saved research and settings as JSON or CSV.", href: `${routes.privacy}#export`, cta: "Export data", variant: "outline" as const },
    { icon: Trash2, title: "Delete account", body: "Permanently remove your account and research history. Review what's deleted first.", href: `${routes.privacy}#delete`, cta: "Review deletion", variant: "outline" as const, danger: true },
  ];
  return (
    <SettingsCard id="account" icon={Wrench} title="Account management" description="Data portability, deletion and demo controls.">
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.title} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center">
            <r.icon className={r.danger ? "size-5 shrink-0 text-danger" : "size-5 shrink-0 text-muted-foreground"} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{r.title}</p>
              <p className="text-[13px] text-muted-foreground">{r.body}</p>
            </div>
            <Button asChild variant={r.variant} className={r.danger ? "border-danger/40 text-danger-foreground hover:bg-danger-soft" : undefined}>
              <Link href={r.href}>{r.cta}</Link>
            </Button>
          </li>
        ))}
        <li className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
          <RotateCcw className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[14px] font-medium">
              Reset demo data <DemoPill />
            </p>
            <p className="text-[13px] text-muted-foreground">Restore saved products, watchlist, plan and preferences to the original seed state.</p>
          </div>
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            Reset demo
          </Button>
        </li>
      </ul>
      <ConfirmationDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all demo data?"
        description="Saved products, compare list, watchlist, notes, plan, onboarding and preferences return to the seed state in this browser."
        confirmLabel="Reset demo data"
        destructive
        onConfirm={() => {
          resetDemo();
          toast.success("Demo data reset", { description: "Everything is back to the original seed state." });
        }}
      />
    </SettingsCard>
  );
}

export function SettingsView() {
  const hydrated = useHydrated();
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:gap-10">
      <div className="sticky top-14 z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-24 lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <SectionNavigation sections={SECTIONS} />
      </div>
      {hydrated ? (
        <div className="min-w-0 space-y-6">
          <ProfileSection />
          <SecuritySection />
          <PreferencesSection />
          <NotificationsSection />
          <AppearanceSection />
          <AccountSection />
        </div>
      ) : (
        <LoadingSkeleton variant="detail" />
      )}
    </div>
  );
}
