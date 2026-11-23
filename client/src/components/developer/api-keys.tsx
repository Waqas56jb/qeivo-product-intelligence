"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Ban, KeyRound, MoreHorizontal, Plus, RefreshCw, ShieldAlert } from "lucide-react";
import type { ApiKey } from "@/types";
import { apiScopes } from "@/data/api/keys";
import { cn } from "@/lib/utils";
import { formatDate, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox, Label, RadioCard, RadioGroup } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/common/controls";
import { EnvBadge, QuotaMeter, ScopeChips } from "./api-bits";
import { CopyButton } from "./code-block";
import { keyLabel, keyUsage } from "./dev-data";
import { useApiKeyStore } from "./api-key-store";

const LIMITS = [1000, 5000, 10000, 25000, 50000] as const;

const schema = z.object({
  name: z.string().trim().min(3, "Name the key so you can recognise it later (3+ characters).").max(48, "Keep the name under 48 characters."),
  scopes: z.array(z.string()).min(1, "Choose at least one scope."),
  environment: z.enum(["live", "test"]),
  monthlyLimit: z.number().int().positive(),
});
type KeyForm = z.infer<typeof schema>;

/** Shown once after create/rotate. Only a masked placeholder exists — there is no real secret. */
export function NewKeyReveal({ value, onDone }: { value: string; onDone: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-[12px] border border-warning/30 bg-warning-soft/60 p-3 text-[13px] leading-relaxed text-warning-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Copy this key now — it won’t be shown again. <span className="opacity-80">In this demo the key is a masked placeholder; no working credential is generated.</span>
        </p>
      </div>
      <div className="flex min-w-0 items-center gap-1 rounded-[12px] bg-navy-950 py-1 pl-4 pr-1">
        <code className="scrollbar-none min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 font-mono text-[13px] text-teal-400" data-testid="new-key">
          {value}
        </code>
        <CopyButton value={value} label="Copy key" toastMessage="Masked demo key copied" />
      </div>
      <DialogFooter>
        <Button variant="brand" onClick={onDone} className="h-11 sm:h-10">
          I’ve stored it safely
        </Button>
      </DialogFooter>
    </div>
  );
}

