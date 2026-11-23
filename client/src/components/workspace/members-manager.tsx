"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Crown, Mail, Minus, MoreHorizontal, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import type { WorkspaceMember } from "@/types";
import { currentWorkspace } from "@/data/workspaces/workspaces";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label, Progress, UserAvatar } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmationDialog, FilterChip, SearchField } from "@/components/common/controls";
import { EmptyState } from "@/components/common/states";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { PanelHeader } from "./project-bits";
import { CURRENT_MEMBER_ID, useWorkspaceStore } from "./workspace-store";

type Role = WorkspaceMember["role"];
const ROLES: Role[] = ["Owner", "Admin", "Researcher", "Approver", "Viewer"];
const ASSIGNABLE = ["Admin", "Researcher", "Approver", "Viewer"] as const;

const ROLE_INFO: Record<Role, string> = {
  Owner: "Full control, including billing and deleting the workspace",
  Admin: "Manages members, billing and every project",
  Researcher: "Creates projects, builds shortlists and writes notes",
  Approver: "Signs off shortlists and budgets",
  Viewer: "Read-only access to projects and research",
};

const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: "View projects & research", roles: ["Owner", "Admin", "Researcher", "Approver", "Viewer"] },
  { label: "Comment on projects", roles: ["Owner", "Admin", "Researcher", "Approver", "Viewer"] },
  { label: "Create projects & shortlists", roles: ["Owner", "Admin", "Researcher"] },
  { label: "Add notes & snapshots", roles: ["Owner", "Admin", "Researcher"] },
  { label: "Approve or request changes", roles: ["Owner", "Admin", "Approver"] },
  { label: "Invite & manage members", roles: ["Owner", "Admin"] },
  { label: "Manage billing & invoices", roles: ["Owner", "Admin"] },
  { label: "Create API keys", roles: ["Owner", "Admin"] },
  { label: "Delete workspace", roles: ["Owner"] },
];

const ROLE_VARIANT: Record<Role, "solid" | "brand" | "info" | "warning" | "default"> = {
  Owner: "solid",
  Admin: "brand",
  Researcher: "info",
  Approver: "warning",
  Viewer: "default",
};

function InviteDialog({ open, onOpenChange, seatsLeft }: { open: boolean; onOpenChange: (o: boolean) => void; seatsLeft: number }) {
  const members = useWorkspaceStore((s) => s.members);
  const invite = useWorkspaceStore((s) => s.inviteMember);
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, "Enter their full name.").max(60, "Keep the name under 60 characters."),
        email: z
          .string()
          .trim()
          .toLowerCase()
          .pipe(z.email("Enter a valid work email address."))
          .refine((v) => !members.some((m) => m.email.toLowerCase() === v), "This person is already in the workspace."),
        role: z.enum(ASSIGNABLE, { message: "Choose a role." }),
        title: z.string().trim().max(60, "Keep the job title under 60 characters."),
        message: z.string().trim().max(280, "Keep the message under 280 characters."),
      }),
    [members],
  );
  type V = z.infer<typeof schema>;
  const { register, handleSubmit, control, formState, reset, watch } = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", role: "Researcher", title: "", message: "" } });
  const e = formState.errors;
  const role = watch("role");
  const close = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            {seatsLeft} of {currentWorkspace.seats} seats available. Invites are simulated — no email is sent in this demo.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((v) => {
            invite({ name: v.name, email: v.email, role: v.role, title: v.title || "Invited member" });
            toast.success(`Invitation prepared for ${v.name}`, { description: `${v.email} · ${v.role}. Demo only — no email was sent.` });
            close(false);
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Full name</Label>
              <Input id="inv-name" autoComplete="off" placeholder="Jordan Lee" aria-invalid={!!e.name} aria-describedby="inv-name-err" {...register("name")} />
              {e.name && <p id="inv-name-err" role="alert" className="text-[12px] text-danger-foreground">{e.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-title">Job title <span className="font-normal text-subtle-foreground">(optional)</span></Label>
              <Input id="inv-title" autoComplete="off" placeholder="Asset Manager" aria-invalid={!!e.title} {...register("title")} />
              {e.title && <p role="alert" className="text-[12px] text-danger-foreground">{e.title.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-email">Work email</Label>
            <Input id="inv-email" type="email" autoComplete="off" placeholder="jordan.lee@harborpg.example" aria-invalid={!!e.email} aria-describedby="inv-email-err" {...register("email")} />
            {e.email && <p id="inv-email-err" role="alert" className="text-[12px] text-danger-foreground">{e.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-role">Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="inv-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-[12px] text-muted-foreground">{ROLE_INFO[role]}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-msg">Personal message <span className="font-normal text-subtle-foreground">(optional)</span></Label>
            <Textarea id="inv-msg" className="min-h-20" placeholder="Joining to help with the Cedar Court refurbishment." aria-invalid={!!e.message} {...register("message")} />
            {e.message && <p role="alert" className="text-[12px] text-danger-foreground">{e.message.message}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand">
              <Mail /> Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({ m, onRemove }: { m: WorkspaceMember; onRemove: () => void }) {
  const setRole = useWorkspaceStore((s) => s.setRole);
  const isOwner = m.role === "Owner";
  const isMe = m.id === CURRENT_MEMBER_ID;
  const invited = !m.lastActive;
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3.5 sm:px-5 md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_170px_44px]">
      <UserAvatar src={m.avatar || undefined} name={m.name} className="size-10" />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-semibold">
          <span className="truncate">{m.name}</span>
          {isMe && <Badge variant="outline">You</Badge>}
          {invited && <Badge variant="warning">Invite pending</Badge>}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">{m.email}</p>
      </div>
      <div className="col-span-2 col-start-2 row-start-2 min-w-0 md:col-span-1 md:col-start-3 md:row-start-1">
        <p className="truncate text-[13px]">{m.title}</p>
        <p className="text-[12px] text-subtle-foreground">{invited ? "Not joined yet" : `Active ${formatRelative(m.lastActive)}`}</p>
      </div>
      <div className="col-span-2 col-start-2 row-start-3 md:col-span-1 md:col-start-4 md:row-start-1">
        {isOwner ? (
          <span className="flex h-11 items-center gap-1.5 px-1 text-[13px] font-medium sm:h-9">
            <Crown className="size-4 text-warning" /> Owner
          </span>
        ) : (
          <Select
            value={m.role}
            onValueChange={(v) => {
              setRole(m.id, v as Role);
              toast.success(`${m.name} is now ${v === "Admin" ? "an" : "a"} ${v}`, { description: "Role change saved in this demo session." });
            }}
            disabled={isMe}
          >
            <SelectTrigger className="h-11 w-full sm:h-9" aria-label={`Role for ${m.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="col-start-3 row-start-1 justify-self-end md:col-start-5">
        {!isOwner && !isMe ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11 sm:size-10" aria-label={`Actions for ${m.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {invited && (
                <DropdownMenuItem onSelect={() => toast("Invite re-sent (demo)", { description: `No email was actually sent to ${m.email}.` })}>
                  <Mail /> Resend invite
                </DropdownMenuItem>
              )}
              <DropdownMenuItem destructive onSelect={onRemove}>
                <Trash2 /> {invited ? "Cancel invite" : "Remove from workspace"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="block size-10" aria-hidden />
        )}
      </div>
    </li>
  );
}

export function MembersManager() {
  const members = useWorkspaceStore((s) => s.members);
  const remove = useWorkspaceStore((s) => s.removeMember);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<WorkspaceMember | null>(null);
  const [q, setQ] = useState("");
  const [role, setRoleFilter] = useState<Role | "all">("all");
  const seats = currentWorkspace.seats;
  const used = members.length;
  const left = Math.max(0, seats - used);

  const list = members.filter((m) => (role === "all" || m.role === role) && `${m.name} ${m.email} ${m.title}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Harbor Property Group"
        title="Members & roles"
        description="Control who can research, approve and manage billing. Roles apply across every project in the workspace."
        actions={
          <Button
            variant="brand"
            onClick={() => {
              if (left === 0) {
                toast.error("No seats available", { description: "Add seats on the Org billing page before inviting more people." });
                return;
              }
              setInviteOpen(true);
            }}
          >
            <UserPlus /> Invite member
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] border border-border bg-card p-4 shadow-xs sm:col-span-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">Seats used</span>
            <span className="text-[13px] font-semibold tabular">
              {used} / {seats}
            </span>
          </div>
          <Progress value={(used / seats) * 100} className="mt-3" indicatorClassName={left === 0 ? "bg-warning" : undefined} aria-label="Seats used" />
          <p className="mt-2 text-[12px] text-subtle-foreground">{left ? `${left} seat${left > 1 ? "s" : ""} left on the Team plan` : "All seats in use"}</p>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-4 shadow-xs">
          <span className="grid size-9 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
            <Users className="size-4" />
          </span>
          <div>
            <p className="text-[22px] font-semibold leading-none tabular">{members.filter((m) => m.lastActive).length}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Active members · {members.filter((m) => !m.lastActive).length} pending</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-4 shadow-xs">
          <span className="grid size-9 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-[22px] font-semibold leading-none tabular">{members.filter((m) => m.role === "Approver" || m.role === "Owner" || m.role === "Admin").length}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">People who can approve purchases</p>
          </div>
        </div>
      </div>

      <section aria-labelledby="member-list" className="mt-6 rounded-[14px] border border-border bg-card shadow-xs">
        <PanelHeader id="member-list" title="Members" description={`${members.length} people`} />
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5 lg:flex-row lg:items-center">
          <SearchField value={q} onChange={setQ} placeholder="Search name, email or title…" className="w-full lg:w-80" />
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <FilterChip active={role === "all"} onClick={() => setRoleFilter("all")} count={members.length}>
              All
            </FilterChip>
            {ROLES.map((r) => (
              <FilterChip key={r} active={role === r} onClick={() => setRoleFilter(r)} count={members.filter((m) => m.role === r).length}>
                {r}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="hidden grid-cols-[40px_minmax(0,1.4fr)_minmax(0,1fr)_170px_44px] gap-x-3 border-b border-border bg-surface-2/50 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-subtle-foreground md:grid">
          <span />
          <span>Member</span>
          <span>Title & activity</span>
          <span>Role</span>
          <span className="sr-only">Actions</span>
        </div>
        {list.length ? (
          <ul className="divide-y divide-border">
            {list.map((m) => (
              <MemberRow key={m.id} m={m} onRemove={() => setRemoving(m)} />
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState compact title="No members match" description="Try a different name or role." />
          </div>
        )}
      </section>

      <section aria-labelledby="permissions" className="mt-6 rounded-[14px] border border-border bg-card shadow-xs">
        <PanelHeader id="permissions" icon={ShieldCheck} title="Roles & permissions" description="What each role can do. Scores and verdicts can never be edited by any role." />
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <caption className="sr-only">Permissions by role</caption>
            <thead>
              <tr className="border-b border-border bg-surface-2/50">
                <th scope="col" className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="px-3 py-3 text-center">
                    <Badge variant={ROLE_VARIANT[r]}>{r}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.label} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-3 text-left font-medium">{p.label}</th>
                  {ROLES.map((r) => (
                    <td key={r} className="px-3 py-3 text-center">
                      {p.roles.includes(r) ? (
                        <span className="inline-grid size-6 place-items-center rounded-full bg-success-soft text-success">
                          <Check className="size-3.5" strokeWidth={3} />
                          <span className="sr-only">Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-grid size-6 place-items-center text-subtle-foreground/60">
                          <Minus className="size-3.5" />
                          <span className="sr-only">Not allowed</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-5">
          {ROLES.map((r) => (
            <li key={r} className="space-y-1.5">
              <Badge variant={ROLE_VARIANT[r]}>{r}</Badge>
              <p className={cn("text-[12px] leading-relaxed text-muted-foreground")}>{ROLE_INFO[r]}</p>
            </li>
          ))}
        </ul>
      </section>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} seatsLeft={left} />
      <ConfirmationDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={removing && !removing.lastActive ? `Cancel invite for ${removing.name}?` : `Remove ${removing?.name ?? "member"}?`}
        description={removing?.lastActive ? "They will lose access to all projects immediately. Their notes, comments and approvals stay on each project." : "The invitation link will stop working."}
        confirmLabel={removing?.lastActive ? "Remove member" : "Cancel invite"}
        destructive
        onConfirm={() => {
          if (!removing) return;
          remove(removing.id);
          toast.success(`${removing.name} removed`, { description: "Seat freed up · demo change only." });
        }}
      />
    </PageContainer>
  );
}