export function CreateKeyDialog({ trigger }: { trigger?: (open: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const create = useApiKeyStore((s) => s.create);
  const { register, handleSubmit, control, formState, reset, watch } = useForm<KeyForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", scopes: ["products:read"], environment: "test", monthlyLimit: 5000 },
  });
  const e = formState.errors;
  const env = watch("environment");
  const close = (o: boolean) => {
    setOpen(o);
    if (!o) {
      reset();
      setCreated(null);
    }
  };

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <Button variant="brand" onClick={() => setOpen(true)}>
          <Plus /> Create key
        </Button>
      )}
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{created ? "Your new API key" : "Create API key"}</DialogTitle>
            <DialogDescription>{created ? "Store it in your secrets manager, then close this dialog." : "Grant only the scopes the integration needs. Keys can be rotated or revoked at any time."}</DialogDescription>
          </DialogHeader>
          {created ? (
            <NewKeyReveal value={created} onDone={() => close(false)} />
          ) : (
            <form
              noValidate
              className="space-y-5"
              onSubmit={handleSubmit((v) => {
                const { masked } = create(v);
                setCreated(masked);
                toast.success("API key created", { description: `${v.name} · ${v.environment === "live" ? "Live" : "Test"} environment (demo)` });
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="key-name">Key name</Label>
                <Input id="key-name" placeholder="e.g. Asset register sync" autoComplete="off" aria-invalid={!!e.name} aria-describedby="key-name-err" {...register("name")} />
                {e.name && (
                  <p id="key-name-err" role="alert" className="text-[12px] text-danger-foreground">
                    {e.name.message}
                  </p>
                )}
              </div>
              <fieldset className="space-y-2">
                <legend className="mb-2 text-[13px] font-medium">Environment</legend>
                <Controller
                  control={control}
                  name="environment"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid-cols-2">
                      <RadioCard value="test" aria-label="Test environment" className="p-3">
                        <span>
                          <span className="block text-[13px] font-semibold">Test</span>
                          <span className="block text-[12px] text-muted-foreground">Sandbox data, free</span>
                        </span>
                      </RadioCard>
                      <RadioCard value="live" aria-label="Live environment" className="p-3">
                        <span>
                          <span className="block text-[13px] font-semibold">Live</span>
                          <span className="block text-[12px] text-muted-foreground">Counts toward quota</span>
                        </span>
                      </RadioCard>
                    </RadioGroup>
                  )}
                />
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-[13px] font-medium">Scopes</legend>
                <Controller
                  control={control}
                  name="scopes"
                  render={({ field }) => (
                    <div className="divide-y divide-border rounded-[12px] border border-border">
                      {apiScopes.map((s) => {
                        const checked = field.value.includes(s.scope);
                        return (
                          <label key={s.scope} className={cn("flex min-h-12 cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors first:rounded-t-[12px] last:rounded-b-[12px] hover:bg-surface-2/60", checked && "bg-brand-soft/30")}>
                            <Checkbox className="mt-0.5" checked={checked} onCheckedChange={(v) => field.onChange(v ? [...field.value, s.scope] : field.value.filter((x) => x !== s.scope))} aria-label={s.scope} />
                            <span className="min-w-0">
                              <span className="block font-mono text-[12.5px] font-medium">{s.scope}</span>
                              <span className="block text-[12px] text-muted-foreground">{s.description}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                {e.scopes && (
                  <p role="alert" className="mt-2 text-[12px] text-danger-foreground">
                    {e.scopes.message}
                  </p>
                )}
              </fieldset>
              <div className="space-y-2">
                <Label htmlFor="key-limit">Monthly request limit</Label>
                <Controller
                  control={control}
                  name="monthlyLimit"
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger id="key-limit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIMITS.map((l) => (
                          <SelectItem key={l} value={String(l)}>
                            {l.toLocaleString("en-US")} requests / month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-[12px] text-subtle-foreground">{env === "live" ? "Requests beyond the limit return 429 for this key only." : "Test keys never count toward the organisation quota."}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => close(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand">
                  <KeyRound /> Create key
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** One API key: desktop row + mobile card from the same markup. */
export function ApiKeyRow({ k }: { k: ApiKey }) {
  const rotate = useApiKeyStore((s) => s.rotate);
  const revoke = useApiKeyStore((s) => s.revoke);
  const [confirm, setConfirm] = useState<"revoke" | "rotate" | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  const revoked = k.status === "revoked";

  return (
    <li className={cn("grid gap-x-5 gap-y-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1fr)_140px_44px] lg:items-center", revoked && "bg-surface-2/40")} data-key-id={k.id}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("flex flex-wrap items-center gap-2 text-[14px] font-semibold", revoked && "text-muted-foreground")}>
            <span className="truncate">{k.name}</span>
            <EnvBadge env={k.environment} />
            {revoked && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-danger-soft px-2 text-[11px] font-semibold text-danger-foreground">
                <Ban className="size-3" /> Revoked
              </span>
            )}
          </p>
          <p className="mt-1 font-mono text-[12px] text-muted-foreground">{keyLabel(k)}</p>
        </div>
        <div className="lg:hidden">
          <KeyMenu revoked={revoked} name={k.name} onRotate={() => setConfirm("rotate")} onRevoke={() => setConfirm("revoke")} />
        </div>
      </div>
      <ScopeChips scopes={k.scopes} />
      <dl className="grid grid-cols-2 gap-3 text-[12px] lg:grid-cols-1 lg:gap-1">
        <div>
          <dt className="text-subtle-foreground lg:sr-only">Created</dt>
          <dd className="tabular">
            <span className="hidden text-subtle-foreground lg:inline">Created </span>
            {formatDate(k.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-subtle-foreground lg:sr-only">Last used</dt>
          <dd className="tabular text-muted-foreground">{k.lastUsed ? <time dateTime={k.lastUsed} title={formatDate(k.lastUsed, "d MMM yyyy, HH:mm")}>Used {formatRelative(k.lastUsed)}</time> : "Never used"}</dd>
        </div>
      </dl>
      {revoked ? <p className="text-[12px] text-subtle-foreground">No longer accepts requests</p> : <QuotaMeter used={keyUsage(k)} limit={k.monthlyLimit} />}
      <div className="hidden justify-self-end lg:block">
        <KeyMenu revoked={revoked} name={k.name} onRotate={() => setConfirm("rotate")} onRevoke={() => setConfirm("revoke")} />
      </div>

      <ConfirmationDialog
        open={confirm === "revoke"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Revoke “${k.name}”?`}
        description="Requests using this key will fail with 401 immediately. This can’t be undone — you’ll need to create a new key."
        confirmLabel="Revoke key"
        destructive
        requireText={k.name}
        onConfirm={() => {
          revoke(k.id);
          toast.success("Key revoked", { description: `${k.name} can no longer make requests (demo).` });
        }}
      />
      <ConfirmationDialog
        open={confirm === "rotate"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Rotate “${k.name}”?`}
        description="A new key is issued with the same scopes and limit. In production the old key keeps working for 24 hours so you can deploy the new one."
        confirmLabel="Rotate key"
        onConfirm={() => {
          const v = rotate(k.id);
          setRevealed(v);
          toast.success("Key rotated", { description: "Copy the new key now — it’s shown once." });
        }}
      />
      <Dialog open={revealed !== null} onOpenChange={(o) => !o && setRevealed(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New key for {k.name}</DialogTitle>
            <DialogDescription>Same scopes and limits as before.</DialogDescription>
          </DialogHeader>
          {revealed && <NewKeyReveal value={revealed} onDone={() => setRevealed(null)} />}
        </DialogContent>
      </Dialog>
    </li>
  );
}

function KeyMenu({ revoked, name, onRotate, onRevoke }: { revoked: boolean; name: string; onRotate: () => void; onRevoke: () => void }) {
  if (revoked)
    return (
      <span className="grid size-10 place-items-center text-subtle-foreground" title="Revoked keys can’t be changed">
        <ShieldAlert className="size-4" />
      </span>
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 sm:size-10" aria-label={`Actions for ${name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onRotate}>
          <RefreshCw /> Rotate key
        </DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={onRevoke}>
          <Ban /> Revoke key
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
